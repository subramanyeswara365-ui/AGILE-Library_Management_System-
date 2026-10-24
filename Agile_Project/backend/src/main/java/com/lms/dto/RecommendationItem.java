package com.lms.dto;

import com.lms.entity.Book;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationItem {
    private Book book;
    private int matchPercentage;
    private String learningLevel; // "Beginner", "Intermediate", "Advanced"
    private String rationale;
}
