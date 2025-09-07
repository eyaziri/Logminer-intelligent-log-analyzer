package com.backend.logMiner.service;

import com.backend.logMiner.model.ParsingResult;

import java.util.List;

public interface ParsingResultService {

    ParsingResult saveParsingResult(ParsingResult parsingResult);

    List<ParsingResult> getAllParsingResults();

    ParsingResult getParsingResultById(Integer id);

    ParsingResult updateParsingResult(Integer id, ParsingResult parsingResult);

    void deleteParsingResult(Integer id);
}
