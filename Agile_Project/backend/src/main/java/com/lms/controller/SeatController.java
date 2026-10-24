package com.lms.controller;

import com.lms.dto.SeatDto;
import com.lms.dto.SeatReserveRequest;
import com.lms.entity.SeatReservation;
import com.lms.service.SeatService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @GetMapping
    public ResponseEntity<List<SeatDto>> getSeats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) String slot,
            HttpServletRequest request
    ) {
        Long currentUserId = CurrentUser.getUserId(request);
        return ResponseEntity.ok(seatService.getSeatLayout(date, slot, currentUserId));
    }

    @PostMapping("/reserve")
    public ResponseEntity<SeatReservation> reserveSeat(@Valid @RequestBody SeatReserveRequest req, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(seatService.reserveSeat(userId, req));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<Map<String, Object>> cancelReservation(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        seatService.cancelReservation(userId, id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Reservation cancelled successfully"));
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<List<SeatReservation>> getMyReservations(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(seatService.getUserReservations(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<SeatReservation>> getAllReservations(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(seatService.getAllReservations());
    }
}
