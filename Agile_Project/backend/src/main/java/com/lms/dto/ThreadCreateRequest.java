package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ThreadCreateRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Body text is required")
    private String body;

    @NotBlank(message = "Category is required")
    private String category;

    private String tags;
    private String attachmentUrl;
}
