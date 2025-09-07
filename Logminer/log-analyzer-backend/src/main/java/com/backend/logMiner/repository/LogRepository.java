package com.backend.logMiner.repository;

import com.backend.logMiner.model.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LogRepository extends JpaRepository<Log, Integer> {

    @Query("SELECT new com.backend.logMiner.model.Log(l.idLog, l.idServerConfig, l.problem, l.timestamp, l.level, l.source, l.message, l.analysisStatus) " +
            "FROM Log l WHERE l.level = 'ERROR' AND l.idServerConfig IS NOT NULL AND l.timestamp >= :since")
    List<Log> findRecentErrorLogs(@Param("since") LocalDateTime since);
}