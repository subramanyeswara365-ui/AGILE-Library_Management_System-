package com.lms.service;

import com.lms.dto.LoginRequest;
import com.lms.dto.OtpVerifyRequest;
import com.lms.dto.RegisterRequest;
import com.lms.entity.OtpPurpose;
import com.lms.entity.Role;
import com.lms.entity.User;
import com.lms.repository.UserRepository;
import com.lms.web.ApiException;
import com.lms.web.SessionKeys;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional
    public User register(RegisterRequest req) {
        String email = req.getEmail().toLowerCase().trim();
        otpService.validateCollegeEmail(email);

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "An account with this college email already exists.");
        }

        int year = (req.getYearOfStudy() != null && req.getYearOfStudy() > 0) ? req.getYearOfStudy() : 1;
        String studentType = (year >= 3) ? "Senior" : "Junior";

        User user = User.builder()
                .fullName(req.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(req.getPassword()))
                .role(Role.STUDENT)
                .department(req.getDepartment() != null ? req.getDepartment().trim() : "Computer Science & Engineering")
                .rollNumber(req.getRollNumber() != null ? req.getRollNumber().trim().toUpperCase() : "23MIC" + (int)(1000 + Math.random() * 9000))
                .yearOfStudy(year)
                .studentType(studentType)
                .emailVerified(true) // Verified through college email workflow
                .reputationScore(50) // Starting welcome reputation
                .build();

        return userRepository.save(user);
    }

    public User login(LoginRequest req, HttpServletRequest request) {
        String email = req.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));

        if (!passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password.");
        }

        // Establish session
        HttpSession session = request.getSession(true);
        session.setAttribute(SessionKeys.USER_ID, user.getId());
        session.setAttribute(SessionKeys.USER_EMAIL, user.getEmail());
        session.setAttribute(SessionKeys.USER_ROLE, user.getRole().name());

        return user;
    }

    @Transactional
    public User verifyOtpAndLogin(OtpVerifyRequest req, HttpServletRequest request) {
        otpService.verifyOtp(req.getEmail(), req.getPurpose(), req.getCode());

        String email = req.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User profile not found for this email."));

        user.setEmailVerified(true);
        userRepository.save(user);

        // Establish session
        HttpSession session = request.getSession(true);
        session.setAttribute(SessionKeys.USER_ID, user.getId());
        session.setAttribute(SessionKeys.USER_EMAIL, user.getEmail());
        session.setAttribute(SessionKeys.USER_ROLE, user.getRole().name());

        return user;
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
    }
}
