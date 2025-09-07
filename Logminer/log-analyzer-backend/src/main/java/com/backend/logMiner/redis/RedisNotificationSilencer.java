package com.backend.logMiner.redis;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class RedisNotificationSilencer {

    @Autowired
    private StringRedisTemplate redisTemplate;

    private final int silenceSeconds;

    // Lecture depuis application.properties, ou fallback vers variable d'environnement
    public RedisNotificationSilencer(@Value("${silence.alert.mail.minutes:${SILENCE_ALERT_MAIL_MINUTES:60}}") int silenceMinutes) {
        this.silenceSeconds = silenceMinutes * 60;
    }

    public boolean shouldNotify(String serverId, String supervisorEmail) {
        String key = "silence:" + serverId + ":" + supervisorEmail;

        Boolean alreadyExists = redisTemplate.hasKey(key);
        if (Boolean.TRUE.equals(alreadyExists)) {
            return false;
        }

        redisTemplate.opsForValue().set(key, "1", silenceSeconds, TimeUnit.SECONDS);
        return true;
    }
}
