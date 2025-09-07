package com.backend.logMiner.security;

import io.github.cdimascio.dotenv.Dotenv;

public class SecretManager {
    private static final Dotenv dotenv = Dotenv.configure()
            .filename(".env")
            .load();

    public static String getSecretKey() {
        String key = dotenv.get("SECRET_KEY");
        if (key == null) {
            throw new IllegalStateException("SECRET_KEY not found in .env");
        }
        return key;
    }
}