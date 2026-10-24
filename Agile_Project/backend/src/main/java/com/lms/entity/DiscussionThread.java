package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "discussion_threads")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiscussionThread {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 4000)
    private String body;

    @Column(nullable = false)
    private String category; // "Course Help", "Placement Prep", "Senior Guidance", "General"

    private String tags; // e.g. "SpringBoot, MySQL, Agile"

    @ManyToOne(optional = false, fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User author;

    private String attachmentUrl;

    @Column(nullable = false)
    private Integer upvotes;

    @Column(nullable = false)
    private boolean isReported;

    @Column(nullable = false)
    private boolean isResolved;

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
