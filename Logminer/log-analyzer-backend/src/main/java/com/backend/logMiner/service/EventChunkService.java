package com.backend.logMiner.service;

import java.util.List;

public interface EventChunkService {

    void onLine(Integer serverId, String rawFileName, String line, String adminEmail, List<String> keyWords);

    void onEndOfFile(Integer serverId, String rawFileName);
}
