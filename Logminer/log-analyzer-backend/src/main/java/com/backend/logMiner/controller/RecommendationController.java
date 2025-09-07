package com.backend.logMiner.controller;

import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    @Autowired
    private final RecommendationService recommendationService;

    @Autowired
    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @PostMapping("/create")
    public ResponseEntity<Recommendation> create(@RequestBody Recommendation recommendation) {
        Recommendation savedRecommendation = recommendationService.saveRecommendation(recommendation);
        return ResponseEntity.status(201).body(savedRecommendation); // 201 Created
    }

    @GetMapping("/all")
    public ResponseEntity<List<Recommendation>> getAll() {
        List<Recommendation> recommendations = recommendationService.getAllRecommendations();
        return ResponseEntity.ok(recommendations); // 200 OK
    }

    @GetMapping("/update/{id}")
    public ResponseEntity<Recommendation> getById(@PathVariable Integer id) {
        Recommendation recommendation = recommendationService.getRecommendationById(id);
        if (recommendation != null) {
            return ResponseEntity.ok(recommendation); // 200 OK
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Recommendation> update(@PathVariable Integer id, @RequestBody Recommendation recommendation) {
        Recommendation updatedRecommendation = recommendationService.updateRecommendation(id, recommendation);
        if (updatedRecommendation != null) {
            return ResponseEntity.ok(updatedRecommendation); // 200 OK
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        boolean deleted = recommendationService.deleteRecommendation(id);
        if (deleted) {
            return ResponseEntity.noContent().build(); // 204 No Content
        } else {
            return ResponseEntity.notFound().build(); // 404 Not Found
        }
    }
}
