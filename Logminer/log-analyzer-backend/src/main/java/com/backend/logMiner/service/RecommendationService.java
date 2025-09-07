package com.backend.logMiner.service;

import com.backend.logMiner.model.Recommendation;

import java.util.List;

public interface RecommendationService {

    Recommendation saveRecommendation(Recommendation recommendation);

    List<Recommendation> getAllRecommendations();

    Recommendation getRecommendationById(Integer id);

    Recommendation updateRecommendation(Integer id, Recommendation recommendation);

    boolean deleteRecommendation(Integer id);
}
