package com.backend.logMiner.service.impl;

import com.backend.logMiner.model.Log;
import com.backend.logMiner.repository.LogRepository;
import com.backend.logMiner.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LogServiceImpl implements LogService {

    @Autowired
    private LogRepository logRepository;

    @Override
    public List<Log> getAllLogs() {
        return logRepository.findAll();
    }

    @Override
    public Log getLogById(Integer id) {
        return logRepository.findById(id).orElseThrow(() -> new RuntimeException("Log not found"));
    }

    @Override
    public Log createLog(Log log) {
        return logRepository.save(log);
    }

    @Override
    public Log updateLog(Integer id, Log updatedLog) {
        Log log = getLogById(id);
        log.setTimestamp(updatedLog.getTimestamp());
        log.setLevel(updatedLog.getLevel());
        log.setSource(updatedLog.getSource());
        log.setMessage(updatedLog.getMessage());
        log.setProject(updatedLog.getProject());
        log.setAnalysisStatus(updatedLog.getAnalysisStatus());
        return logRepository.save(log);
    }

    @Override
    public void deleteLog(Integer id) {
        logRepository.deleteById(id);
    }
}
