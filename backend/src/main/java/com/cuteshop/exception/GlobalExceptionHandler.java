package com.cuteshop.exception;

import com.cuteshop.dto.response.ResponseDTOs.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String DEFAULT_ERROR_MESSAGE = "Có lỗi xảy ra, vui lòng thử lại";

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleValidation(MethodArgumentNotValidException ex) {
        String msg = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));
        return ApiResponse.error(msg != null && !msg.isBlank() ? msg : DEFAULT_ERROR_MESSAGE);
    }

    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ApiResponse<Void> handleBadCredentials(BadCredentialsException ex) {
        String msg = ex.getMessage();
        if (msg == null || msg.isBlank() || isTechnicalError(msg)) {
            return ApiResponse.error("Email hoặc mật khẩu không chính xác");
        }
        return ApiResponse.error(msg);
    }

    @ExceptionHandler(DisabledException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleDisabled(DisabledException ex) {
        return ApiResponse.error(ex.getMessage() != null && !ex.getMessage().isBlank()
                ? ex.getMessage()
                : "Tài khoản của bạn đã bị khóa");
    }

    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ApiResponse<Void> handleAccessDenied(AccessDeniedException ex) {
        return ApiResponse.error(DEFAULT_ERROR_MESSAGE);
    }

    @ExceptionHandler(DataAccessException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleDatabase(DataAccessException ex) {
        log.error("Database error: ", ex);
        return ApiResponse.error(DEFAULT_ERROR_MESSAGE);
    }

    @ExceptionHandler(RuntimeException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleRuntime(RuntimeException ex) {
        log.error("Runtime error: ", ex);
        String msg = ex.getMessage();
        if (msg == null || msg.isBlank() || isTechnicalError(msg)) {
            return ApiResponse.error(DEFAULT_ERROR_MESSAGE);
        }
        return ApiResponse.error(msg);
    }

    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ApiResponse<Void> handleGeneral(Exception ex) {
        log.error("Unexpected error: ", ex);
        return ApiResponse.error(DEFAULT_ERROR_MESSAGE);
    }

    private boolean isTechnicalError(String msg) {
        String lower = msg.toLowerCase();
        return lower.contains("sql") || lower.contains("jdbc") || lower.contains("hibernate")
                || lower.contains("database") || lower.contains("driver") || lower.contains("connection")
                || lower.contains("syntax") || lower.contains("could not") || lower.contains("exception")
                || lower.contains("nullpointer") || lower.contains("column") || lower.contains("table")
                || lower.contains("relation") || lower.contains("constraint") || lower.contains("bytea")
                || lower.contains("cannot compare") || lower.contains("error:") || lower.contains("failed to");
    }
}
