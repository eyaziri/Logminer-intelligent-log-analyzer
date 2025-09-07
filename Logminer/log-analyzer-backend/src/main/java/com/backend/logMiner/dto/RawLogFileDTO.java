package com.backend.logMiner.dto;

import java.time.Instant;

public class RawLogFileDTO {
    private final  Integer id;
    private final  String fileName;
    private final  String fileType;
    private final  Long fileSize;
    private final  Instant uploadTime;
    private final  String status;

    public RawLogFileDTO(Integer id,
                         String fileName,
                         String fileType,
                         Long fileSize,
                         Instant uploadTime,
                         String status) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.uploadTime = uploadTime;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public String getFileName() {
        return fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public Instant getUploadTime() {
        return uploadTime;
    }

    public String getStatus() {
        return status;
    }
}