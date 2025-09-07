package com.backend.logMiner.controller;

import com.backend.logMiner.model.ParsingResult;
import com.backend.logMiner.service.ParsingResultService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ParsingResultControllerTest {
    @Mock
    private ParsingResultService parsingResultService;

    @InjectMocks
    private ParsingResultController parsingResultController;

    private ParsingResult mockResult;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        mockResult = new ParsingResult();
        mockResult.setId(1);
        mockResult.setExtractedStructure("structure");
        mockResult.setAnomalyDetected(false);
    }

    @Test
    void testCreateParsingResult() {
        when(parsingResultService.saveParsingResult(any())).thenReturn(mockResult);

        ResponseEntity<ParsingResult> response = parsingResultController.create(mockResult);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResult, response.getBody());
    }

    @Test
    void testGetAllParsingResults() {
        List<ParsingResult> results = Arrays.asList(mockResult);
        when(parsingResultService.getAllParsingResults()).thenReturn(results);

        ResponseEntity<List<ParsingResult>> response = parsingResultController.getAll();

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void testGetParsingResultById_found() {
        when(parsingResultService.getParsingResultById(1)).thenReturn(mockResult);

        ResponseEntity<ParsingResult> response = parsingResultController.getById(1);

        assertEquals(200, response.getStatusCodeValue());
        assertEquals(mockResult, response.getBody());
    }

    @Test
    void testGetParsingResultById_notFound() {
        when(parsingResultService.getParsingResultById(1)).thenReturn(null);

        ResponseEntity<ParsingResult> response = parsingResultController.getById(1);

        assertEquals(404, response.getStatusCodeValue());
    }


    @Test
    void testDeleteParsingResult_found() {
        when(parsingResultService.getParsingResultById(1)).thenReturn(mockResult);
        doNothing().when(parsingResultService).deleteParsingResult(1);

        ResponseEntity<Void> response = parsingResultController.delete(1);

        assertEquals(204, response.getStatusCodeValue());
    }

    @Test
    void testDeleteParsingResult_notFound() {
        when(parsingResultService.getParsingResultById(1)).thenReturn(null);

        ResponseEntity<Void> response = parsingResultController.delete(1);

        assertEquals(404, response.getStatusCodeValue());
    }
}
