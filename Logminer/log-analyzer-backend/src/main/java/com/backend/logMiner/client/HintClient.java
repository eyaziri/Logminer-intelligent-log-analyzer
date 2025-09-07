package com.backend.logMiner.client;

import com.backend.logMiner.model.Recommendation;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.Arrays;
import java.util.List;

@Component
public class HintClient {

    private final RestTemplate restTemplate = new RestTemplate();

    private final String hintUrl;

    // Utilise soit application.properties (hint.url), soit variable d’environnement HINT_URL
    public HintClient(@Value("${hint.url:${HINT_URL}}") String hintUrl) {
        if (hintUrl == null || hintUrl.isBlank()) {
            throw new IllegalStateException("HINT_URL or hint.url must be set.");
        }
        this.hintUrl = hintUrl;
    }

    public List<Recommendation> sendForHints(byte[] jsonBytes, String fileName) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        ByteArrayResource resource = new ByteArrayResource(jsonBytes) {
            @Override
            public String getFilename() {
                return fileName;
            }
        };

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", resource);

        HttpEntity<MultiValueMap<String,Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Recommendation[]> response =
                restTemplate.postForEntity(hintUrl, request, Recommendation[].class);
        return Arrays.asList(response.getBody());
    }
}
