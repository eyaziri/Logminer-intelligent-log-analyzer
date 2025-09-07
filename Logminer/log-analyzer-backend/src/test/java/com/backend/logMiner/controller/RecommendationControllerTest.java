package com.backend.logMiner.controller;

import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.service.RecommendationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RecommendationControllerTest {
    @Mock
    private RecommendationService recommendationService;

    @InjectMocks
    private RecommendationController recommendationController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateRecommendation() {
        Recommendation input = new Recommendation();
        input.setContent("AI Recommendation");

        Recommendation saved = new Recommendation();
        saved.setId(1);
        saved.setContent("AI Recommendation");

        when(recommendationService.saveRecommendation(input)).thenReturn(saved);

        ResponseEntity<Recommendation> response = recommendationController.create(input);

        assertEquals(201, response.getStatusCodeValue());
        assertEquals("AI Recommendation", response.getBody().getContent());
    }

    @Test
    void testGetAllRecommendations() {
        List<Recommendation> recommendations = Arrays.asList(new Recommendation(), new Recommendation());

        when(recommendationService.getAllRecommendations()).thenReturn(recommendations);

        ResponseEntity<List<Recommendation>> response = recommendationController.getAll();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(2, response.getBody().size());
    }

    @Test
    void testGetRecommendationById_Found() {
        Recommendation rec = new Recommendation();
        rec.setId(1);

        when(recommendationService.getRecommendationById(1)).thenReturn(rec);

        ResponseEntity<Recommendation> response = recommendationController.getById(1);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().getId());
    }

    @Test
    void testGetRecommendationById_NotFound() {
        when(recommendationService.getRecommendationById(1)).thenReturn(null);

        ResponseEntity<Recommendation> response = recommendationController.getById(1);

        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void testDeleteRecommendation_Success() {
        when(recommendationService.deleteRecommendation(1)).thenReturn(true);

        ResponseEntity<Void> response = recommendationController.delete(1);

        assertEquals(204, response.getStatusCodeValue());
    }

    @Test
    void testDeleteRecommendation_NotFound() {
        when(recommendationService.deleteRecommendation(1)).thenReturn(false);

        ResponseEntity<Void> response = recommendationController.delete(1);

        assertEquals(404, response.getStatusCodeValue());
    }
}
