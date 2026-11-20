package com.cuteshop.service.impl;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GoogleAuthServiceTest {

    @Mock
    private RestTemplate restTemplate;

    private GoogleAuthService googleAuthService;

    @BeforeEach
    void setUp() {
        googleAuthService = new GoogleAuthService(restTemplate);
    }

    @Test
    void testVerifyToken_success() {
        Map<String, Object> body = new HashMap<>();
        body.put("email", "john@gmail.com");
        body.put("email_verified", "true");
        body.put("name", "John Doe");
        body.put("picture", "https://avatar.png");
        body.put("sub", "google-sub-123");
        body.put("aud", "test-client-id");

        ReflectionTestUtils.setField(googleAuthService, "expectedClientId", "test-client-id");

        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body, HttpStatus.OK));

        GoogleAuthService.GoogleUserInfo user = googleAuthService.verifyToken("good-id-token");

        assertThat(user.getEmail()).isEqualTo("john@gmail.com");
        assertThat(user.getName()).isEqualTo("John Doe");
        assertThat(user.getPicture()).isEqualTo("https://avatar.png");
        assertThat(user.getSub()).isEqualTo("google-sub-123");
    }

    @Test
    void testVerifyToken_emptyTokenThrows() {
        assertThatThrownBy(() -> googleAuthService.verifyToken(""))
                .isInstanceOf(BadCredentialsException.class);
        assertThatThrownBy(() -> googleAuthService.verifyToken(null))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void testVerifyToken_unverifiedEmailThrows() {
        Map<String, Object> body = new HashMap<>();
        body.put("email", "unverified@gmail.com");
        body.put("email_verified", "false");

        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body, HttpStatus.OK));

        assertThatThrownBy(() -> googleAuthService.verifyToken("some-token"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("chưa được xác thực");
    }

    @Test
    void testVerifyToken_audMismatchThrows() {
        Map<String, Object> body = new HashMap<>();
        body.put("email", "john@gmail.com");
        body.put("email_verified", "true");
        body.put("aud", "different-client-id");

        ReflectionTestUtils.setField(googleAuthService, "expectedClientId", "my-expected-client-id");

        when(restTemplate.getForEntity(anyString(), eq(Map.class)))
                .thenReturn(new ResponseEntity<>(body, HttpStatus.OK));

        assertThatThrownBy(() -> googleAuthService.verifyToken("token-with-wrong-aud"))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("Client ID");
    }
}
