package com.cuteshop.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ResponseDTOs {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ApiResponse<T> {
        private boolean success;
        private String message;
        private T data;

        public static <T> ApiResponse<T> success(T data) {
            return ApiResponse.<T>builder().success(true).message("Success").data(data).build();
        }
        public static <T> ApiResponse<T> success(String message, T data) {
            return ApiResponse.<T>builder().success(true).message(message).data(data).build();
        }
        public static <T> ApiResponse<T> error(String message) {
            return ApiResponse.<T>builder().success(false).message(message).build();
        }
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class AuthResponse {
        private String accessToken;
        @Builder.Default
        private String tokenType = "Bearer";
        private UserResponse user;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String city;
        private String province;
        private LocalDate birthday;
        private String role;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProductResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal price;
        private Integer stock;
        private List<String> imageUrls;
        private List<String> variants;
        private Long categoryId;
        private String categoryName;
        private Boolean active;
        private Boolean newArrival;
        private Boolean featured;
        private Integer soldCount;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
        private String imageUrl;
        private Boolean active;
        private int productCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderResponse {
        private Long id;
        private String orderCode;
        private Long userId;
        private String recipientName;
        private String recipientPhone;
        private String shippingAddress;
        private String shippingCity;
        private String shippingProvince;
        private String note;
        private BigDecimal subtotal;
        private BigDecimal shippingFee;
        private BigDecimal total;
        private String paymentMethod;
        private String paymentStatus;
        private String status;
        private String adminNote;
        private String paymentProofUrl;
        private List<OrderItemResponse> items;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productImageUrl;
        private String variant;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TaobaoOrderResponse {
        private Long id;
        private String orderCode;
        private Long userId;
        private String customerName;
        private String customerPhone;
        private String taobaoLink;
        private String productDescription;
        private Integer quantity;
        private String colorSize;
        private BigDecimal estimatedPriceCny;
        private String note;
        private String status;
        private String trackingNumber;
        private String adminNote;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DashboardResponse {
        private long totalOrders;
        private long pendingOrders;
        private long processingOrders;
        private BigDecimal todayRevenue;
        private long totalCustomers;
        private long newTaobaoOrders;
        private List<DailyOrderStat> dailyOrderStats;
        private List<OrderResponse> recentOrders;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DailyOrderStat {
        private String date;
        private long count;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PageResponse<T> {
        private List<T> content;
        private int pageNumber;
        private int pageSize;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}