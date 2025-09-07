package com.backend.logMiner.service;

import com.backend.logMiner.model.ServerConfig;

import java.util.List;

public interface ServerConfigService {
    ServerConfig getServerConfig(Integer idServerConfig);

    ServerConfig create(ServerConfig serverConfig);

    List<ServerConfig> getAllServerConfigs();

    void deleteServerConfig(Integer idServerConfig);

    ServerConfig update(ServerConfig serverConfig);
}
