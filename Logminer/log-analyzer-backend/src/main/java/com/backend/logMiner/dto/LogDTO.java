package com.backend.logMiner.dto;

import java.time.LocalDateTime;
import java.util.List;

public class LogDTO {
    private final  int idLog;
    private final  LocalDateTime timestamp;
    private final  String level;
    private final  String source;
    private final  String message;
    private final  String analysisStatus;
    private final  Integer rawLogFileId;
    private final  List<RecommendationDTO> recommendations;

    public LogDTO(int idLog,
                  LocalDateTime timestamp,
                  String level,
                  String source,
                  String message,
                  String analysisStatus,
                  Integer rawLogFileId,
                  List<RecommendationDTO> recommendations) {
        this.idLog = idLog;
        this.timestamp = timestamp;
        this.level = level;
        this.source = source;
        this.message = message;
        this.analysisStatus = analysisStatus;
        this.rawLogFileId = rawLogFileId;
        this.recommendations = recommendations;
    }

    public int getIdLog() {
        return idLog;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getLevel() {
        return level;
    }

    public String getSource() {
        return source;
    }

    public String getMessage() {
        return message;
    }

    public String getAnalysisStatus() {
        return analysisStatus;
    }

    public Integer getRawLogFileId() {
        return rawLogFileId;
    }

    public List<RecommendationDTO> getRecommendations() {
        return recommendations;
    }
}
