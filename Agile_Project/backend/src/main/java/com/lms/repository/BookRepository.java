package com.lms.repository;

import com.lms.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByIsbn(String isbn);
    List<Book> findByCategoryIgnoreCase(String category);
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCaseOrCategoryContainingIgnoreCaseOrIsbnContainingIgnoreCase(
            String title, String author, String category, String isbn
    );
}
