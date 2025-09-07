package com.backend.logMiner.client;

import com.backend.logMiner.model.Log;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component
public class RagClient {

    private final RestTemplate restTemplate = new RestTemplate();

    // Injection de la valeur depuis application.properties (ou application.yml)
    @Value("${rag.url:${RAG_URL}}")
    private String ragUrl;


    public List<Log> sendToRag(byte[] fileBytes, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> request = new HttpEntity<>(body, headers);

        ResponseEntity<Log[]> response = restTemplate.postForEntity(ragUrl, request, Log[].class);

        return Arrays.asList(response.getBody());
    }
}
