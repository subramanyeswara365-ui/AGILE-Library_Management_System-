package com.lms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDto {
    private long totalBooks;
    private long totalTitles;
    private long activeLoans;
    private long overdueLoans;
    private double totalFinesCollected;
    private double unpaidFines;
    private long pendingPaperApprovals;
    private long approvedPapers;
    private long todaySeatReservations;
    private long totalStudents;
}
