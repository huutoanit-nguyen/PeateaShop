package com.cuteshop.repository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.TestPropertySource;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Test
    void testGetTodayRevenue() {
        BigDecimal revenue = orderRepository.getTodayRevenue();
        assertThat(revenue).isNotNull();
        assertThat(revenue).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void testGetDailyOrderCount() {
        List<Object[]> dailyCounts = orderRepository.getDailyOrderCount(LocalDateTime.now().minusDays(7));
        assertThat(dailyCounts).isNotNull();
    }
}
