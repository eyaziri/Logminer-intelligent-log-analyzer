package com.backend.logMiner.security;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class AESUtil {

    public static String encrypt(String strToEncrypt, String secret) throws Exception {
        byte[] keyBytes = new byte[16]; // 128 bits AES key
        byte[] secretBytes = secret.getBytes("UTF-8");
        int len = Math.min(secretBytes.length, keyBytes.length);
        System.arraycopy(secretBytes, 0, keyBytes, 0, len);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, secretKey);

        byte[] encrypted = cipher.doFinal(strToEncrypt.getBytes("UTF-8"));
        return Base64.getEncoder().encodeToString(encrypted);
    }


    public static String decrypt(String strToDecrypt, String secret) throws Exception {
        byte[] keyBytes = new byte[16]; // 128 bits AES key
        byte[] secretBytes = secret.getBytes("UTF-8");
        int len = Math.min(secretBytes.length, keyBytes.length);
        System.arraycopy(secretBytes, 0, keyBytes, 0, len);
        SecretKeySpec secretKey = new SecretKeySpec(keyBytes, "AES");

        Cipher cipher = Cipher.getInstance("AES/ECB/PKCS5Padding");
        cipher.init(Cipher.DECRYPT_MODE, secretKey);

        byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(strToDecrypt));
        return new String(decryptedBytes, "UTF-8");
    }
}
