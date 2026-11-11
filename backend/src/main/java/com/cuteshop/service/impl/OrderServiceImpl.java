package com.cuteshop.service.impl;

import com.cuteshop.dto.request.CreateOrderRequest;
import com.cuteshop.dto.response.ResponseDTOs.*;
import com.cuteshop.entity.*;
import com.cuteshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private static final AtomicLong COUNTER = new AtomicLong(1000);

    @Transactional
    public OrderResponse create(CreateOrderRequest req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();

        List<OrderItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CreateOrderRequest.OrderItemRequest itemReq : req.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found: " + itemReq.getProductId()));
            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Insufficient stock for: " + product.getName());
            }
            BigDecimal unitPrice = product.getPrice();
            BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            subtotal = subtotal.add(total);

            items.add(OrderItem.builder()
                    .product(product).productName(product.getName())
                    .productImageUrl(product.getImageUrls().isEmpty() ? null : product.getImageUrls().get(0))
                    .variant(itemReq.getVariant()).quantity(itemReq.getQuantity())
                    .unitPrice(unitPrice).totalPrice(total).build());

            product.setStock(product.getStock() - itemReq.getQuantity());
            product.setSoldCount(product.getSoldCount() + itemReq.getQuantity());
            productRepository.save(product);
        }

        BigDecimal shippingFee = BigDecimal.valueOf(80);
        Order order = Order.builder()
                .orderCode("SH-" + COUNTER.incrementAndGet())
                .user(user)
                .recipientName(req.getRecipientName()).recipientPhone(req.getRecipientPhone())
                .shippingAddress(req.getShippingAddress()).shippingCity(req.getShippingCity())
                .shippingProvince(req.getShippingProvince()).note(req.getNote())
                .subtotal(subtotal).shippingFee(shippingFee).total(subtotal.add(shippingFee))
                .paymentMethod(req.getPaymentMethod())
                .status(Order.OrderStatus.PENDING).paymentStatus(Order.PaymentStatus.PENDING)
                .build();

        items.forEach(i -> i.setOrder(order));
        order.setItems(items);
        return toResponse(orderRepository.save(order));
    }

    public List<OrderResponse> getMyOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public OrderResponse getById(Long id) {
        return toResponse(getAccessibleOrder(id));
    }

    public Order getAccessibleOrder(Long id) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));

        if (isAdmin) {
            return orderRepository.findById(id).orElseThrow();
        }

        return orderRepository.findByIdAndUserEmail(id, authentication.getName())
                .orElseThrow(() -> new AccessDeniedException("Access denied"));
    }

    // ── Admin ────────────────────────────────────────────────────────────────
    public PageResponse<OrderResponse> adminGetAll(Order.OrderStatus status, String keyword,
                                                    LocalDateTime start, LocalDateTime end, int page, int size) {
        Page<Order> p = orderRepository.searchOrders(status, keyword, start, end, PageRequest.of(page, size));
        return PageResponse.<OrderResponse>builder()
                .content(p.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .pageNumber(p.getNumber()).pageSize(p.getSize())
                .totalElements(p.getTotalElements()).totalPages(p.getTotalPages()).last(p.isLast()).build();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status, String adminNote) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setStatus(Order.OrderStatus.valueOf(status));
        if (adminNote != null) order.setAdminNote(adminNote);
        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public OrderResponse updatePayment(Long id, String paymentStatus) {
        Order order = orderRepository.findById(id).orElseThrow();
        order.setPaymentStatus(Order.PaymentStatus.valueOf(paymentStatus));
        return toResponse(orderRepository.save(order));
    }

    // ── Mapper ───────────────────────────────────────────────────────────────
    public OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId()).orderCode(o.getOrderCode())
                .userId(o.getUser() != null ? o.getUser().getId() : null)
                .recipientName(o.getRecipientName()).recipientPhone(o.getRecipientPhone())
                .shippingAddress(o.getShippingAddress()).shippingCity(o.getShippingCity())
                .shippingProvince(o.getShippingProvince()).note(o.getNote())
                .subtotal(o.getSubtotal()).shippingFee(o.getShippingFee()).total(o.getTotal())
                .paymentMethod(o.getPaymentMethod().name()).paymentStatus(o.getPaymentStatus().name())
                .status(o.getStatus().name()).adminNote(o.getAdminNote())
                .paymentProofUrl(o.getPaymentProofUrl())
                .items(o.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .createdAt(o.getCreatedAt()).updatedAt(o.getUpdatedAt()).build();
    }

    private OrderItemResponse toItemResponse(OrderItem i) {
        return OrderItemResponse.builder()
                .id(i.getId()).productId(i.getProduct().getId())
                .productName(i.getProductName()).productImageUrl(i.getProductImageUrl())
                .variant(i.getVariant()).quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice()).totalPrice(i.getTotalPrice()).build();
    }
}