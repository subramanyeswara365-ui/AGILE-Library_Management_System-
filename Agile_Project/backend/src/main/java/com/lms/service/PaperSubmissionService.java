package com.lms.service;

import com.lms.entity.NotificationType;
import com.lms.entity.PaperSubmission;
import com.lms.entity.SubmissionStatus;
import com.lms.entity.User;
import com.lms.repository.PaperSubmissionRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaperSubmissionService {

    private final PaperSubmissionRepository paperSubmissionRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public PaperSubmission submitPaper(
            Long userId,
            String courseName,
            String courseCode,
            String semester,
            String examType,
            Integer academicYear,
            String facultyName,
            MultipartFile file
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        if (file == null || file.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please attach a valid question paper document (PDF/DOCX).");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "paper.pdf";
        }

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to read uploaded file: " + e.getMessage());
        }

        PaperSubmission submission = PaperSubmission.builder()
                .courseName(courseName.trim())
                .courseCode(courseCode.trim().toUpperCase())
                .semester(semester != null ? semester.trim() : "Fall Semester")
                .examType(examType != null ? examType.trim().toUpperCase() : "FAT")
                .academicYear(academicYear != null ? academicYear : 2025)
                .facultyName(facultyName != null ? facultyName.trim() : "Faculty Dept")
                .fileName(originalFilename)
                .fileContentType(file.getContentType())
                .fileSize(file.getSize())
                .fileData(bytes)
                .uploadedBy(user)
                .status(SubmissionStatus.PENDING)
                .build();

        PaperSubmission saved = paperSubmissionRepository.save(submission);

        notificationService.sendNotification(
                userId,
                "Paper Upload Submitted",
                "Your submission for '" + courseCode + " - " + courseName + " (" + examType + ")' has been submitted and is pending librarian review.",
                NotificationType.PAPER_STATUS
        );

        return saved;
    }

    public List<PaperSubmission> getApprovedPapers(String courseCode, String examType, Integer year) {
        List<PaperSubmission> papers = paperSubmissionRepository.findByStatusOrderByCreatedAtDesc(SubmissionStatus.APPROVED);

        return papers.stream()
                .filter(p -> courseCode == null || courseCode.trim().isEmpty() ||
                        p.getCourseCode().equalsIgnoreCase(courseCode.trim()) ||
                        p.getCourseName().toLowerCase().contains(courseCode.trim().toLowerCase()))
                .filter(p -> examType == null || examType.trim().isEmpty() || examType.equalsIgnoreCase("ALL") ||
                        p.getExamType().equalsIgnoreCase(examType.trim()))
                .filter(p -> year == null || p.getAcademicYear().equals(year))
                .toList();
    }

    public List<PaperSubmission> getPendingSubmissions() {
        return paperSubmissionRepository.findByStatusOrderByCreatedAtDesc(SubmissionStatus.PENDING);
    }

    public List<PaperSubmission> getUserSubmissions(Long userId) {
        return paperSubmissionRepository.findByUploadedByIdOrderByCreatedAtDesc(userId);
    }

    public PaperSubmission getPaperById(Long id) {
        return paperSubmissionRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Question paper record not found with id: " + id));
    }

    @Transactional
    public PaperSubmission approvePaper(Long paperId, Long reviewerId) {
        PaperSubmission paper = getPaperById(paperId);
        paper.setStatus(SubmissionStatus.APPROVED);
        paper.setReviewedAt(LocalDateTime.now());
        paper.setRejectionReason(null);

        // Award reputation to uploader for quality academic contribution
        User uploader = paper.getUploadedBy();
        uploader.setReputationScore(uploader.getReputationScore() + 25);
        userRepository.save(uploader);

        PaperSubmission saved = paperSubmissionRepository.save(paper);

        notificationService.sendNotification(
                uploader.getId(),
                "Question Paper Approved! 🎉",
                "Your uploaded paper '" + paper.getCourseCode() + " - " + paper.getExamType() + "' has been approved by the librarian and published to the academic repository (+25 Reputation points).",
                NotificationType.PAPER_STATUS
        );

        return saved;
    }

    @Transactional
    public PaperSubmission rejectPaper(Long paperId, Long reviewerId, String reason) {
        PaperSubmission paper = getPaperById(paperId);
        paper.setStatus(SubmissionStatus.REJECTED);
        paper.setReviewedAt(LocalDateTime.now());
        paper.setRejectionReason(reason != null && !reason.trim().isEmpty() ? reason.trim() : "Does not meet library formatting / verification standards.");

        PaperSubmission saved = paperSubmissionRepository.save(paper);

        notificationService.sendNotification(
                paper.getUploadedBy().getId(),
                "Question Paper Submission Update",
                "Your uploaded paper '" + paper.getCourseCode() + "' was not approved. Reason: " + paper.getRejectionReason(),
                NotificationType.PAPER_STATUS
        );

        return saved;
    }
}
