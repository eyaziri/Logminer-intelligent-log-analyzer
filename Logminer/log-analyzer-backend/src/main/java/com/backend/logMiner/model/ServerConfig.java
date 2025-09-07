package com.backend.logMiner.model;

import com.backend.logMiner.dto.ServerConfigDTO;
import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

import java.util.List;

@Entity
public class ServerConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idServerConfig;

    private String password;

    private String name;

    private String ipAddress;

    private String protocol;

    private Integer port;

    private String logPath;

    private String errorLogPath;
    private String logType;
    private String logFormat;
    private Integer fetchFrequencyMinutes;

    @ElementCollection
    @CollectionTable(name = "alert_keywords", joinColumns = @JoinColumn(name = "id_server_config"))
    @Column(name = "keyword")
    private List<String> alertKeywords;

    private Integer errorThreshold;


    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference("user-servers")
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id")
    @JsonBackReference("project-servers")
    private Project project;

    private String authMethod;
    private String status;
    private String logRetrievalMode;
    private String logRotationPolicy;

    public Integer getIdServerConfig() {
        return idServerConfig;
    }

    public void setIdServerConfig(Integer idServerConfig) {
        this.idServerConfig = idServerConfig;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getLogPath() {
        return logPath;
    }

    public void setLogPath(String logPath) {
        this.logPath = logPath;
    }

    public String getErrorLogPath() {
        return errorLogPath;
    }

    public void setErrorLogPath(String errorLogPath) {
        this.errorLogPath = errorLogPath;
    }

    public String getLogType() {
        return logType;
    }

    public void setLogType(String logType) {
        this.logType = logType;
    }

    public String getLogFormat() {
        return logFormat;
    }

    public void setLogFormat(String logFormat) {
        this.logFormat = logFormat;
    }

    public Integer getFetchFrequencyMinutes() {
        return fetchFrequencyMinutes;
    }

    public void setFetchFrequencyMinutes(Integer fetchFrequencyMinutes) {
        this.fetchFrequencyMinutes = fetchFrequencyMinutes;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public String getAuthMethod() {
        return authMethod;
    }

    public void setAuthMethod(String authMethod) {
        this.authMethod = authMethod;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLogRetrievalMode() {
        return logRetrievalMode;
    }

    public void setLogRetrievalMode(String logRetrievalMode) {
        this.logRetrievalMode = logRetrievalMode;
    }

    public String getLogRotationPolicy() {
        return logRotationPolicy;
    }

    public void setLogRotationPolicy(String logRotationPolicy) {
        this.logRotationPolicy = logRotationPolicy;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public List<String> getAlertKeywords() {
        return alertKeywords;
    }

    public void setAlertKeywords(List<String> alertKeywords) {
        this.alertKeywords = alertKeywords;
    }


    public Integer getErrorThreshold() {
        return errorThreshold;
    }

    public void setErrorThreshold(Integer errorThreshold) {
        this.errorThreshold = errorThreshold;
    }

}
