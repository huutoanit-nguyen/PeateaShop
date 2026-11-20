package com.cuteshop.controller;

import com.cuteshop.dto.request.AuthRequest;
import com.cuteshop.dto.response.ResponseDTOs.*;
import com.cuteshop.entity.User;
import com.cuteshop.repository.UserRepository;
import com.cuteshop.security.JwtUtils;
import com.cuteshop.service.impl.GoogleAuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtUtils jwtUtils;
    @Mock
    private GoogleAuthService googleAuthService;

    private AuthController authController;

    @BeforeEach
    void setUp() {
        authController = new AuthController(
                authManager,
                userRepository,
                passwordEncoder,
                jwtUtils,
                googleAuthService
        );
    }

    @Test
    void testGoogleLogin_existingUser() {
        AuthRequest.GoogleLogin req = new AuthRequest.GoogleLogin();
        req.setCredential("valid-token");

        GoogleAuthService.GoogleUserInfo userInfo = GoogleAuthService.GoogleUserInfo.builder()
                .email("user@gmail.com")
                .name("Test User")
                .sub("12345")
                .build();

        User existingUser = User.builder()
                .id(1L)
                .fullName("Test User")
                .email("user@gmail.com")
                .phone("0912345678")
                .role(User.Role.CUSTOMER)
                .active(true)
                .build();

        when(googleAuthService.verifyToken("valid-token")).thenReturn(userInfo);
        when(userRepository.findByEmail("user@gmail.com")).thenReturn(Optional.of(existingUser));
        when(jwtUtils.generateTokenFromEmail("user@gmail.com")).thenReturn("mock-jwt-token");

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.googleLogin(req);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getAccessToken()).isEqualTo("mock-jwt-token");
        assertThat(response.getBody().getData().getUser().getEmail()).isEqualTo("user@gmail.com");
        verify(userRepository, never()).save(any());
    }

    @Test
    void testGoogleLogin_newUserAutoRegistration() {
        AuthRequest.GoogleLogin req = new AuthRequest.GoogleLogin();
        req.setCredential("new-token");

        GoogleAuthService.GoogleUserInfo userInfo = GoogleAuthService.GoogleUserInfo.builder()
                .email("new@gmail.com")
                .name("Newbie")
                .sub("67890")
                .build();

        User savedUser = User.builder()
                .id(2L)
                .fullName("Newbie")
                .email("new@gmail.com")
                .phone("")
                .role(User.Role.CUSTOMER)
                .active(true)
                .build();

        when(googleAuthService.verifyToken("new-token")).thenReturn(userInfo);
        when(userRepository.findByEmail("new@gmail.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode(anyString())).thenReturn("hashed-pwd");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtUtils.generateTokenFromEmail("new@gmail.com")).thenReturn("new-jwt-token");

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.googleLogin(req);

        assertThat(response.getStatusCode().is2xxSuccessful()).isTrue();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getAccessToken()).isEqualTo("new-jwt-token");
        assertThat(response.getBody().getData().getUser().getFullName()).isEqualTo("Newbie");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void testGoogleLogin_inactiveUserThrowsDisabledException() {
        AuthRequest.GoogleLogin req = new AuthRequest.GoogleLogin();
        req.setCredential("inactive-token");

        GoogleAuthService.GoogleUserInfo userInfo = GoogleAuthService.GoogleUserInfo.builder()
                .email("blocked@gmail.com")
                .name("Blocked User")
                .build();

        User blockedUser = User.builder()
                .id(3L)
                .email("blocked@gmail.com")
                .active(false)
                .build();

        when(googleAuthService.verifyToken("inactive-token")).thenReturn(userInfo);
        when(userRepository.findByEmail("blocked@gmail.com")).thenReturn(Optional.of(blockedUser));

        assertThatThrownBy(() -> authController.googleLogin(req))
                .isInstanceOf(DisabledException.class)
                .hasMessageContaining("khóa");
    }

    @Test
    void testGoogleLogin_invalidTokenThrowsBadCredentials() {
        AuthRequest.GoogleLogin req = new AuthRequest.GoogleLogin();
        req.setCredential("invalid-token");

        when(googleAuthService.verifyToken("invalid-token"))
                .thenThrow(new BadCredentialsException("Token Google không hợp lệ"));

        assertThatThrownBy(() -> authController.googleLogin(req))
                .isInstanceOf(BadCredentialsException.class);
    }
}
