package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "seat_reservations",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"seatNumber", "reservedDate", "slot"})
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String seatNumber; // e.g., "S-01" to "S-24"

    @Column(nullable = false)
    private String section; // "Quiet Zone", "Discussion Pod", "AC Silent Area", "Window View"

    @Column(nullable = false)
    private LocalDate reservedDate;

    @Column(nullable = false)
    private String slot; // "09:00 - 13:00", "13:00 - 17:00", "17:00 - 21:00"

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String status; // "CONFIRMED", "CANCELLED"

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "CONFIRMED";
        }
    }
}
