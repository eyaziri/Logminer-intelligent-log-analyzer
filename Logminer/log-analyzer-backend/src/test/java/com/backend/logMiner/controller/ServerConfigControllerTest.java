package com.backend.logMiner.controller;

import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.model.User;
import com.backend.logMiner.service.LogTailService;
import com.backend.logMiner.service.ServerConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ServerConfigControllerTest {
    @Mock
    private ServerConfigService serverConfigService;

    @Mock
    private LogTailService tailService;

    @InjectMocks
    private ServerConfigController controller;

    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        controller = new ServerConfigController(serverConfigService, tailService);
    }

    @Test
    void testStartTailing() {
        ResponseEntity<Void> response = controller.startTailing(1);
        verify(tailService).startTailing(1);
        assertEquals(202, response.getStatusCodeValue());
    }

    @Test
    void testStopTailing() {
        ResponseEntity<Void> response = controller.stopTailing(2);
        verify(tailService).stopTailing(2);
        assertEquals(202, response.getStatusCodeValue());
    }

    @Test
    void testGetServerConfig() {
        ServerConfig cfg = new ServerConfig();
        when(serverConfigService.getServerConfig(1)).thenReturn(cfg);

        ResponseEntity<ServerConfig> response = controller.getServerConfig(1);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(cfg, response.getBody());
    }

    @Test
    void testGetAllServerConfigs() {
        List<ServerConfig> configs = Collections.singletonList(new ServerConfig());
        when(serverConfigService.getAllServerConfigs()).thenReturn(configs);

        ResponseEntity<List<ServerConfig>> response = controller.getAllServerConfigs();
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testDeleteServerConfig() {
        ResponseEntity<Void> response = controller.deleteServerConfig(1);
        verify(serverConfigService).deleteServerConfig(1);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testUpdateServerConfig() {
        ServerConfig input = new ServerConfig();
        input.setName("Updated");

        when(serverConfigService.update(input)).thenReturn(input);

        ResponseEntity<ServerConfig> response = controller.updateServerConfig(input);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Updated", response.getBody().getName());
    }



    @Test
    void testGetTailingStatuses() {
        Map<Integer, Boolean> statusMap = Map.of(1, true, 2, false);
        when(tailService.getAllTailingStatuses()).thenReturn(statusMap);

        ResponseEntity<Map<Integer, Boolean>> response = controller.getTailingStatuses();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(statusMap, response.getBody());
    }
}