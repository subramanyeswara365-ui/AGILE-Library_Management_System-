package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "paper_submissions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaperSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String courseName; // e.g., "Operating Systems"

    @Column(nullable = false)
    private String courseCode; // e.g., "CSE2005"

    @Column(nullable = false)
    private String semester; // "Fall Semester", "Winter Semester"

    @Column(nullable = false)
    private String examType; // "CAT-1", "CAT-2", "FAT"

    @Column(nullable = false)
    private Integer academicYear; // 2024, 2025, 2026

    private String facultyName;

    @Column(nullable = false)
    private String fileName;

    private String fileContentType;

    private Long fileSize;

    private String fileStoragePath;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] fileData;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User uploadedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status; // PENDING, APPROVED, REJECTED

    private String rejectionReason;

    private LocalDateTime createdAt;

    private LocalDateTime reviewedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = SubmissionStatus.PENDING;
        }
    }
}
