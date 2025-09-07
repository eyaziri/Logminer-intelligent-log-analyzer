package com.backend.logMiner.service.impl;

import com.backend.logMiner.client.HintClient;
import com.backend.logMiner.client.RagClient;
import com.backend.logMiner.dto.RawLogFileDTO;
import com.backend.logMiner.mapper.EntityDtoMapper;
import com.backend.logMiner.model.Log;
import com.backend.logMiner.model.Project;
import com.backend.logMiner.model.RawLogFile;
import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.repository.LogRepository;
import com.backend.logMiner.repository.ProjectRepository;
import com.backend.logMiner.repository.RawLogFileRepository;
import com.backend.logMiner.repository.RecommendationRepository;
import com.backend.logMiner.security.customHandlers.ExtensionHandler;
import com.backend.logMiner.service.RawLogFileService;
import com.fasterxml.jackson.core.JsonProcessingException;
import org.apache.commons.io.FilenameUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.Instant;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class RawLogFileServiceImpl implements RawLogFileService {

    private final RawLogFileRepository repo;
    private final ProjectRepository    projectRepo;
    private final RagClient            ragClient;
    private final HintClient           hintClient;
    private final LogRepository        logRepo;
    private final ObjectMapper objectMapper;
    private final RecommendationRepository recommendationRepository;

    public RawLogFileServiceImpl(RawLogFileRepository repo,
                                 ProjectRepository projectRepo,
                                 RagClient ragClient, HintClient hintClient,
                                 LogRepository logRepo, ObjectMapper objectMapper, RecommendationRepository recommendationRepository) {
        this.repo        = repo;
        this.projectRepo = projectRepo;
        this.ragClient   = ragClient;
        this.hintClient = hintClient;
        this.logRepo     = logRepo;
        this.objectMapper = objectMapper;
        this.recommendationRepository = recommendationRepository;
    }

    @Override
    @Transactional
    public RawLogFileDTO saveUpload(Integer projectId, MultipartFile file) throws Exception {
        Project project = projectRepo.getProjectByIdProject(projectId);

        String original = file.getOriginalFilename();
        String ext      = FilenameUtils.getExtension(original == null ? "" : original);

        if (!ExtensionHandler.ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("File type not allowed: " + ext);
        }
        String mime = file.getContentType();
        if (mime == null || !ExtensionHandler.ALLOWED_MIME.contains(mime)) {
            throw new IllegalArgumentException("File mime not allowed: " + mime);
        }

        RawLogFile raw = new RawLogFile();
        raw.setFileName(original);
        raw.setFileType(ext);
        raw.setFileSize(file.getSize());
        raw.setUploadTime(Instant.now());
        raw.setStatus("PENDING");
        raw.setData(file.getBytes());
        raw.setProject(project);

        RawLogFile savedRaw = repo.save(raw);

        List<Log> parsedLogs = ragClient.sendToRag(file.getBytes(), original);
        parsedLogs.forEach(l -> {

            Map<String, Object> logEntry = new HashMap<>();
            logEntry.put("timestamp", l.getTimestamp());   // or null
            logEntry.put("level", l.getLevel());
            logEntry.put("source", l.getSource());
            logEntry.put("message", l.getMessage());
            logEntry.put("problem", l.getProblem());       // or null

            List<Map<String, Object>> jsonPayload = Collections.singletonList(logEntry);
            byte[] payload = null;
            try {
                payload = objectMapper.writeValueAsBytes(jsonPayload);
            } catch (JsonProcessingException e) {
                throw new RuntimeException(e);
            }

            List<Recommendation> hints = hintClient.sendForHints(payload, "log.json");
            hints.forEach(h -> h.setLog(l));
            recommendationRepository.saveAll(hints);
            l.setRawLogFile(savedRaw);
            l.setProject(project);
            l.setAnalysisStatus("ANALYZED");
        });

        logRepo.saveAll(parsedLogs);

        savedRaw.setStatus("PROCESSED");
        repo.saveAndFlush(savedRaw);

        return EntityDtoMapper.toDto(savedRaw);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RawLogFileDTO> listForProject(Integer projectId) {
        return repo.findByProject_IdProject(projectId).stream()
                .map(EntityDtoMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RawLogFileDTO getById(Integer id) {
        RawLogFile raw = repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RawLogFile not found: " + id));
        return EntityDtoMapper.toDto(raw);
    }

    @Override
    @Transactional(readOnly = true)
    public RawLogFile getEntityById(Integer id) {
        return repo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("RawLogFile not found: " + id));
    }

    @Override
    public void delete(Integer id) {
        repo.deleteById(id);
    }
}
