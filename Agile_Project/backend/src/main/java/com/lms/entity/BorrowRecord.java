package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "book_id")
    private Book book;

    @Column(nullable = false)
    private LocalDateTime borrowDate;

    @Column(nullable = false)
    private LocalDateTime dueDate;

    private LocalDateTime returnDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BorrowStatus status;

    @Column(nullable = false)
    private Integer renewalCount;

    @Column(nullable = false)
    private Double fineAmount;

    @Column(nullable = false)
    private boolean finePaid;

    @PrePersist
    protected void onCreate() {
        if (borrowDate == null) {
            borrowDate = LocalDateTime.now();
        }
        if (renewalCount == null) {
            renewalCount = 0;
        }
        if (fineAmount == null) {
            fineAmount = 0.0;
        }
        if (status == null) {
            status = BorrowStatus.BORROWED;
        }
    }
}
