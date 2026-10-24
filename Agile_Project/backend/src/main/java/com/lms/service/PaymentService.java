package com.lms.service;

import com.lms.entity.BorrowRecord;
import com.lms.entity.Payment;
import com.lms.entity.User;
import com.lms.repository.BorrowRecordRepository;
import com.lms.repository.PaymentRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;

    @Transactional
    public Payment payFine(Long userId, Long borrowRecordId, String paymentMethod) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        BorrowRecord record = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Borrow record not found"));

        if (!record.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Unauthorized fine payment attempt.");
        }

        if (record.isFinePaid() || record.getFineAmount() <= 0.0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "No unpaid fine exists for this borrow record.");
        }

        String ref = "PAY-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Payment payment = Payment.builder()
                .user(user)
                .borrowRecord(record)
                .amount(record.getFineAmount())
                .paymentMethod(paymentMethod != null ? paymentMethod : "UPI_QR")
                .transactionReference(ref)
                .status("SUCCESS")
                .paymentDate(LocalDateTime.now())
                .build();

        record.setFinePaid(true);
        borrowRecordRepository.save(record);

        return paymentRepository.save(payment);
    }

    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserIdOrderByPaymentDateDesc(userId);
    }

    public List<Payment> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc();
    }
}
