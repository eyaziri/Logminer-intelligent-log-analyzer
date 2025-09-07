package com.backend.logMiner.controller;

import com.backend.logMiner.model.ParsingResult;
import com.backend.logMiner.service.ParsingResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/parsing-results")
public class ParsingResultController {

    private final ParsingResultService parsingResultService;

    @Autowired
    public ParsingResultController(ParsingResultService parsingResultService) {
        this.parsingResultService = parsingResultService;
    }

    @PostMapping("/create")
    public ResponseEntity<ParsingResult> create(@RequestBody ParsingResult parsingResult) {
        ParsingResult savedResult = parsingResultService.saveParsingResult(parsingResult);
        return ResponseEntity.ok(savedResult);
    }

    @GetMapping("/all")
    public ResponseEntity<List<ParsingResult>> getAll() {
        List<ParsingResult> results = parsingResultService.getAllParsingResults();
        return ResponseEntity.ok(results);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<ParsingResult> getById(@PathVariable Integer id) {
        ParsingResult result = parsingResultService.getParsingResultById(id);
        if (result != null) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ParsingResult> update(@PathVariable Integer id, @RequestBody ParsingResult parsingResult) {
        ParsingResult updatedResult = parsingResultService.updateParsingResult(id,parsingResult);
        return ResponseEntity.ok(updatedResult);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        ParsingResult existing = parsingResultService.getParsingResultById(id);
        if (existing != null) {
            parsingResultService.deleteParsingResult(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
