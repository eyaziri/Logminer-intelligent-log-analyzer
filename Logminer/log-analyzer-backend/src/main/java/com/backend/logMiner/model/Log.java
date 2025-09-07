package com.backend.logMiner.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int idLog;

    private Integer idServerConfig;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonBackReference("project-logs")
    private Project project;

    private String problem;
    private LocalDateTime timestamp;
    private String level;
    private String source;
    @Column(columnDefinition = "TEXT")
    private String message;
    private String analysisStatus;

    @OneToOne(mappedBy = "log", cascade = CascadeType.ALL)
    private ParsingResult parsingResult;

    @OneToMany(mappedBy = "log", cascade = CascadeType.ALL)
    @JsonManagedReference("recommendation-logs")
    private List<Recommendation> recommendations;

    @ManyToOne
    @JsonBackReference("raw-logs")
    private RawLogFile rawLogFile;

    public Log(int idLog, Integer idServerConfig, String problem, LocalDateTime timestamp, String level, String source, String message, String analysisStatus) {
        this.idLog = idLog;
        this.idServerConfig = idServerConfig;
        this.problem = problem;
        this.timestamp = timestamp;
        this.level = level;
        this.source = source;
        this.message = message;
        this.analysisStatus = analysisStatus;
    }


    public int getIdLog() {
        return idLog;
    }

    public void setIdLog(int idLog) {
        this.idLog = idLog;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getAnalysisStatus() {
        return analysisStatus;
    }

    public void setAnalysisStatus(String analysisStatus) {
        this.analysisStatus = analysisStatus;
    }

    public ParsingResult getParsingResult() {
        return parsingResult;
    }

    public void setParsingResult(ParsingResult parsingResult) {
        this.parsingResult = parsingResult;
    }

    public List<Recommendation> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Recommendation> recommendations) {
        this.recommendations = recommendations;
    }

    public RawLogFile getRawLogFile() {
        return rawLogFile;
    }

    public void setRawLogFile(RawLogFile rawLogFile) {
        this.rawLogFile = rawLogFile;
    }

    public String getProblem() {
        return problem;
    }

    public void setProblem(String problem) {
        this.problem = problem;
    }

    public Integer getIdServerConfig() {
        return idServerConfig;
    }

    public void setIdServerConfig(Integer idServerConfig) {
        this.idServerConfig = idServerConfig;
    }
}
