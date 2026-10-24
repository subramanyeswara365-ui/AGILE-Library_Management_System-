package com.lms.dto;

import com.lms.entity.OtpPurpose;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OtpVerifyRequest {
    @NotBlank(message = "College email is required")
    @Email(message = "Valid email is required")
    private String email;

    @NotBlank(message = "OTP code is required")
    private String code;

    @NotNull(message = "Purpose is required")
    private OtpPurpose purpose;
}
