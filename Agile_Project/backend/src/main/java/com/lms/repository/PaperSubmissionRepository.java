package com.lms.repository;

import com.lms.entity.PaperSubmission;
import com.lms.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaperSubmissionRepository extends JpaRepository<PaperSubmission, Long> {
    List<PaperSubmission> findByStatusOrderByCreatedAtDesc(SubmissionStatus status);
    List<PaperSubmission> findByUploadedByIdOrderByCreatedAtDesc(Long userId);
    List<PaperSubmission> findByStatusAndCourseCodeContainingIgnoreCaseOrCourseNameContainingIgnoreCase(
            SubmissionStatus status, String courseCode, String courseName
    );
    long countByStatus(SubmissionStatus status);
}
