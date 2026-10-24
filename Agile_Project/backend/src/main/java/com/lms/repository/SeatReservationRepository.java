package com.lms.repository;

import com.lms.entity.SeatReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeatReservationRepository extends JpaRepository<SeatReservation, Long> {
    List<SeatReservation> findByReservedDateAndSlotAndStatus(LocalDate reservedDate, String slot, String status);
    List<SeatReservation> findByUserIdOrderByReservedDateDesc(Long userId);
    boolean existsBySeatNumberAndReservedDateAndSlotAndStatus(String seatNumber, LocalDate reservedDate, String slot, String status);
    List<SeatReservation> findAllByOrderByReservedDateDesc();
}
