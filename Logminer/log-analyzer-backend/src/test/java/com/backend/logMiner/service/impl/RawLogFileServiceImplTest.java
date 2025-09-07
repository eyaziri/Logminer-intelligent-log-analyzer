package com.backend.logMiner.service.impl;

import com.backend.logMiner.client.HintClient;
import com.backend.logMiner.client.RagClient;
import com.backend.logMiner.dto.RawLogFileDTO;
import com.backend.logMiner.model.RawLogFile;
import com.backend.logMiner.repository.ProjectRepository;
import com.backend.logMiner.repository.RawLogFileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class RawLogFileServiceImplTest {
    @Mock
    private RawLogFileRepository rawLogFileRepository;

    @Mock
    private ProjectRepository projectRepository;

    @Mock
    private RagClient ragClient;

    @Mock
    private HintClient hintClient;

    @InjectMocks
    private RawLogFileServiceImpl rawLogFileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }



    @Test
    void testGetById() {
        RawLogFile file = new RawLogFile();
        file.setId(1);
        when(rawLogFileRepository.findById(1)).thenReturn(Optional.of(file));

        RawLogFileDTO result = rawLogFileService.getById(1);
        assertNotNull(result);
        assertEquals(1, result.getId());
    }


}
