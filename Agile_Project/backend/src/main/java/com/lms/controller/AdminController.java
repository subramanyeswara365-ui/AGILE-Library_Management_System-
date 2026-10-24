package com.lms.controller;

import com.lms.dto.AdminStatsDto;
import com.lms.entity.*;
import com.lms.repository.*;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final PaymentRepository paymentRepository;
    private final PaperSubmissionRepository paperSubmissionRepository;
    private final SeatReservationRepository seatReservationRepository;
    private final UserRepository userRepository;

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDto> getStats(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);

        List<Book> books = bookRepository.findAll();
        long totalCopies = books.stream().mapToLong(b -> b.getTotalCopies() != null ? b.getTotalCopies() : 0).sum();
        long totalTitles = books.size();

        List<BorrowRecord> allLoans = borrowRecordRepository.findAll();
        long activeLoans = allLoans.stream().filter(l -> l.getStatus() == BorrowStatus.BORROWED).count();
        long overdueLoans = allLoans.stream().filter(l -> l.getStatus() == BorrowStatus.OVERDUE).count();

        double unpaidFines = allLoans.stream()
                .filter(l -> !l.isFinePaid() && l.getFineAmount() != null)
                .mapToDouble(BorrowRecord::getFineAmount)
                .sum();

        List<Payment> payments = paymentRepository.findAll();
        double totalFinesCollected = payments.stream().mapToDouble(Payment::getAmount).sum();

        long pendingPapers = paperSubmissionRepository.countByStatus(SubmissionStatus.PENDING);
        long approvedPapers = paperSubmissionRepository.countByStatus(SubmissionStatus.APPROVED);

        List<SeatReservation> todaySeats = seatReservationRepository.findByReservedDateAndSlotAndStatus(
                LocalDate.now(), "09:00 - 13:00", "CONFIRMED"
        );
        long seatCount = todaySeats.size();

        long totalStudents = userRepository.countByRole(Role.STUDENT);

        AdminStatsDto stats = AdminStatsDto.builder()
                .totalBooks(totalCopies)
                .totalTitles(totalTitles)
                .activeLoans(activeLoans)
                .overdueLoans(overdueLoans)
                .totalFinesCollected(totalFinesCollected)
                .unpaidFines(unpaidFines)
                .pendingPaperApprovals(pendingPapers)
                .approvedPapers(approvedPapers)
                .todaySeatReservations(seatCount)
                .totalStudents(totalStudents)
                .build();

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(userRepository.findAll());
    }
}
