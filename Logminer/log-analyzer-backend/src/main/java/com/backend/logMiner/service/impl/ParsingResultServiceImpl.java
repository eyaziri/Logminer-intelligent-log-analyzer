package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.ParsingResult;
import com.backend.logMiner.repository.ParsingResultRepository;
import com.backend.logMiner.service.ParsingResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor // injecte automatiquement les final
public class ParsingResultServiceImpl implements ParsingResultService {

    private ParsingResultRepository parsingResultRepository;

    @Override
    public ParsingResult saveParsingResult(ParsingResult parsingResult) {
        return parsingResultRepository.save(parsingResult);
    }

    @Override
    public List<ParsingResult> getAllParsingResults() {
        return parsingResultRepository.findAll();
    }

    @Override
    public ParsingResult getParsingResultById(Integer id) {
        return parsingResultRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ParsingResult not found"));
    }

    @Override
    public ParsingResult updateParsingResult(Integer id, ParsingResult parsingResult) {
        ParsingResult existing = getParsingResultById(id);
        existing.setId(parsingResult.getId());
        existing.setExtractedStructure(parsingResult.getExtractedStructure());
        existing.setTokens(parsingResult.getTokens());
        existing.setVectorEmbeddings(parsingResult.getVectorEmbeddings());
        existing.setAnomalyDetected(parsingResult.getAnomalyDetected());
        return parsingResultRepository.save(existing);
    }

    @Override
    public void deleteParsingResult(Integer id) {
        parsingResultRepository.deleteById(id);
    }
}
