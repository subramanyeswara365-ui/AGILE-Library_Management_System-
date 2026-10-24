package com.lms.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "College email is required")
    @Email(message = "Valid email format is required")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;
}
