package com.cuteshop.security;

import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtUtilsTest {

    @Test
    void rejectsBlankSigningSecret() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", " ");

        assertThrows(IllegalStateException.class,
                () -> ReflectionTestUtils.invokeMethod(jwtUtils, "validateSigningKey"));
    }

    @Test
    void rejectsSigningSecretShorterThan256Bits() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "short-secret");

        assertThrows(WeakKeyException.class,
                () -> ReflectionTestUtils.invokeMethod(jwtUtils, "validateSigningKey"));
    }

    @Test
    void acceptsSigningSecretOfAtLeast256Bits() {
        JwtUtils jwtUtils = new JwtUtils();
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "a".repeat(32));

        assertDoesNotThrow(() ->
                ReflectionTestUtils.invokeMethod(jwtUtils, "validateSigningKey"));
    }
}
