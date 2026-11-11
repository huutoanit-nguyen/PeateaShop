package com.cuteshop.service.impl;

import com.cuteshop.entity.Order;
import com.cuteshop.repository.OrderRepository;
import com.cuteshop.repository.ProductRepository;
import com.cuteshop.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

class OrderServiceImplTest {

    private final OrderRepository orderRepository = mock(OrderRepository.class);
    private final OrderServiceImpl orderService = new OrderServiceImpl(
            orderRepository, mock(ProductRepository.class), mock(UserRepository.class));

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void customerCanAccessOwnOrder() {
        Order order = new Order();
        authenticate("customer@example.com", "ROLE_CUSTOMER");
        when(orderRepository.findByIdAndUserEmail(42L, "customer@example.com"))
                .thenReturn(Optional.of(order));

        assertSame(order, orderService.getAccessibleOrder(42L));
    }

    @Test
    void customerCannotAccessAnotherUsersOrder() {
        authenticate("customer@example.com", "ROLE_CUSTOMER");
        when(orderRepository.findByIdAndUserEmail(42L, "customer@example.com"))
                .thenReturn(Optional.empty());

        assertThrows(AccessDeniedException.class, () -> orderService.getAccessibleOrder(42L));
        verify(orderRepository, never()).findById(42L);
    }

    @Test
    void adminCanAccessAnyOrder() {
        Order order = new Order();
        authenticate("admin@example.com", "ROLE_ADMIN");
        when(orderRepository.findById(42L)).thenReturn(Optional.of(order));

        assertSame(order, orderService.getAccessibleOrder(42L));
    }

    private void authenticate(String email, String authority) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(email, null,
                        List.of(new SimpleGrantedAuthority(authority))));
    }
}
