package com.backend.logMiner.service.impl;

import com.backend.logMiner.service.EventChunkService;
import org.apache.commons.io.input.TailerListenerAdapter;

import java.util.List;

public class EventChunkListener extends TailerListenerAdapter {
    private final Integer           serverId;
    private final String            rawFileName;
    private final EventChunkService chunkService;
    private final String            adminEmail;
    private final List<String>      alertKeywords;


    public EventChunkListener(Integer serverId,
                              String rawFileName,
                              EventChunkService chunkService, String adminEmail, List<String> alertKeywords) {
        this.serverId      = serverId;
        this.rawFileName   = rawFileName;
        this.chunkService  = chunkService;
        this.adminEmail = adminEmail;
        this.alertKeywords = alertKeywords;
    }

    @Override
    public void handle(String line) {
        chunkService.onLine(serverId, rawFileName, line , adminEmail ,alertKeywords);
    }

    @Override
    public void endOfFileReached() {
        chunkService.onEndOfFile(serverId, rawFileName);
    }
}
