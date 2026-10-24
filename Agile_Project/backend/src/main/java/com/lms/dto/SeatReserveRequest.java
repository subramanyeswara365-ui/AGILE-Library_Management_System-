package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class SeatReserveRequest {
    @NotBlank(message = "Seat number is required")
    private String seatNumber;

    @NotNull(message = "Reservation date is required")
    private LocalDate reservedDate;

    @NotBlank(message = "Time slot is required")
    private String slot;
}
