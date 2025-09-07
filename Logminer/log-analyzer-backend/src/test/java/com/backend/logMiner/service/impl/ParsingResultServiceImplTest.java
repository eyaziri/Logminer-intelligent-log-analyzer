package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.ParsingResult;
import com.backend.logMiner.repository.ParsingResultRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class ParsingResultServiceImplTest {
    @Mock
    private ParsingResultRepository parsingResultRepository;

    @InjectMocks
    private ParsingResultServiceImpl parsingResultService;

    private ParsingResult parsingResult;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        parsingResult = new ParsingResult();
        parsingResult.setId(1);
        parsingResult.setExtractedStructure("structure");
        parsingResult.setAnomalyDetected(false);
    }

    @Test
    void testSaveParsingResult() {
        when(parsingResultRepository.save(parsingResult)).thenReturn(parsingResult);

        ParsingResult saved = parsingResultService.saveParsingResult(parsingResult);

        assertEquals(parsingResult, saved);
    }

    @Test
    void testGetAllParsingResults() {
        List<ParsingResult> list = Arrays.asList(parsingResult);
        when(parsingResultRepository.findAll()).thenReturn(list);

        List<ParsingResult> results = parsingResultService.getAllParsingResults();

        assertEquals(1, results.size());
    }

    @Test
    void testGetParsingResultById_found() {
        when(parsingResultRepository.findById(1)).thenReturn(Optional.of(parsingResult));

        ParsingResult result = parsingResultService.getParsingResultById(1);

        assertEquals(parsingResult, result);
    }

    @Test
    void testGetParsingResultById_notFound() {
        when(parsingResultRepository.findById(2)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> {
            parsingResultService.getParsingResultById(2);
        });

        assertTrue(exception.getMessage().contains("ParsingResult not found"));
    }



    @Test
    void testDeleteParsingResult() {
        doNothing().when(parsingResultRepository).deleteById(1);

        parsingResultService.deleteParsingResult(1);

        verify(parsingResultRepository, times(1)).deleteById(1);
    }
}
