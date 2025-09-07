package com.backend.logMiner.repository;


import com.backend.logMiner.model.RawLogFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RawLogFileRepository extends JpaRepository<RawLogFile, Integer> {
    //List<RawLogFile> findByProjectId(Integer projectId);
    List<RawLogFile> findByProject_IdProject(Integer idProject);
}

