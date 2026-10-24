package com.lms.dto;

import com.lms.entity.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OtpRequest {
    @NotBlank(message = "College email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotNull(message = "Purpose is required")
    private OtpPurpose purpose;
}
