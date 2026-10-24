package com.lms.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "books")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, unique = true)
    private String isbn;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String shelfLocation; // e.g. "Rack B-03, 2nd Floor, CSE Dept"

    @Column(nullable = false)
    private Integer totalCopies;

    @Column(nullable = false)
    private Integer availableCopies;

    @Column(length = 2000)
    private String description;

    private String coverImageUrl;

    private String publisher;

    private Integer publishedYear;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (availableCopies == null) {
            availableCopies = totalCopies;
        }
    }
}
