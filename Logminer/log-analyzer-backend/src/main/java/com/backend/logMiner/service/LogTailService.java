package com.backend.logMiner.service;

import com.backend.logMiner.client.RagClient;
import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.repository.LogRepository;

import java.util.Map;

public interface LogTailService {

    void startTailing(Integer serverId);

    void startTailer(Integer serverId, String path, ServerConfig cfg);

    void stopTailing(Integer serverId);

    boolean isTailing(Integer serverId);

    Map<Integer, Boolean> getAllTailingStatuses();
}
