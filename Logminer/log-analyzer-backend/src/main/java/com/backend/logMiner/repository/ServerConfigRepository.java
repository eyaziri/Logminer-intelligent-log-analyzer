package com.backend.logMiner.repository;

import com.backend.logMiner.model.ServerConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServerConfigRepository extends JpaRepository<ServerConfig,Integer> {
    ServerConfig getServerConfigByIdServerConfig(Integer idServerConfig);
}
