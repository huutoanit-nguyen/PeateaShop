package com.cuteshop.controller;

import com.cuteshop.dto.request.AuthRequest;
import com.cuteshop.dto.response.ResponseDTOs.*;
import com.cuteshop.entity.User;
import com.cuteshop.repository.UserRepository;
import com.cuteshop.security.JwtUtils;
import com.cuteshop.service.impl.GoogleAuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final GoogleAuthService googleAuthService;

    public AuthController(AuthenticationManager authManager,
                          UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          JwtUtils jwtUtils,
                          GoogleAuthService googleAuthService) {
        this.authManager = authManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.googleAuthService = googleAuthService;
    }

    @PutMapping("/auth/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody java.util.Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (body.get("fullName") != null) user.setFullName(body.get("fullName"));
        if (body.get("phone") != null) user.setPhone(body.get("phone"));
        if (body.get("address") != null) user.setAddress(body.get("address"));
        if (body.get("city") != null) user.setCity(body.get("city"));
        if (body.get("province") != null) user.setProvince(body.get("province"));
        if (body.get("birthday") != null) user.setBirthday(java.time.LocalDate.parse(body.get("birthday")));
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(userRepository.save(user))));
    }

    @PutMapping("/auth/password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody java.util.Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        if (!passwordEncoder.matches(body.get("currentPassword"), user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mật khẩu hiện tại không đúng"));
        }
        user.setPassword(passwordEncoder.encode(body.get("newPassword")));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Email already in use"));
        }
        // Kiểm tra tuổi tối thiểu 13
        if (req.getBirthday().plusYears(13).isAfter(java.time.LocalDate.now())) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Bạn phải đủ 13 tuổi trở lên để tạo tài khoản"));
        }
        User user = User.builder()
            .fullName(req.getFullName())
            .email(req.getEmail())
            .password(passwordEncoder.encode(req.getPassword()))
            .phone(req.getPhone())
            .birthday(req.getBirthday())
            .role(User.Role.CUSTOMER)
            .build();
        userRepository.save(user);

        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        String token = jwtUtils.generateToken(auth);
        return ResponseEntity.ok(ApiResponse.success(buildAuthResponse(user, token)));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody AuthRequest.Login req) {
        Authentication auth = authManager.authenticate(
            new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        String token = jwtUtils.generateToken(auth);
        User user = userRepository.findByEmail(req.getEmail()).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(buildAuthResponse(user, token)));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@Valid @RequestBody AuthRequest.GoogleLogin req) {
        GoogleAuthService.GoogleUserInfo googleUser = googleAuthService.verifyToken(req.getCredential());

        User user = userRepository.findByEmail(googleUser.getEmail())
            .map(existingUser -> {
                if (Boolean.FALSE.equals(existingUser.getActive())) {
                    throw new DisabledException("Tài khoản của bạn đã bị khóa");
                }
                if ((existingUser.getFullName() == null || existingUser.getFullName().isBlank()) && googleUser.getName() != null) {
                    existingUser.setFullName(googleUser.getName());
                    userRepository.save(existingUser);
                }
                return existingUser;
            })
            .orElseGet(() -> {
                User newUser = User.builder()
                    .fullName(googleUser.getName() != null && !googleUser.getName().isBlank()
                            ? googleUser.getName()
                            : googleUser.getEmail().split("@")[0])
                    .email(googleUser.getEmail())
                    .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                    .phone("")
                    .role(User.Role.CUSTOMER)
                    .active(true)
                    .build();
                return userRepository.save(newUser);
            });

        String token = jwtUtils.generateTokenFromEmail(user.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập Google thành công", buildAuthResponse(user, token)));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(ApiResponse.success(toUserResponse(user)));
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        return AuthResponse.builder()
            .accessToken(token).tokenType("Bearer")
            .user(toUserResponse(user)).build();
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
            .id(u.getId()).fullName(u.getFullName()).email(u.getEmail())
            .phone(u.getPhone()).address(u.getAddress()).city(u.getCity())
            .province(u.getProvince()).birthday(u.getBirthday()).role(u.getRole().name())
            .createdAt(u.getCreatedAt()).build();
    }
}