package com.lms.service;

import com.lms.entity.Book;
import com.lms.repository.BookRepository;
import com.lms.web.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;

    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public List<Book> searchBooks(String query, String category, Boolean availableOnly) {
        List<Book> books;
        if (query != null && !query.trim().isEmpty()) {
            String q = query.trim();
            books = bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrIsbnContainingIgnoreCase(q, q, q, q);
        } else if (category != null && !category.trim().equalsIgnoreCase("ALL") && !category.trim().isEmpty()) {
            books = bookRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            books = bookRepository.findAll();
        }

        if (Boolean.TRUE.equals(availableOnly)) {
            books = books.stream()
                    .filter(b -> b.getAvailableCopies() != null && b.getAvailableCopies() > 0)
                    .toList();
        }

        return books;
    }

    public Book getBookById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Book not found with id: " + id));
    }

    @Transactional
    public Book createBook(Book book) {
        if (book.getIsbn() != null && bookRepository.findByIsbn(book.getIsbn().trim()).isPresent()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Book with ISBN " + book.getIsbn() + " already exists.");
        }
        if (book.getAvailableCopies() == null) {
            book.setAvailableCopies(book.getTotalCopies());
        }
        return bookRepository.save(book);
    }

    @Transactional
    public Book updateBook(Long id, Book updated) {
        Book existing = getBookById(id);
        existing.setTitle(updated.getTitle());
        existing.setAuthor(updated.getAuthor());
        existing.setIsbn(updated.getIsbn());
        existing.setCategory(updated.getCategory());
        existing.setShelfLocation(updated.getShelfLocation());
        existing.setTotalCopies(updated.getTotalCopies());
        existing.setAvailableCopies(updated.getAvailableCopies());
        existing.setDescription(updated.getDescription());
        existing.setCoverImageUrl(updated.getCoverImageUrl());
        existing.setPublisher(updated.getPublisher());
        existing.setPublishedYear(updated.getPublishedYear());
        return bookRepository.save(existing);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = getBookById(id);
        bookRepository.delete(book);
    }
}
