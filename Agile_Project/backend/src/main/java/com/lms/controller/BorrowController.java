package com.lms.controller;

import com.lms.entity.BorrowRecord;
import com.lms.service.BorrowService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/{bookId}")
    public ResponseEntity<BorrowRecord> borrowBook(@PathVariable Long bookId, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(borrowService.borrowBook(userId, bookId));
    }

    @PostMapping("/qr")
    public ResponseEntity<BorrowRecord> borrowByQr(@RequestBody Map<String, String> body, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        String qrContent = body.get("qrContent");
        return ResponseEntity.ok(borrowService.borrowByQr(userId, qrContent));
    }

    @PostMapping("/{id}/return")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(borrowService.returnBook(userId, id));
    }

    @PostMapping("/{id}/renew")
    public ResponseEntity<BorrowRecord> renewBook(@PathVariable Long id, HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(borrowService.renewBook(userId, id));
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<BorrowRecord>> getMyLoans(HttpServletRequest request) {
        Long userId = CurrentUser.requireUserId(request);
        return ResponseEntity.ok(borrowService.getStudentBorrowHistory(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<BorrowRecord>> getAllLoans(HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(borrowService.getAllBorrowRecords());
    }
}
