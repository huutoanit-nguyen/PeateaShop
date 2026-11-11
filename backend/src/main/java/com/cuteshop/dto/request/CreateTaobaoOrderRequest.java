package com.cuteshop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateTaobaoOrderRequest {

    @NotBlank(message = "Tên khách hàng không được để trống")
    private String customerName;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String customerPhone;

    @NotBlank(message = "Link Taobao không được để trống")
    @Pattern(regexp = "(?i)^https?://\\S+$",
            message = "Link Taobao phải bắt đầu bằng http:// hoặc https://")
    private String taobaoLink;

    @NotBlank(message = "Mô tả sản phẩm không được để trống")
    private String productDescription;

    @NotNull
    @Min(value = 1)
    private Integer quantity;

    private String colorSize;

    @DecimalMin(value = "0.0", inclusive = false)
    private BigDecimal estimatedPriceCny;

    private String note;
}
