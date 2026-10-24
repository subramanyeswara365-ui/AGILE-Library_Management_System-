package com.lms.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class FineService {

    @Value("${lms.fine.per-day:5.0}")
    private double finePerDay;

    public double calculateFine(LocalDateTime dueDate, LocalDateTime returnDate) {
        if (returnDate == null) {
            returnDate = LocalDateTime.now();
        }
        if (!returnDate.isAfter(dueDate)) {
            return 0.0;
        }

        long secondsLate = Duration.between(dueDate, returnDate).getSeconds();
        long daysLate = (secondsLate + 86399) / 86400; // ceil to full days
        return Math.max(0, daysLate) * finePerDay;
    }

    public double getFinePerDay() {
        return finePerDay;
    }
}
