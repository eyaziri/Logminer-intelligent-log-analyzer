package com.backend.logMiner.controller;

import com.backend.logMiner.model.Log;
import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.service.LogService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LogControllerTest {
    @Mock
    private LogService logService;

    @InjectMocks
    private LogController logController;

    private Log sampleLog;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleLog = new Log(1, 1001, "Crash", LocalDateTime.now(), "ERROR", "source", "Some message", "NOT_ANALYZED");
    }

    @Test
    void testGetAllLogs() {
        when(logService.getAllLogs()).thenReturn(List.of(sampleLog));
        ResponseEntity<List<Log>> response = logController.getAllLogs();
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetLogById_Found() {
        when(logService.getLogById(1)).thenReturn(sampleLog);
        ResponseEntity<Log> response = logController.getLogById(1);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals("Crash", response.getBody().getProblem());
    }

    @Test
    void testGetLogById_NotFound() {
        when(logService.getLogById(1)).thenReturn(null);
        ResponseEntity<Log> response = logController.getLogById(1);
        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void testCreateLog() {
        when(logService.createLog(sampleLog)).thenReturn(sampleLog);
        ResponseEntity<Log> response = logController.createLog(sampleLog);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(sampleLog, response.getBody());
    }

    @Test
    void testUpdateLog() {
        when(logService.updateLog(1, sampleLog)).thenReturn(sampleLog);
        ResponseEntity<Log> response = logController.updateLog(1, sampleLog);
        assertEquals(200, response.getStatusCodeValue());
    }

    @Test
    void testDeleteLog_Found() {
        when(logService.getLogById(1)).thenReturn(sampleLog);
        doNothing().when(logService).deleteLog(1);
        ResponseEntity<Void> response = logController.deleteLog(1);
        assertEquals(204, response.getStatusCodeValue());
    }

    @Test
    void testDeleteLog_NotFound() {
        when(logService.getLogById(1)).thenReturn(null);
        ResponseEntity<Void> response = logController.deleteLog(1);
        assertEquals(404, response.getStatusCodeValue());
    }

    @Test
    void testGetAllRecommendations() {
        Recommendation rec = new Recommendation();
        sampleLog.setRecommendations(Collections.singletonList(rec));
        when(logService.getLogById(1)).thenReturn(sampleLog);
        ResponseEntity<List<Recommendation>> response = logController.getAllRecommendations(1);
        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }
}
