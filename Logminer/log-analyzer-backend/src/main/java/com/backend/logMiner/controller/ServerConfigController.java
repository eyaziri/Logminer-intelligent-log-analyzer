package com.backend.logMiner.controller;

import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.model.User;
import com.backend.logMiner.security.annotation.CurrentUser;
import com.backend.logMiner.service.LogTailService;
import com.backend.logMiner.service.ServerConfigService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/server-config")
public class ServerConfigController {

    @Autowired
    private final ServerConfigService serverConfigService;
    @Autowired
    private final LogTailService tailService;
    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    public ServerConfigController(ServerConfigService serverConfigService, LogTailService tailService) {
        this.serverConfigService = serverConfigService;
        this.tailService = tailService;
    }

    @PostMapping("/start/{serverId}")
    public ResponseEntity<Void> startTailing(@PathVariable Integer serverId) {
        tailService.startTailing(serverId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/stop/{serverId}")
    public ResponseEntity<Void> stopTailing(@PathVariable Integer serverId) {
        tailService.stopTailing(serverId);
        return ResponseEntity.accepted().build();
    }


    @GetMapping("/get/{idServerConfig}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<ServerConfig> getServerConfig(@PathVariable Integer idServerConfig){
        return ResponseEntity.ok(serverConfigService.getServerConfig(idServerConfig));
    }

    @PostMapping(value = "/create", consumes = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServerConfig> saveServerConfig(@RequestBody Map<String, Object> payload , @CurrentUser User user) {

        String alertKeywordsStr = (String) payload.get("alertKeywords");
        List<String> alertKeywordsList = parseAlertKeywords(alertKeywordsStr);

        payload.remove("alertKeywords");

        ServerConfig serverConfig = mapToServerConfig(payload);

        serverConfig.setAlertKeywords(alertKeywordsList);
        serverConfig.setUser(user);

        ServerConfig saved = serverConfigService.create(serverConfig);
        return ResponseEntity.ok(saved);
    }


    private ServerConfig mapToServerConfig(Map<String, Object> payload) {
        return objectMapper.convertValue(payload, ServerConfig.class);
    }


    private List<String> parseAlertKeywords(String csv) {
        if (csv == null || csv.isBlank()) {
            return Collections.emptyList();
        }
        return Arrays.stream(csv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }


    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<List<ServerConfig>> getAllServerConfigs(){
        return ResponseEntity.ok(serverConfigService.getAllServerConfigs());
    }

    @DeleteMapping("/delete/{idServerConfig}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteServerConfig(@PathVariable Integer idServerConfig){
        serverConfigService.deleteServerConfig(idServerConfig);
        return ResponseEntity.ok().build();
    }

    @PutMapping(value = "/update", consumes = {
            MediaType.APPLICATION_JSON_VALUE,
            "application/json;charset=UTF-8"
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ServerConfig> updateServerConfig(@RequestBody ServerConfig serverConfig) {
        ServerConfig updated = serverConfigService.update(serverConfig);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/tailing-status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('ANALYST')")
    public ResponseEntity<Map<Integer, Boolean>> getTailingStatuses() {
        return ResponseEntity.ok(tailService.getAllTailingStatuses());
    }


}
