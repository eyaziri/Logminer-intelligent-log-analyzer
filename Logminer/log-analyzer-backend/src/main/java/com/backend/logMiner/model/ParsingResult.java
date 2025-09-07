package com.backend.logMiner.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class ParsingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "log_id")
    private Log log;

    @Lob
    private String extractedStructure;

    @ElementCollection
    private List<String> tokens;

    @ElementCollection
    private List<Float> vectorEmbeddings;

    private Boolean anomalyDetected;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Log getLog() {
        return log;
    }

    public void setLog(Log log) {
        this.log = log;
    }

    public String getExtractedStructure() {
        return extractedStructure;
    }

    public void setExtractedStructure(String extractedStructure) {
        this.extractedStructure = extractedStructure;
    }

    public List<String> getTokens() {
        return tokens;
    }

    public void setTokens(List<String> tokens) {
        this.tokens = tokens;
    }

    public List<Float> getVectorEmbeddings() {
        return vectorEmbeddings;
    }

    public void setVectorEmbeddings(List<Float> vectorEmbeddings) {
        this.vectorEmbeddings = vectorEmbeddings;
    }

    public Boolean getAnomalyDetected() {
        return anomalyDetected;
    }

    public void setAnomalyDetected(Boolean anomalyDetected) {
        this.anomalyDetected = anomalyDetected;
    }
}
