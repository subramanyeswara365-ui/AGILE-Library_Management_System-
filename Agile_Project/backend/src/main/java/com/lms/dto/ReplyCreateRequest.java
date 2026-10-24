package com.lms.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ReplyCreateRequest {
    @NotBlank(message = "Reply body cannot be blank")
    private String body;

    private String attachmentUrl;
}
