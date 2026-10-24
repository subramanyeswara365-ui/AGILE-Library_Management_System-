package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_replies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionReply {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "thread_id")
    private DiscussionThread thread;

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User author;

    @Column(nullable = false, length = 2000)
    private String body;

    private String attachmentUrl;

    @Column(nullable = false)
    private Integer upvotes;

    @Column(nullable = false)
    private boolean isFacultyVerified;

    @Column(nullable = false)
    private boolean isReported;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (upvotes == null) {
            upvotes = 0;
        }
    }
}
