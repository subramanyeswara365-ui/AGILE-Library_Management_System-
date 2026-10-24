package com.lms.controller;

import com.lms.entity.Payment;
import com.lms.service.PaymentService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay-fine")
    public ResponseEntity<Payment> payFine(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        Long recordId = Long.valueOf(body.get("borrowRecordId").toString());
        String method = (String) body.getOrDefault("paymentMethod", "UPI");
        return ResponseEntity.ok(paymentService.payFine(userId, recordId, method));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<Payment>> getMyPayments(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Payment>> getAllPayments(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(paymentService.getAllPayments());
    }
}
