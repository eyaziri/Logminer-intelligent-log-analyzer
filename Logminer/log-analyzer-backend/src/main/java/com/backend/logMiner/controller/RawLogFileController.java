package com.backend.logMiner.controller;

import com.backend.logMiner.dto.RawLogFileDTO;
import com.backend.logMiner.model.RawLogFile;
import com.backend.logMiner.service.RawLogFileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/raw-log")
public class RawLogFileController {

    @Autowired
    private final RawLogFileService service;

    @Autowired
    public RawLogFileController(RawLogFileService service) {
        this.service = service;
    }

    @PostMapping("/upload/{projectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<RawLogFileDTO> upload(
            @PathVariable Integer projectId,
            @RequestParam("file") MultipartFile file
    ) throws Exception {
        RawLogFileDTO saved = service.saveUpload(projectId, file);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/list/{projectId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<List<RawLogFileDTO>> list(@PathVariable Integer projectId) {
        return ResponseEntity.ok(service.listForProject(projectId));
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<byte[]> download(@PathVariable Integer id) {
        RawLogFile f = service.getEntityById(id);  // <-- raw entity
        byte[] data = f.getDataStream();                    // your un‑ignored getter

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + f.getFileName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }


}