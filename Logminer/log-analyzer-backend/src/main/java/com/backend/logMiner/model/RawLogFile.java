package com.backend.logMiner.model;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

@Entity
public class RawLogFile {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize;


    @Column(nullable = false)
    private Instant uploadTime;

    @Column(nullable = false)
    private String status;

    // Store raw bytes in the DB
    @Lob
    @Column(name = "data")
    @Basic(fetch = FetchType.LAZY)
    @JsonIgnore
    private byte[] data;


    @ManyToOne
    @JoinColumn(name="project_id", nullable=false)
    @JsonBackReference("project-raw-logs")
    private Project project;

    @OneToMany(mappedBy = "rawLogFile", cascade = CascadeType.ALL)
    @JsonManagedReference("raw-logs")
    private Set<Log> logs = new HashSet<>();

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Instant getUploadTime() {
        return uploadTime;
    }

    public void setUploadTime(Instant uploadTime) {
        this.uploadTime = uploadTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Object getData(){return null;}

    public byte[] getDataStream() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }

    public Project getProject() {
        return project;
    }

    public void setProject(Project project) {
        this.project = project;
    }

    public Set<Log> getLogs() {
        return logs;
    }

    public void setLogs(Set<Log> logs) {
        this.logs = logs;
    }

}

