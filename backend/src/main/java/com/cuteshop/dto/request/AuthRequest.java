package com.cuteshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

public class AuthRequest {

    @Data
    public static class Register {
        @NotBlank(message = "Họ tên không được để trống")
        private String fullName;

        @Email(message = "Email không hợp lệ")
        @NotBlank(message = "Email không được để trống")
        private String email;

        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 6, message = "Mật khẩu tối thiểu 6 ký tự")
        private String password;

        @NotBlank(message = "Số điện thoại không được để trống")
        private String phone;

        @NotNull(message = "Ngày sinh không được để trống")
        @Past(message = "Ngày sinh phải là ngày trong quá khứ")
        private LocalDate birthday;
    }

    @Data
    public static class Login {
        @Email
        @NotBlank
        private String email;

        @NotBlank
        private String password;
    }

    @Data
    public static class GoogleLogin {
        @NotBlank(message = "Token Google không được để trống")
        private String credential;
    }
}
