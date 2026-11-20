package com.cuteshop.service.impl;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Service
public class GoogleAuthService {

    @Value("${app.google.client-id:}")
    private String expectedClientId;

    private final RestTemplate restTemplate;

    public GoogleAuthService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleUserInfo {
        private String email;
        private String name;
        private String picture;
        private String sub;
    }

    public GoogleUserInfo verifyToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new BadCredentialsException("Token Google không được để trống");
        }

        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken.trim();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);

            if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
                throw new BadCredentialsException("Token Google không hợp lệ hoặc đã hết hạn");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> body = response.getBody();

            String email = (String) body.get("email");
            if (email == null || email.isBlank()) {
                throw new BadCredentialsException("Không tìm thấy email từ tài khoản Google");
            }

            Object verifiedObj = body.get("email_verified");
            boolean emailVerified = (verifiedObj instanceof Boolean b && b)
                    || "true".equalsIgnoreCase(String.valueOf(verifiedObj));
            if (!emailVerified) {
                throw new BadCredentialsException("Email Google chưa được xác thực");
            }

            // Verify audience if configured
            if (expectedClientId != null && !expectedClientId.isBlank()) {
                String aud = (String) body.get("aud");
                if (!expectedClientId.equals(aud)) {
                    log.error("Google token aud mismatch: expected {}, got {}", expectedClientId, aud);
                    throw new BadCredentialsException("Client ID Google không khớp");
                }
            }

            String name = (String) body.get("name");
            String picture = (String) body.get("picture");
            String sub = (String) body.get("sub");

            return GoogleUserInfo.builder()
                    .email(email)
                    .name(name != null && !name.isBlank() ? name : email.split("@")[0])
                    .picture(picture)
                    .sub(sub)
                    .build();
        } catch (BadCredentialsException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to verify Google token: {}", e.getMessage());
            throw new BadCredentialsException("Có lỗi xảy ra, vui lòng thử lại");
        }
    }
}
