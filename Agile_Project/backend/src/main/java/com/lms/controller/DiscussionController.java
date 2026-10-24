package com.lms.controller;

import com.lms.dto.ReplyCreateRequest;
import com.lms.dto.ThreadCreateRequest;
import com.lms.entity.DiscussionReply;
import com.lms.entity.DiscussionThread;
import com.lms.service.DiscussionService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/discussions")
@RequiredArgsConstructor
public class DiscussionController {

    private final DiscussionService discussionService;

    @GetMapping
    public ResponseEntity<List<DiscussionThread>> getThreads(@RequestParam(required = false) String category) {
        return ResponseEntity.ok(discussionService.getThreads(category));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getThreadDetails(@PathVariable Long id) {
        DiscussionThread thread = discussionService.getThreadById(id);
        List<DiscussionReply> replies = discussionService.getRepliesForThread(id);
        return ResponseEntity.ok(Map.of(
                "thread", thread,
                "replies", replies
        ));
    }

    @PostMapping
    public ResponseEntity<DiscussionThread> createThread(@Valid @RequestBody ThreadCreateRequest req, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(discussionService.createThread(userId, req));
    }

    @PostMapping("/{id}/replies")
    public ResponseEntity<DiscussionReply> addReply(
            @PathVariable Long id,
            @Valid @RequestBody ReplyCreateRequest req,
            HttpServletRequest request
    ) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(discussionService.addReply(userId, id, req));
    }

    @PostMapping("/{id}/upvote")
    public ResponseEntity<Map<String, Object>> upvoteThread(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        boolean upvoted = discussionService.upvoteThread(userId, id);
        return ResponseEntity.ok(Map.of("upvoted", upvoted));
    }

    @PostMapping("/replies/{id}/upvote")
    public ResponseEntity<Map<String, Object>> upvoteReply(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        boolean upvoted = discussionService.upvoteReply(userId, id);
        return ResponseEntity.ok(Map.of("upvoted", upvoted));
    }

    @PostMapping("/replies/{id}/verify")
    public ResponseEntity<DiscussionReply> verifyReply(@PathVariable Long id, HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(discussionService.verifyReply(id));
    }

    @PostMapping("/{id}/report")
    public ResponseEntity<Map<String, Object>> reportThread(@PathVariable Long id, HttpServletRequest request) {
        CurrentUser.requireUserId(request);
        discussionService.reportThread(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Thread reported for moderator review."));
    }

    @PostMapping("/replies/{id}/report")
    public ResponseEntity<Map<String, Object>> reportReply(@PathVariable Long id, HttpServletRequest request) {
        CurrentUser.requireUserId(request);
        discussionService.reportReply(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Reply reported for moderator review."));
    }

    @GetMapping("/reported")
    public ResponseEntity<Map<String, Object>> getReported(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(Map.of(
                "threads", discussionService.getReportedThreads(),
                "replies", discussionService.getReportedReplies()
        ));
    }
}
