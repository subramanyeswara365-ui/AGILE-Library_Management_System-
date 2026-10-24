package com.lms.service;

import com.lms.entity.*;
import com.lms.repository.BookRepository;
import com.lms.repository.BorrowRecordRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final FineService fineService;
    private final NotificationService notificationService;

    @Value("${lms.borrow.default-days:14}")
    private int defaultBorrowDays;

    @Value("${lms.borrow.max-active-loans:3}")
    private int maxActiveLoans;

    @Value("${lms.borrow.max-renewals:2}")
    private int maxRenewals;

    @Transactional
    public BorrowRecord borrowBook(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        // Check active loans
        long activeCount = borrowRecordRepository.countByUserIdAndStatusIn(
                userId, List.of(BorrowStatus.BORROWED, BorrowStatus.OVERDUE)
        );
        if (activeCount >= maxActiveLoans) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Borrow limit exceeded. Maximum " + maxActiveLoans + " active borrowed books permitted per student.");
        }

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found"));

        if (book.getAvailableCopies() == null || book.getAvailableCopies() <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book '" + book.getTitle() + "' is currently out of stock.");
        }

        // Decrement available copies
        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime dueDate = now.plusDays(defaultBorrowDays);

        BorrowRecord record = BorrowRecord.builder()
                .user(user)
                .book(book)
                .borrowDate(now)
                .dueDate(dueDate)
                .status(BorrowStatus.BORROWED)
                .renewalCount(0)
                .fineAmount(0.0)
                .finePaid(false)
                .build();

        BorrowRecord saved = borrowRecordRepository.save(record);

        // Notify student
        notificationService.sendNotification(
                user.getId(),
                "Book Borrowed Successfully",
                "You have borrowed '" + book.getTitle() + "'. Return due date is " + dueDate.toLocalDate() + ".",
                NotificationType.GENERAL
        );

        return saved;
    }

    @Transactional
    public BorrowRecord borrowByQr(Long userId, String qrContent) {
        if (qrContent == null || qrContent.trim().isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Empty QR code data.");
        }
        String clean = qrContent.trim();
        Long bookId = null;

        // Formats supported: "LMS:BOOK:3", "3", or JSON {"bookId": 3}
        if (clean.startsWith("LMS:BOOK:")) {
            try {
                bookId = Long.parseLong(clean.substring("LMS:BOOK:".length()).trim());
            } catch (NumberFormatException ignored) {}
        } else if (clean.matches("^\\d+$")) {
            bookId = Long.parseLong(clean);
        } else if (clean.contains("\"bookId\"")) {
            try {
                int idx = clean.indexOf("\"bookId\":");
                String sub = clean.substring(idx + 9).replaceAll("[^0-9]", "");
                bookId = Long.parseLong(sub);
            } catch (Exception ignored) {}
        }

        if (bookId == null) {
            // Try resolving by ISBN
            Book byIsbn = bookRepository.findByIsbn(clean).orElse(null);
            if (byIsbn != null) {
                bookId = byIsbn.getId();
            }
        }

        if (bookId == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Unrecognized QR code format. Please scan a valid library book QR code.");
        }

        return borrowBook(userId, bookId);
    }

    @Transactional
    public BorrowRecord returnBook(Long userId, Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Borrow record not found"));

        if (!record.getUser().getId().equals(userId)) {
            // Allow admin to return
            User cur = userRepository.findById(userId).orElse(null);
            if (cur == null || (cur.getRole() != Role.ADMIN && cur.getRole() != Role.LIBRARIAN)) {
                throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to return this record.");
            }
        }

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book has already been returned.");
        }

        LocalDateTime now = LocalDateTime.now();
        record.setReturnDate(now);
        record.setStatus(BorrowStatus.RETURNED);

        // Compute fine
        double fine = fineService.calculateFine(record.getDueDate(), now);
        record.setFineAmount(fine);
        if (fine <= 0.0) {
            record.setFinePaid(true);
        }

        // Increment book copies
        Book book = record.getBook();
        book.setAvailableCopies(Math.min(book.getTotalCopies(), book.getAvailableCopies() + 1));
        bookRepository.save(book);

        BorrowRecord saved = borrowRecordRepository.save(record);

        // Send return notification
        String msg = fine > 0
                ? "You have returned '" + book.getTitle() + "' with an overdue fine of ₹" + fine + ". Please pay online."
                : "You have returned '" + book.getTitle() + "' on time. Thank you!";
        notificationService.sendNotification(
                record.getUser().getId(),
                "Book Return Processed",
                msg,
                NotificationType.GENERAL
        );

        return saved;
    }

    @Transactional
    public BorrowRecord renewBook(Long userId, Long recordId) {
        BorrowRecord record = borrowRecordRepository.findById(recordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Borrow record not found"));

        if (!record.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You cannot renew another student's book loan.");
        }

        if (record.getStatus() == BorrowStatus.RETURNED) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Returned books cannot be renewed.");
        }

        if (record.getStatus() == BorrowStatus.OVERDUE || LocalDateTime.now().isAfter(record.getDueDate())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot renew overdue book. Please return the book and clear any applicable fine.");
        }

        if (record.getRenewalCount() >= maxRenewals) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Maximum renewal limit (" + maxRenewals + " times) reached for this loan.");
        }

        record.setRenewalCount(record.getRenewalCount() + 1);
        record.setDueDate(record.getDueDate().plusDays(defaultBorrowDays));

        BorrowRecord saved = borrowRecordRepository.save(record);

        notificationService.sendNotification(
                userId,
                "Book Loan Renewed",
                "Your loan for '" + record.getBook().getTitle() + "' has been extended to " + saved.getDueDate().toLocalDate() + ".",
                NotificationType.GENERAL
        );

        return saved;
    }

    public List<BorrowRecord> getStudentBorrowHistory(Long userId) {
        return borrowRecordRepository.findByUserIdOrderByBorrowDateDesc(userId);
    }

    public List<BorrowRecord> getAllBorrowRecords() {
        return borrowRecordRepository.findAllByOrderByBorrowDateDesc();
    }

    @Transactional
    public void refreshOverdueStatuses() {
        LocalDateTime now = LocalDateTime.now();
        List<BorrowRecord> active = borrowRecordRepository.findByStatus(BorrowStatus.BORROWED);
        for (BorrowRecord r : active) {
            if (now.isAfter(r.getDueDate())) {
                r.setStatus(BorrowStatus.OVERDUE);
                r.setFineAmount(fineService.calculateFine(r.getDueDate(), now));
                borrowRecordRepository.save(r);
            }
        }
    }
}
