package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecommendationRequest {
    @NotBlank(message = "Query prompt is required")
    private String query;
}
