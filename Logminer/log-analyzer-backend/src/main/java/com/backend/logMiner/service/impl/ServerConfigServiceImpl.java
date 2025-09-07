package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.repository.ServerConfigRepository;
import com.backend.logMiner.security.AESUtil;
import com.backend.logMiner.security.SecretManager;
import com.backend.logMiner.service.ServerConfigService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ServerConfigServiceImpl implements ServerConfigService {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Autowired
    private final ServerConfigRepository serverConfigRepository;

    @Autowired
    public ServerConfigServiceImpl(ServerConfigRepository serverConfigRepository) {
        this.serverConfigRepository = serverConfigRepository;
    }

    @Override
    public ServerConfig getServerConfig(Integer idServerConfig) {
        return serverConfigRepository.getServerConfigByIdServerConfig(idServerConfig);
    }

    // NOTE : we need to use passwordEncoder.matches(given_pwd,our_pwd) to compare a given pwd to our hashed pwd
    @Override
    public ServerConfig create(ServerConfig serverConfig) {
        try {
            String encryptedPassword = AESUtil.encrypt(serverConfig.getPassword(), SecretManager.getSecretKey());
            serverConfig.setPassword(encryptedPassword);
        } catch (Exception e) {
            throw new RuntimeException("Erreur de chiffrement du mot de passe", e);
        }
        return serverConfigRepository.save(serverConfig);
    }


    @Override
    public List<ServerConfig> getAllServerConfigs() {
        return serverConfigRepository.findAll();
    }

    @Override
    public void deleteServerConfig(Integer idServerConfig) {
        serverConfigRepository.delete(serverConfigRepository.getServerConfigByIdServerConfig(idServerConfig));
    }

    @Override
    public ServerConfig update(ServerConfig cfg) {
        ServerConfig existing = serverConfigRepository.findById(cfg.getIdServerConfig())
                .orElseThrow(() -> new EntityNotFoundException("ServerConfig not found"));

        existing.setName(cfg.getName());
        existing.setIpAddress(cfg.getIpAddress());
        existing.setProtocol(cfg.getProtocol());
        existing.setPort(cfg.getPort());
        existing.setStatus(cfg.getStatus());
        existing.setErrorLogPath(cfg.getErrorLogPath());
        existing.setPassword(cfg.getPassword());
        existing.setAuthMethod(cfg.getAuthMethod());
        existing.setFetchFrequencyMinutes(cfg.getFetchFrequencyMinutes());
        existing.setLogFormat(cfg.getLogFormat());
        existing.setLogRetrievalMode(cfg.getLogRetrievalMode());
        existing.setLogRotationPolicy(cfg.getLogRotationPolicy());
        existing.setLogType(cfg.getLogType());
        existing.setLogPath(cfg.getLogPath());
        existing.setAlertKeywords((cfg.getAlertKeywords()));
        existing.setErrorThreshold(cfg.getErrorThreshold());

        return serverConfigRepository.save(existing);
    }

}
