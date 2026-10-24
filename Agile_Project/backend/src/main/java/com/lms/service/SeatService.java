package com.lms.service;

import com.lms.dto.SeatDto;
import com.lms.dto.SeatReserveRequest;
import com.lms.entity.NotificationType;
import com.lms.entity.SeatReservation;
import com.lms.entity.User;
import com.lms.repository.SeatReservationRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class SeatService {

    private final SeatReservationRepository seatReservationRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // 24 seats mapped to sections
    private static final Map<String, String> SEAT_SECTION_MAP = new LinkedHashMap<>();
    static {
        for (int i = 1; i <= 6; i++) {
            SEAT_SECTION_MAP.put(String.format("S-%02d", i), "Quiet Study Zone");
        }
        for (int i = 7; i <= 12; i++) {
            SEAT_SECTION_MAP.put(String.format("S-%02d", i), "AC Coding Pod");
        }
        for (int i = 13; i <= 18; i++) {
            SEAT_SECTION_MAP.put(String.format("S-%02d", i), "Discussion Zone");
        }
        for (int i = 19; i <= 24; i++) {
            SEAT_SECTION_MAP.put(String.format("S-%02d", i), "Scenic Window Bay");
        }
    }

    public List<SeatDto> getSeatLayout(LocalDate date, String slot, Long currentUserId) {
        if (date == null) {
            date = LocalDate.now();
        }
        if (slot == null || slot.trim().isEmpty()) {
            slot = "09:00 - 13:00";
        }

        List<SeatReservation> active = seatReservationRepository.findByReservedDateAndSlotAndStatus(
                date, slot, "CONFIRMED"
        );

        Map<String, SeatReservation> bookedMap = new HashMap<>();
        for (SeatReservation res : active) {
            bookedMap.put(res.getSeatNumber(), res);
        }

        List<SeatDto> result = new ArrayList<>();
        for (Map.Entry<String, String> entry : SEAT_SECTION_MAP.entrySet()) {
            String seatNum = entry.getKey();
            String section = entry.getValue();

            SeatReservation res = bookedMap.get(seatNum);
            String status = "AVAILABLE";
            Long resId = null;
            String bookedByName = null;

            if (res != null) {
                if (currentUserId != null && res.getUser().getId().equals(currentUserId)) {
                    status = "MY_BOOKING";
                } else {
                    status = "OCCUPIED";
                }
                resId = res.getId();
                bookedByName = res.getUser().getFullName();
            }

            result.add(SeatDto.builder()
                    .seatNumber(seatNum)
                    .section(section)
                    .status(status)
                    .reservationId(resId)
                    .bookedByName(bookedByName)
                    .build());
        }

        return result;
    }

    @Transactional
    public SeatReservation reserveSeat(Long userId, SeatReserveRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (!SEAT_SECTION_MAP.containsKey(req.getSeatNumber())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid seat number " + req.getSeatNumber());
        }

        if (req.getReservedDate().isBefore(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Cannot book seat reservations for past dates.");
        }

        // Concurrency check: double-booking prevention
        boolean alreadyBooked = seatReservationRepository.existsBySeatNumberAndReservedDateAndSlotAndStatus(
                req.getSeatNumber(), req.getReservedDate(), req.getSlot(), "CONFIRMED"
        );
        if (alreadyBooked) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Seat " + req.getSeatNumber() + " is already reserved for " + req.getReservedDate() + " during " + req.getSlot());
        }

        SeatReservation reservation = SeatReservation.builder()
                .seatNumber(req.getSeatNumber())
                .section(SEAT_SECTION_MAP.get(req.getSeatNumber()))
                .reservedDate(req.getReservedDate())
                .slot(req.getSlot())
                .user(user)
                .status("CONFIRMED")
                .build();

        SeatReservation saved = seatReservationRepository.save(reservation);

        notificationService.sendNotification(
                userId,
                "Reading Room Seat Reserved",
                "Your seat " + saved.getSeatNumber() + " (" + saved.getSection() + ") has been confirmed for "
                        + saved.getReservedDate() + " [" + saved.getSlot() + "].",
                NotificationType.SEAT_CONFIRMATION
        );

        return saved;
    }

    @Transactional
    public void cancelReservation(Long userId, Long reservationId) {
        SeatReservation res = seatReservationRepository.findById(reservationId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if (!res.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You are not authorized to cancel this reservation.");
        }

        res.setStatus("CANCELLED");
        seatReservationRepository.save(res);

        notificationService.sendNotification(
                userId,
                "Seat Reservation Cancelled",
                "Your reservation for seat " + res.getSeatNumber() + " on " + res.getReservedDate() + " was cancelled.",
                NotificationType.SEAT_CONFIRMATION
        );
    }

    public List<SeatReservation> getUserReservations(Long userId) {
        return seatReservationRepository.findByUserIdOrderByReservedDateDesc(userId);
    }

    public List<SeatReservation> getAllReservations() {
        return seatReservationRepository.findAllByOrderByReservedDateDesc();
    }
}
