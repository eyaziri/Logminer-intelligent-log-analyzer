package com.backend.logMiner.service.impl;

import com.backend.logMiner.client.HintClient;
import com.backend.logMiner.client.RagClient;
import com.backend.logMiner.model.Log;
import com.backend.logMiner.model.RawLogFile;
import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.redis.RedisNotificationSilencer;
import com.backend.logMiner.repository.LogRepository;
import com.backend.logMiner.repository.RawLogFileRepository;
import com.backend.logMiner.repository.RecommendationRepository;
import com.backend.logMiner.repository.ServerConfigRepository;
import com.backend.logMiner.service.EmailService;
import com.backend.logMiner.service.EventChunkService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;


import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class EventChunkServiceImpl implements EventChunkService {

    private final ServerConfigRepository   serverRepo;
    private final RawLogFileRepository     rawRepo;
    private final LogRepository            logRepo;
    private final RagClient                ragClient;
    private final SimpMessagingTemplate    messaging;
    private final HintClient               hintClient;
    private final ObjectMapper             objectMapper;
    private final RecommendationRepository recommendationRepository;
    private final EmailService emailService;

    @Autowired
    private RedisNotificationSilencer silencer ;

    // boundary detection + overlap
    private static final Pattern EVENT_START = Pattern
            .compile("^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}");
    private static final int OVERLAP = 20;

    private final Map<String, List<String>> buffers = new HashMap<>();

    public EventChunkServiceImpl(ServerConfigRepository serverRepo,
                                 RawLogFileRepository rawRepo,
                                 LogRepository logRepo,
                                 RagClient ragClient,
                                 SimpMessagingTemplate messaging, HintClient hintClient, ObjectMapper objectMapper, RecommendationRepository recommendationRepository, EmailService emailService, RedisNotificationSilencer silencer) {
        this.serverRepo = serverRepo;
        this.rawRepo    = rawRepo;
        this.logRepo    = logRepo;
        this.ragClient  = ragClient;
        this.messaging  = messaging;
        this.hintClient = hintClient;
        this.objectMapper = objectMapper;
        this.recommendationRepository = recommendationRepository;
        this.emailService = emailService;
    }

    @Override
    public synchronized void onLine(Integer serverId, String rawFileName, String line, String adminEmail, List<String> alertKeywords) {
        String key = serverId + "|" + rawFileName;
        List<String> buf = buffers.computeIfAbsent(key, k -> new ArrayList<>());

        if (!buf.isEmpty() && EVENT_START.matcher(line).find()) {
            flushChunk(serverId, rawFileName, buf);
            List<String> tail = new ArrayList<>(
                    buf.subList(Math.max(0, buf.size() - OVERLAP), buf.size()));
            buf.clear();
            buf.addAll(tail);
        }

        for (String w : alertKeywords) {
            if (line.toLowerCase().contains(w.toLowerCase()) ) {
                if(silencer.shouldNotify(serverId.toString(),adminEmail)) {
                    emailService.sendEmail(
                            adminEmail,
                            "Blocking error detected",
                            "A blocking error was detected in server log and it might lead to server stopping."
                    );
                    break;
                }else{
                    System.out.println("email silenced");
                }
            }
        }

        buf.add(line);
    }

    @Override
    public synchronized void onEndOfFile(Integer serverId, String rawFileName) {
        String key = serverId + "|" + rawFileName;
        List<String> buf = buffers.get(key);
        if (buf != null && !buf.isEmpty()) {
            flushChunk(serverId, rawFileName, buf);
            buf.clear();
        }
    }

    @Transactional
    protected void flushChunk(Integer serverId, String rawFileName, List<String> buf) {
        // 1) Persist raw chunk
        RawLogFile raw = new RawLogFile();
        raw.setFileName(rawFileName);
        raw.setFileType("text/plain");
        byte[] data = String.join("\n", buf).getBytes(StandardCharsets.UTF_8);
        raw.setData(data);
        raw.setUploadTime(Instant.now());
        raw.setStatus("NEW");
        // link project via server→project
        ServerConfig cfg = serverRepo.findById(serverId)
                .orElseThrow();
        raw.setProject(cfg.getProject());
        raw = rawRepo.save(raw);

        // 2) Call RAG
        List<Log> parsed = ragClient.sendToRag(data, rawFileName);

        // 3) Save & broadcast each Log
        for (Log l : parsed) {
            l.setRawLogFile(raw);
            l.setProject(raw.getProject());
            l.setAnalysisStatus("PARSED");
            l.setIdServerConfig(serverId);
            Log saved = logRepo.save(l);

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

            messaging.convertAndSend("/topic/logs/" + serverId, saved);
        }
    }
}
