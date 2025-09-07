package com.backend.logMiner.dto;

import java.time.LocalDateTime;

public class RecommendationDTO {
    private final  Integer id;
    private final  String content;
    private final  Float relevanceScore;
    private final  String generatedBy;
    private final  LocalDateTime creationDate;

    public RecommendationDTO(Integer id,
                             String content,
                             Float relevanceScore,
                             String generatedBy,
                             LocalDateTime creationDate) {
        this.id = id;
        this.content = content;
        this.relevanceScore = relevanceScore;
        this.generatedBy = generatedBy;
        this.creationDate = creationDate;
    }

    public Integer getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public Float getRelevanceScore() {
        return relevanceScore;
    }

    public String getGeneratedBy() {
        return generatedBy;
    }

    public LocalDateTime getCreationDate() {
        return creationDate;
    }
}
