package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "borrow_record_id")
    private BorrowRecord borrowRecord;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String paymentMethod; // "UPI", "CAMPUS_CARD", "NET_BANKING"

    @Column(nullable = false, unique = true)
    private String transactionReference;

    @Column(nullable = false)
    private String status; // "SUCCESS", "FAILED"

    private LocalDateTime paymentDate;

    @PrePersist
    protected void onCreate() {
        if (paymentDate == null) {
            paymentDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "SUCCESS";
        }
    }
}
