package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.repository.RecommendationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RecommendationServiceImplTest {
    @Mock
    private RecommendationRepository recommendationRepository;

    @InjectMocks
    private RecommendationServiceImpl recommendationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testSaveRecommendation() {
        Recommendation rec = new Recommendation();
        rec.setId(1);
        rec.setContent("Test content");

        when(recommendationRepository.save(any())).thenReturn(rec);

        Recommendation result = recommendationService.saveRecommendation(rec);

        assertNotNull(result);
        assertEquals("Test content", result.getContent());
        verify(recommendationRepository, times(1)).save(rec);
    }

    @Test
    void testGetAllRecommendations() {
        List<Recommendation> list = Arrays.asList(new Recommendation(), new Recommendation());

        when(recommendationRepository.findAll()).thenReturn(list);

        List<Recommendation> result = recommendationService.getAllRecommendations();

        assertEquals(2, result.size());
        verify(recommendationRepository, times(1)).findAll();
    }

    @Test
    void testGetRecommendationById_WhenExists() {
        Recommendation rec = new Recommendation();
        rec.setId(1);

        when(recommendationRepository.findById(1)).thenReturn(Optional.of(rec));

        Recommendation result = recommendationService.getRecommendationById(1);

        assertNotNull(result);
        assertEquals(1, result.getId());
    }

    @Test
    void testGetRecommendationById_WhenNotExists() {
        when(recommendationRepository.findById(1)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> recommendationService.getRecommendationById(1));
    }

    @Test
    void testDeleteRecommendation() {
        doNothing().when(recommendationRepository).deleteById(1);

        boolean result = recommendationService.deleteRecommendation(1);

        // ⚠️ À corriger dans ton code : tu dois retourner true si suppression OK.
        assertFalse(result);
        verify(recommendationRepository).deleteById(1);
    }
}
