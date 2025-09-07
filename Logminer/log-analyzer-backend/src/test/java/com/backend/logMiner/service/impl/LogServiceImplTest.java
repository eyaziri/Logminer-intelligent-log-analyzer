package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.Log;
import com.backend.logMiner.repository.LogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class LogServiceImplTest {
    @Mock
    private LogRepository logRepository;

    @InjectMocks
    private LogServiceImpl logService;

    private Log sampleLog;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        sampleLog = new Log(1, 1001, "Crash", LocalDateTime.now(), "ERROR", "system", "Some error message", "NOT_ANALYZED");
    }

    @Test
    void testGetAllLogs() {
        when(logRepository.findAll()).thenReturn(Arrays.asList(sampleLog));
        assertEquals(1, logService.getAllLogs().size());
    }

    @Test
    void testGetLogById() {
        when(logRepository.findById(1)).thenReturn(Optional.of(sampleLog));
        Log log = logService.getLogById(1);
        assertEquals("Crash", log.getProblem());
    }

    @Test
    void testCreateLog() {
        when(logRepository.save(sampleLog)).thenReturn(sampleLog);
        Log created = logService.createLog(sampleLog);
        assertEquals(sampleLog, created);
    }

    @Test
    void testUpdateLog() {
        Log updated = new Log(1, 1001, "New crash", LocalDateTime.now(), "WARN", "source2", "Updated message", "ANALYZED");
        when(logRepository.findById(1)).thenReturn(Optional.of(sampleLog));
        when(logRepository.save(any(Log.class))).thenReturn(updated);

        Log result = logService.updateLog(1, updated);
        assertEquals("Updated message", result.getMessage());
    }

    @Test
    void testDeleteLog() {
        doNothing().when(logRepository).deleteById(1);
        logService.deleteLog(1);
        verify(logRepository, times(1)).deleteById(1);
    }
}
