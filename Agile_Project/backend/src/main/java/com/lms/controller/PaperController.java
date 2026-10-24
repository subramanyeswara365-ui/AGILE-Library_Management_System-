package com.lms.controller;

import com.lms.entity.PaperSubmission;
import com.lms.service.PaperSubmissionService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/papers")
@RequiredArgsConstructor
public class PaperController {

    private final PaperSubmissionService paperService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<PaperSubmission> uploadPaper(
            @RequestParam("courseName") String courseName,
            @RequestParam("courseCode") String courseCode,
            @RequestParam(value = "semester", required = false) String semester,
            @RequestParam(value = "examType", required = false) String examType,
            @RequestParam(value = "academicYear", required = false) Integer academicYear,
            @RequestParam(value = "facultyName", required = false) String facultyName,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        Long userId = CurrentUser.requireUserId(request);
        PaperSubmission submission = paperService.submitPaper(
                userId, courseName, courseCode, semester, examType, academicYear, facultyName, file
        );
        return ResponseEntity.ok(submission);
    }

    @GetMapping
    public ResponseEntity<List<PaperSubmission>> getApprovedPapers(
            @RequestParam(required = false) String courseCode,
            @RequestParam(required = false) String examType,
            @RequestParam(required = false) Integer year
    ) {
        return ResponseEntity.ok(paperService.getApprovedPapers(courseCode, examType, year));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<PaperSubmission>> getPendingPapers(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(paperService.getPendingSubmissions());
    }

    @GetMapping("/my-submissions")
    public ResponseEntity<List<PaperSubmission>> getMySubmissions(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(paperService.getUserSubmissions(userId));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadPaper(@PathVariable Long id) {
        PaperSubmission paper = paperService.getPaperById(id);
        if (paper.getFileData() == null) {
            return ResponseEntity.notFound().build();
        }

        String contentType = paper.getFileContentType() != null ? paper.getFileContentType() : MediaType.APPLICATION_PDF_VALUE;

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + paper.getFileName() + "\"")
                .body(paper.getFileData());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<PaperSubmission> approvePaper(@PathVariable Long id, HttpServletRequest request) {
        Long adminId = CurrentUser.requireUserId(request);
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(paperService.approvePaper(id, adminId));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<PaperSubmission> rejectPaper(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request
    ) {
        Long adminId = CurrentUser.requireUserId(request);
        CurrentUser.requireAdmin(request);
        String reason = (body != null) ? body.get("reason") : null;
        return ResponseEntity.ok(paperService.rejectPaper(id, adminId, reason));
    }
}
