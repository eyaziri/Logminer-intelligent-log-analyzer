package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.repository.ServerConfigRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Optional;
import java.util.List;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ServerConfigServiceImplTest {
    @Mock
    private ServerConfigRepository serverConfigRepository;

    @InjectMocks
    private ServerConfigServiceImpl serverConfigService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testGetServerConfig() {
        ServerConfig config = new ServerConfig();
        config.setIdServerConfig(1);
        when(serverConfigRepository.getServerConfigByIdServerConfig(1)).thenReturn(config);

        ServerConfig result = serverConfigService.getServerConfig(1);

        assertNotNull(result);
        assertEquals(1, result.getIdServerConfig());
    }

    @Test
    void testGetAllServerConfigs() {
        when(serverConfigRepository.findAll()).thenReturn(Collections.singletonList(new ServerConfig()));

        List<ServerConfig> result = serverConfigService.getAllServerConfigs();

        assertEquals(1, result.size());
    }



    @Test
    void testUpdate() {
        ServerConfig existing = new ServerConfig();
        existing.setIdServerConfig(1);

        ServerConfig updated = new ServerConfig();
        updated.setIdServerConfig(1);
        updated.setName("Updated");

        when(serverConfigRepository.findById(1)).thenReturn(Optional.of(existing));
        when(serverConfigRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        ServerConfig result = serverConfigService.update(updated);

        assertEquals("Updated", result.getName());
    }

    @Test
    void testDeleteServerConfig() {
        ServerConfig config = new ServerConfig();
        when(serverConfigRepository.getServerConfigByIdServerConfig(1)).thenReturn(config);

        serverConfigService.deleteServerConfig(1);

        verify(serverConfigRepository).delete(config);
    }
}
