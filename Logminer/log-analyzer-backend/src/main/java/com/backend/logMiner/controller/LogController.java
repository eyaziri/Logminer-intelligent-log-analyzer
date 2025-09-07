package com.backend.logMiner.controller;

import com.backend.logMiner.model.Log;
import com.backend.logMiner.model.Recommendation;
import com.backend.logMiner.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/logs")
public class LogController {

    @Autowired
    private LogService logService;

    @GetMapping("/all")
    public ResponseEntity<List<Log>> getAllLogs() {
        List<Log> logs = logService.getAllLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Log> getLogById(@PathVariable Integer id) {
        Log log = logService.getLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/create")
    public ResponseEntity<Log> createLog(@RequestBody Log log) {
        Log createdLog = logService.createLog(log);
        return ResponseEntity.ok(createdLog);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Log> updateLog(@PathVariable Integer id,@RequestBody Log log) {
        Log updatedLog = logService.updateLog(id,log);
        return ResponseEntity.ok(updatedLog);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteLog(@PathVariable Integer id) {
        Log existingLog = logService.getLogById(id);
        if (existingLog != null) {
            logService.deleteLog(id);
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/get-hints/{logId}")
    public ResponseEntity<List<Recommendation>> getAllRecommendations(@PathVariable Integer logId){
        return ResponseEntity.ok(logService.getLogById(logId).getRecommendations());
    }

}
