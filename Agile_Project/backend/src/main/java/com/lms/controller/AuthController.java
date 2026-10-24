package com.lms.controller;

import com.lms.dto.LoginRequest;
import com.lms.dto.OtpRequest;
import com.lms.dto.OtpVerifyRequest;
import com.lms.dto.RegisterRequest;
import com.lms.entity.User;
import com.lms.service.AuthService;
import com.lms.service.OtpService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final OtpService otpService;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, Object>> sendOtp(@Valid @RequestBody OtpRequest req) {
        String code = otpService.generateAndSendOtp(req.getEmail(), req.getPurpose());
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "A 6-digit verification code has been sent to " + req.getEmail(),
                "devOtpCode", code // Displayed for rapid demo / testing without SMTP dependency
        ));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<User> verifyOtpAndLogin(@Valid @RequestBody OtpVerifyRequest req, HttpServletRequest request) {
        User user = authService.verifyOtpAndLogin(req, request);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest req) {
        User user = authService.register(req);
        // Generate register verification OTP
        String code = otpService.generateAndSendOtp(user.getEmail(), com.lms.entity.OtpPurpose.REGISTER);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Registration successful. Please verify with the OTP sent to your college email.",
                "user", user,
                "devOtpCode", code
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@Valid @RequestBody LoginRequest req, HttpServletRequest request) {
        User user = authService.login(req, request);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        User user = authService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok(Map.of("success", true, "message", "Logged out successfully"));
    }
}
