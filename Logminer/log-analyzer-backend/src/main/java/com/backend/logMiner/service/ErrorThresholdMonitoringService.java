package com.backend.logMiner.service;

import com.backend.logMiner.model.Log;
import com.backend.logMiner.model.ServerConfig;
import com.backend.logMiner.redis.RedisNotificationSilencer;
import com.backend.logMiner.repository.LogRepository;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.util.Pair;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ErrorThresholdMonitoringService {

    @Autowired
    private EmailService emailService;
    @Autowired
    private LogRepository logRepository;
    @Autowired
    private ServerConfigService serverConfigService;
    @Autowired
    private RedisNotificationSilencer silencer ;

    @Scheduled(fixedRate = 1000 * 60 * 60)
    public void checkErrorThreshold(){
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime since = now.minusHours(24);
        List<Log> logs = logRepository.findRecentErrorLogs(since);
        Map<Pair<Integer,String>,Integer> occurrences = new HashMap<>();
        logs.forEach(l -> {
            Pair<Integer,String> key = Pair.of(l.getIdServerConfig(), l.getProblem());
            occurrences.merge(key, 1, Integer::sum);
        });
        occurrences.forEach((key, value)->{
            ServerConfig serverConfig = serverConfigService.getServerConfig(key.getFirst());
            Integer threshold = serverConfig.getErrorThreshold();
            if( threshold != null && value > threshold ){
                String adminEmail = serverConfig.getUser().getEmail();
                if(silencer.shouldNotify(key.getFirst().toString()+key.getSecond(),adminEmail)){
                    emailService.sendEmail(
                            "ouday908070@gmail.com", // adminEmail
                            "Error threshold reached",
                            "Error threshold reached for server " + key.getFirst() + " for error type : " + key.getSecond() +" ."
                    );
                }else {
                    System.out.println("notification silenced");
                }
            }
        });
    }
}
