package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatDto {
    private String seatNumber;
    private String section;
    private String status; // "AVAILABLE", "OCCUPIED", "MY_BOOKING"
    private Long reservationId;
    private String bookedByName;
}
