// src/main/java/com/backend/logMiner/service/impl/LogTailServiceImpl.java
package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.repository.ServerConfigRepository;
import com.backend.logMiner.service.EventChunkService;
import com.backend.logMiner.service.LogTailService;
import com.backend.logMiner.service.ServerConfigService;
import org.apache.commons.io.input.Tailer;
import org.apache.commons.io.input.TailerListenerAdapter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LogTailServiceImpl implements LogTailService {

    private final ServerConfigRepository serverRepo;
    private final EventChunkService      chunkService;
    @Autowired
    private final ServerConfigService    serverConfigService;
    private final Map<Integer, Tailer>   activeTailers = new ConcurrentHashMap<>();

    public LogTailServiceImpl(ServerConfigRepository serverRepo,
                              EventChunkService chunkService, ServerConfigService serverConfigService) {
        this.serverRepo   = serverRepo;
        this.chunkService = chunkService;
        this.serverConfigService = serverConfigService;
    }

    @Override
    public void startTailing(Integer serverId) {
        ServerConfig cfg = serverRepo.findById(serverId)
                .orElseThrow(() -> new IllegalArgumentException("No server " + serverId));

        String logPath = cfg.getLogPath();
        String errorPath = cfg.getErrorLogPath();

        if (logPath != null && !logPath.isBlank()) {
            startTailer(serverId, logPath,cfg);
        }
        if (errorPath != null && !errorPath.isBlank() && !errorPath.equals(logPath)) {
            startTailer(serverId, errorPath,cfg);
        }

    }

    @Override
    public void startTailer(Integer serverId, String path, ServerConfig cfg) {
        File file = new File(path);
        if (!file.exists() || !file.canRead()) {
            System.err.printf("Cannot tail file %s for server %d: not found or unreadable\n", path, serverId);
            cfg.setStatus("stopped");
            serverConfigService.update(cfg);
            return;
        }

        // Stop any existing tailer for this server
        stopTailing(serverId);
        cfg.setStatus("running");

        ServerConfig serverConfig = serverConfigService.getServerConfig(serverId);

        List<String> alertKeywords = serverConfig.getAlertKeywords().isEmpty()
                ? new ArrayList<>() :
                serverConfig.getAlertKeywords();

        String adminEmail = serverConfig.getUser().getEmail() != null
                ? serverConfig.getUser().getEmail()
                : "ouday908070@gmail.com";

        TailerListenerAdapter listener = new EventChunkListener(
                serverId,
                file.getName(),
                chunkService,
                "ouday908070@gmail.com" ,// Admin email : adminEmail
                alertKeywords
        );

        Tailer tailer = Tailer.create(file, listener, 1000, true);
        activeTailers.put(serverId, tailer);
        serverConfigService.update(cfg);
    }


    @Override
    public void stopTailing(Integer serverId) {
        ServerConfig cfg = serverRepo.findById(serverId)
                .orElseThrow(() -> new IllegalArgumentException("No server " + serverId));
        Tailer tailer = activeTailers.remove(serverId);
        if (tailer != null) {
            tailer.stop();
            System.out.printf("Stopped tailer for server %d\n", serverId);
            cfg.setStatus("stopped");
            serverConfigService.update(cfg);
        } else {
            System.out.printf("No active tailer found for server %d\n", serverId);
        }
    }

    @Override
    public boolean isTailing(Integer serverId) {
        return activeTailers.containsKey(serverId);
    }

    @Override
    public Map<Integer, Boolean> getAllTailingStatuses() {
        Map<Integer, Boolean> statusMap = new HashMap<>();
        for (ServerConfig config : serverRepo.findAll()) {
            statusMap.put(config.getIdServerConfig(), isTailing(config.getIdServerConfig()));
        }
        return statusMap;
    }


}
