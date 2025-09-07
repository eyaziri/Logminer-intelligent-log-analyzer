package com.backend.logMiner.service;

import com.backend.logMiner.model.Log;

import java.util.List;

public interface LogService {
    List<Log> getAllLogs();
    Log getLogById(Integer id);
    Log createLog(Log log);
    Log updateLog(Integer id, Log updatedLog);
    void deleteLog(Integer id);
}