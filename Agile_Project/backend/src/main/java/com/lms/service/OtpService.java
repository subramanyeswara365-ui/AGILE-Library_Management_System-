package com.lms.service;

import com.lms.entity.OtpPurpose;
import com.lms.entity.OtpToken;
import com.lms.repository.OtpTokenRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpTokenRepository otpTokenRepository;

    @Value("${lms.auth.allowed-domain:vitapstudent.ac.in,vitap.ac.in}")
    private String allowedDomainsConfig;

    @Value("${lms.otp.expiry-minutes:5}")
    private int expiryMinutes;

    private final SecureRandom random = new SecureRandom();

    public void validateCollegeEmail(String email) {
        if (email == null || !email.contains("@")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid email address format.");
        }
        String domain = email.substring(email.indexOf("@") + 1).toLowerCase().trim();
        List<String> allowed = Arrays.stream(allowedDomainsConfig.split(","))
                .map(String::trim)
                .map(String::toLowerCase)
                .toList();

        // Also allow demo admin/student emails
        if (email.equalsIgnoreCase("admin@lms.edu") || email.equalsIgnoreCase("student@lms.edu")) {
            return;
        }

        boolean matched = allowed.stream().anyMatch(d -> domain.equals(d) || domain.endsWith("." + d));
        if (!matched) {
            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Only official college emails (" + allowedDomainsConfig + ") are permitted to access this portal."
            );
        }
    }

    @Transactional
    public String generateAndSendOtp(String email, OtpPurpose purpose) {
        validateCollegeEmail(email);

        // Local demo account uses a fixed OTP for repeatable project demonstrations.
        // Do not use this bypass in production deployments.
        String code = email.equalsIgnoreCase("subramnayeswara.23mic7024@vitapstudent.ac.in")
                ? "246810" : String.format("%06d", random.nextInt(1000000));
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(expiryMinutes);

        OtpToken token = OtpToken.builder()
                .email(email.toLowerCase().trim())
                .code(code)
                .purpose(purpose)
                .expiresAt(expiresAt)
                .used(false)
                .build();

        otpTokenRepository.save(token);

        // In production this would send via SMTP/Brevo; for testing/evaluation we log and return code
        System.out.println("=================================================");
        System.out.println(">> [OTP SERVICE] Code for " + email + " (" + purpose + "): " + code);
        System.out.println("=================================================");

        return code;
    }

    @Transactional
    public void verifyOtp(String email, OtpPurpose purpose, String code) {
        String cleanEmail = email.toLowerCase().trim();
        // Fixed OTP for the local demo student account; intentionally disabled for other accounts.
        if (cleanEmail.equals("subramnayeswara.23mic7024@vitapstudent.ac.in") && "246810".equals(code == null ? "" : code.trim())) {
            return;
        }
        OtpToken token = otpTokenRepository
                .findTopByEmailAndPurposeOrderByExpiresAtDesc(cleanEmail, purpose)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "No active OTP found for this email. Please request a new code."));

        if (token.isUsed()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "This OTP has already been used. Please request a new code.");
        }

        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP has expired. Please request a new code.");
        }

        if (!token.getCode().equals(code.trim())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP code entered. Please try again.");
        }

        token.setUsed(true);
        otpTokenRepository.save(token);
    }
}
