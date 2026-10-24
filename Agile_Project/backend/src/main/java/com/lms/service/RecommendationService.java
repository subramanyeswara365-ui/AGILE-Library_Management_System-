package com.lms.service;

import com.lms.dto.RecommendationItem;
import com.lms.entity.Book;
import com.lms.entity.BorrowRecord;
import com.lms.repository.BookRepository;
import com.lms.repository.BorrowRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final BookRepository bookRepository;
    private final BorrowRecordRepository borrowRecordRepository;

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with",
            "is", "of", "about", "i", "want", "learn", "need", "book", "books",
            "recommend", "me", "find", "good", "best", "some", "what", "how"
    );

    public List<RecommendationItem> recommendByQuery(String query) {
        List<Book> allBooks = bookRepository.findAll();
        if (allBooks.isEmpty()) {
            return Collections.emptyList();
        }

        if (query == null || query.trim().isEmpty()) {
            return getCatalogHighlights(allBooks);
        }

        String lowerQuery = query.toLowerCase().trim();
        String[] words = lowerQuery.split("[^a-zA-Z0-9]+");
        Set<String> queryKeywords = new HashSet<>();
        for (String w : words) {
            if (w.length() > 2 && !STOP_WORDS.contains(w)) {
                queryKeywords.add(w);
            }
        }

        // Determine intended difficulty
        String requestedLevel = "Intermediate";
        if (lowerQuery.contains("beginner") || lowerQuery.contains("basic") || lowerQuery.contains("start") || lowerQuery.contains("intro")) {
            requestedLevel = "Beginner";
        } else if (lowerQuery.contains("advanced") || lowerQuery.contains("master") || lowerQuery.contains("internals") || lowerQuery.contains("expert") || lowerQuery.contains("architecture")) {
            requestedLevel = "Advanced";
        }

        List<ScoredBook> scored = new ArrayList<>();
        for (Book book : allBooks) {
            int score = calculateMatchScore(book, lowerQuery, queryKeywords);
            if (score > 0) {
                String level = deriveBookLevel(book, requestedLevel);
                String rationale = generateRationale(book, queryKeywords, level);
                scored.add(new ScoredBook(book, score, level, rationale));
            }
        }

        // Sort descending by score
        scored.sort((a, b) -> Integer.compare(b.score, a.score));

        // If no direct matches, return catalog highlights with friendly explanation
        if (scored.isEmpty()) {
            return getCatalogHighlights(allBooks);
        }

        return scored.stream()
                .limit(6)
                .map(s -> RecommendationItem.builder()
                        .book(s.book)
                        .matchPercentage(Math.min(99, Math.max(65, s.score * 7)))
                        .learningLevel(s.level)
                        .rationale(s.rationale)
                        .build())
                .toList();
    }

    public List<RecommendationItem> recommendPersonalized(Long userId) {
        List<Book> allBooks = bookRepository.findAll();
        if (allBooks.isEmpty()) {
            return Collections.emptyList();
        }

        List<BorrowRecord> history = borrowRecordRepository.findByUserIdOrderByBorrowDateDesc(userId);
        if (history.isEmpty()) {
            return getCatalogHighlights(allBooks);
        }

        // Find student's preferred categories
        Map<String, Integer> categoryWeights = new HashMap<>();
        Set<Long> alreadyReadBookIds = new HashSet<>();
        for (BorrowRecord r : history) {
            alreadyReadBookIds.add(r.getBook().getId());
            categoryWeights.merge(r.getBook().getCategory(), 1, Integer::sum);
        }

        List<ScoredBook> scored = new ArrayList<>();
        for (Book book : allBooks) {
            if (alreadyReadBookIds.contains(book.getId())) {
                continue; // don't recommend books they already borrowed
            }
            int weight = categoryWeights.getOrDefault(book.getCategory(), 0);
            if (weight > 0) {
                String level = "Intermediate";
                String rationale = "Recommended based on your interest in " + book.getCategory() + " and library borrowing trajectory.";
                scored.add(new ScoredBook(book, 10 + weight * 2, level, rationale));
            }
        }

        scored.sort((a, b) -> Integer.compare(b.score, a.score));

        if (scored.isEmpty()) {
            return getCatalogHighlights(allBooks);
        }

        return scored.stream()
                .limit(4)
                .map(s -> RecommendationItem.builder()
                        .book(s.book)
                        .matchPercentage(Math.min(96, Math.max(75, s.score * 5)))
                        .learningLevel(s.level)
                        .rationale(s.rationale)
                        .build())
                .toList();
    }

    private int calculateMatchScore(Book book, String rawQuery, Set<String> keywords) {
        int score = 0;
        String title = book.getTitle().toLowerCase();
        String desc = book.getDescription() != null ? book.getDescription().toLowerCase() : "";
        String cat = book.getCategory().toLowerCase();
        String author = book.getAuthor().toLowerCase();

        // Exact phrase match
        if (title.contains(rawQuery)) score += 15;
        if (desc.contains(rawQuery)) score += 8;
        if (cat.contains(rawQuery)) score += 10;

        // Keyword matches
        for (String kw : keywords) {
            if (title.contains(kw)) score += 5;
            if (cat.contains(kw)) score += 4;
            if (desc.contains(kw)) score += 2;
            if (author.contains(kw)) score += 3;
        }

        return score;
    }

    private String deriveBookLevel(Book book, String preferredLevel) {
        String combined = (book.getTitle() + " " + book.getDescription()).toLowerCase();
        if (combined.contains("introduction") || combined.contains("fundamentals") || combined.contains("basic") || combined.contains("primer")) {
            return "Beginner";
        }
        if (combined.contains("advanced") || combined.contains("deep") || combined.contains("architecture") || combined.contains("in action")) {
            return "Advanced";
        }
        return preferredLevel;
    }

    private String generateRationale(Book book, Set<String> keywords, String level) {
        StringBuilder sb = new StringBuilder();
        sb.append("Recommended for ").append(level).append(" learners. Directly covers ");
        if (!keywords.isEmpty()) {
            List<String> list = new ArrayList<>(keywords);
            sb.append(String.join(", ", list.subList(0, Math.min(3, list.size()))));
        } else {
            sb.append(book.getCategory());
        }
        sb.append(" with comprehensive curriculum alignment (Shelf: ").append(book.getShelfLocation()).append(").");
        return sb.toString();
    }

    private List<RecommendationItem> getCatalogHighlights(List<Book> allBooks) {
        return allBooks.stream()
                .limit(4)
                .map(b -> RecommendationItem.builder()
                        .book(b)
                        .matchPercentage(92)
                        .learningLevel("Comprehensive")
                        .rationale("Core academic curriculum textbook recommended for VIT-AP semester coursework.")
                        .build())
                .toList();
    }

    private record ScoredBook(Book book, int score, String level, String rationale) {}
}
