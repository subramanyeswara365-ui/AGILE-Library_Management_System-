package com.lms.controller;

import com.lms.dto.RecommendationItem;
import com.lms.dto.RecommendationRequest;
import com.lms.service.RecommendationService;
import com.lms.web.CurrentUser;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping("/query")
    public ResponseEntity<List<RecommendationItem>> recommendByQuery(@Valid @RequestBody RecommendationRequest req) {
        return ResponseEntity.ok(recommendationService.recommendByQuery(req.getQuery()));
    }

    @GetMapping("/personalized")
    public ResponseEntity<List<RecommendationItem>> getPersonalized(HttpServletRequest request) {
        Long userId = CurrentUser.getUserId(request);
        return ResponseEntity.ok(recommendationService.recommendPersonalized(userId));
    }
}
