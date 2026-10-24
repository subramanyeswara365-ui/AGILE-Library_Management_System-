package com.lms.service;

import com.lms.dto.ReplyCreateRequest;
import com.lms.dto.ThreadCreateRequest;
import com.lms.entity.*;
import com.lms.repository.DiscussionReplyRepository;
import com.lms.repository.DiscussionThreadRepository;
import com.lms.repository.UpvoteRepository;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DiscussionService {

    private final DiscussionThreadRepository threadRepository;
    private final DiscussionReplyRepository replyRepository;
    private final UpvoteRepository upvoteRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<DiscussionThread> getThreads(String category) {
        if (category != null && !category.trim().equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            return threadRepository.findByCategoryOrderByCreatedAtDesc(category.trim());
        }
        return threadRepository.findAllByOrderByCreatedAtDesc();
    }

    public DiscussionThread getThreadById(Long id) {
        return threadRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Discussion thread not found with id: " + id));
    }

    public List<DiscussionReply> getRepliesForThread(Long threadId) {
        return replyRepository.findByThreadIdOrderByCreatedAtAsc(threadId);
    }

    @Transactional
    public DiscussionThread createThread(Long userId, ThreadCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        DiscussionThread thread = DiscussionThread.builder()
                .title(req.getTitle().trim())
                .body(req.getBody().trim())
                .category(req.getCategory().trim())
                .tags(req.getTags() != null ? req.getTags().trim() : "")
                .author(user)
                .attachmentUrl(req.getAttachmentUrl())
                .upvotes(0)
                .isReported(false)
                .isResolved(false)
                .build();

        // Increment user reputation
        user.setReputationScore(user.getReputationScore() + 5);
        userRepository.save(user);

        return threadRepository.save(thread);
    }

    @Transactional
    public DiscussionReply addReply(Long userId, Long threadId, ReplyCreateRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        DiscussionThread thread = getThreadById(threadId);

        boolean isFacultyOrLibrarian = user.getRole() == Role.ADMIN || user.getRole() == Role.LIBRARIAN;

        DiscussionReply reply = DiscussionReply.builder()
                .thread(thread)
                .author(user)
                .body(req.getBody().trim())
                .attachmentUrl(req.getAttachmentUrl())
                .upvotes(0)
                .isFacultyVerified(isFacultyOrLibrarian) // auto-verify if faculty/librarian replied
                .isReported(false)
                .build();

        DiscussionReply saved = replyRepository.save(reply);

        // Increase replier reputation
        user.setReputationScore(user.getReputationScore() + 10);
        userRepository.save(user);

        // Notify thread author
        if (!thread.getAuthor().getId().equals(userId)) {
            notificationService.sendNotification(
                    thread.getAuthor().getId(),
                    "New Reply to Your Academic Discussion",
                    user.getFullName() + " (" + user.getStudentType() + ") replied to '" + thread.getTitle() + "'.",
                    NotificationType.DISCUSSION_REPLY
            );
        }

        return saved;
    }

    @Transactional
    public boolean upvoteThread(Long userId, Long threadId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        DiscussionThread thread = getThreadById(threadId);

        if (upvoteRepository.existsByUserIdAndTargetTypeAndTargetId(userId, VoteTargetType.THREAD, threadId)) {
            // Remove upvote (toggle)
            upvoteRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, VoteTargetType.THREAD, threadId);
            thread.setUpvotes(Math.max(0, thread.getUpvotes() - 1));
            threadRepository.save(thread);
            return false;
        }

        Upvote vote = Upvote.builder()
                .user(user)
                .targetType(VoteTargetType.THREAD)
                .targetId(threadId)
                .build();
        upvoteRepository.save(vote);

        thread.setUpvotes(thread.getUpvotes() + 1);
        threadRepository.save(thread);

        // Boost author reputation
        User author = thread.getAuthor();
        author.setReputationScore(author.getReputationScore() + 5);
        userRepository.save(author);

        return true;
    }

    @Transactional
    public boolean upvoteReply(Long userId, Long replyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        DiscussionReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reply not found"));

        if (upvoteRepository.existsByUserIdAndTargetTypeAndTargetId(userId, VoteTargetType.REPLY, replyId)) {
            upvoteRepository.deleteByUserIdAndTargetTypeAndTargetId(userId, VoteTargetType.REPLY, replyId);
            reply.setUpvotes(Math.max(0, reply.getUpvotes() - 1));
            replyRepository.save(reply);
            return false;
        }

        Upvote vote = Upvote.builder()
                .user(user)
                .targetType(VoteTargetType.REPLY)
                .targetId(replyId)
                .build();
        upvoteRepository.save(vote);

        reply.setUpvotes(reply.getUpvotes() + 1);
        replyRepository.save(reply);

        // Boost replier reputation
        User author = reply.getAuthor();
        author.setReputationScore(author.getReputationScore() + 5);
        userRepository.save(author);

        return true;
    }

    @Transactional
    public DiscussionReply verifyReply(Long replyId) {
        DiscussionReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reply not found"));

        reply.setFacultyVerified(true);

        User author = reply.getAuthor();
        author.setReputationScore(author.getReputationScore() + 50); // High reputation bonus for verified quality answer
        userRepository.save(author);

        notificationService.sendNotification(
                author.getId(),
                "Answer Verified by Faculty! 🛡️",
                "Your reply on '" + reply.getThread().getTitle() + "' was marked as Official Faculty Verified Academic Information (+50 Reputation).",
                NotificationType.DISCUSSION_REPLY
        );

        return replyRepository.save(reply);
    }

    @Transactional
    public void reportThread(Long threadId) {
        DiscussionThread thread = getThreadById(threadId);
        thread.setReported(true);
        threadRepository.save(thread);
    }

    @Transactional
    public void reportReply(Long replyId) {
        DiscussionReply reply = replyRepository.findById(replyId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Reply not found"));
        reply.setReported(true);
        replyRepository.save(reply);
    }

    public List<DiscussionThread> getReportedThreads() {
        return threadRepository.findByIsReportedTrueOrderByCreatedAtDesc();
    }

    public List<DiscussionReply> getReportedReplies() {
        return replyRepository.findByIsReportedTrueOrderByCreatedAtDesc();
    }
}
