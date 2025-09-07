package com.backend.logMiner.mapper;

import com.backend.logMiner.dto.*;
import com.backend.logMiner.model.*;

import java.util.stream.Collectors;

public class EntityDtoMapper {

    public static RecommendationDTO toDto(Recommendation r) {
        return new RecommendationDTO(
                r.getId(),
                r.getContent(),
                r.getRelevanceScore(),
                r.getGeneratedBy(),
                r.getCreationDate()
        );
    }

    public static LogDTO toDto(Log l) {
        return new LogDTO(
                l.getIdLog(),
                l.getTimestamp(),
                l.getLevel(),
                l.getSource(),
                l.getMessage(),
                l.getAnalysisStatus(),
                l.getRawLogFile() != null ? l.getRawLogFile().getId() : null,
                l.getRecommendations().stream()
                        .map(EntityDtoMapper::toDto)
                        .collect(Collectors.toList())
        );
    }

    public static RawLogFileDTO toDto(RawLogFile f) {
        return new RawLogFileDTO(
                f.getId(),
                f.getFileName(),
                f.getFileType(),
                f.getFileSize(),
                f.getUploadTime(),
                f.getStatus()
        );
    }

    public static ServerConfigDTO toDto(ServerConfig s) {
        return new ServerConfigDTO(
                s.getIdServerConfig(),
                s.getName(),
                s.getIpAddress(),
                s.getProtocol(),
                s.getPort()
        );
    }


    public static UserDTO toDto(User u) {
        return new UserDTO(
                u.getIdUser(),
                u.getName(),
                u.getLastName(),
                u.getEmail(),
                u.getRole().name()
        );
    }

    public static ProjectDTO toDto(Project p) {
        return new ProjectDTO(
                p.getIdProject(),
                p.getName(),
                p.getDescription(),
                p.getDateOfCreation(),
                p.getLogs().stream()
                        .map(EntityDtoMapper::toDto)
                        .collect(Collectors.toList()),
                p.getUsers().stream()
                        .map(EntityDtoMapper::toDto)
                        .collect(Collectors.toList()),
                p.getServerConfigs().stream()
                        .map(EntityDtoMapper::toDto)
                        .collect(Collectors.toList())
        );
    }
}
