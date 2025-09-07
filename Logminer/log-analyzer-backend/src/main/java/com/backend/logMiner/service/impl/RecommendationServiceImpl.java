package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.repository.RecommendationRepository;
import com.backend.logMiner.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationServiceImpl implements RecommendationService {

    private  RecommendationRepository recommendationRepository;

    // Plus besoin de constructeur ni @Autowired sur le champ

    @Override
    public Recommendation saveRecommendation(Recommendation recommendation) {
        return recommendationRepository.save(recommendation);
    }

    @Override
    public List<Recommendation> getAllRecommendations() {
        return recommendationRepository.findAll();
    }

    @Override
    public Recommendation getRecommendationById(Integer id) {
        return recommendationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Recommendation not found"));
    }

    @Override
    public Recommendation updateRecommendation(Integer id, Recommendation recommendation) {
        Recommendation existing = getRecommendationById(id);
        existing.setId(recommendation.getId());
        existing.setContent(recommendation.getContent());
        existing.setRelevanceScore(recommendation.getRelevanceScore());
        existing.setGeneratedBy(recommendation.getGeneratedBy());
        existing.setCreationDate(recommendation.getCreationDate());
        return recommendationRepository.save(existing);
    }

    @Override
    public boolean deleteRecommendation(Integer id) {
        recommendationRepository.deleteById(id);
        return false;
    }
}
