package com.backend.logMiner.service;

import com.backend.logMiner.dto.RawLogFileDTO;
import com.backend.logMiner.model.RawLogFile;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface RawLogFileService {
    RawLogFileDTO saveUpload(Integer projectId, MultipartFile file) throws Exception;
    List<RawLogFileDTO> listForProject(Integer projectId);
    RawLogFileDTO getById(Integer id);
    RawLogFile getEntityById(Integer id);
    void delete(Integer id);
}