package com.lms.controller;

import com.lms.entity.Book;
import com.lms.service.BookService;
import com.lms.service.QrCodeService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;
    private final QrCodeService qrCodeService;

    @GetMapping
    public ResponseEntity<List<Book>> getBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean availableOnly
    ) {
        return ResponseEntity.ok(bookService.searchBooks(query, category, availableOnly));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getBookQrCode(@PathVariable Long id) {
        Book book = bookService.getBookById(id);
        String payload = "LMS:BOOK:" + book.getId();
        byte[] qr = qrCodeService.generateQrCodePng(payload, 300, 300);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"book-" + id + "-qr.png\"")
                .body(qr);
    }

    @PostMapping
    public ResponseEntity<Book> createBook(@Valid @RequestBody Book book, HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(bookService.createBook(book));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(@PathVariable Long id, @Valid @RequestBody Book book, HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        return ResponseEntity.ok(bookService.updateBook(id, book));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteBook(@PathVariable Long id, HttpServletRequest request) {
        CurrentUser.requireAdmin(request);
        bookService.deleteBook(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Book deleted successfully"));
    }
}
