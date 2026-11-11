package com.cuteshop.repository;

import com.cuteshop.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderCode(String orderCode);
    Optional<Order> findByIdAndUserEmail(Long id, String email);

    Page<Order> findByUserId(Long userId, Pageable pageable);

    Page<Order> findByStatus(Order.OrderStatus status, Pageable pageable);

    @Query("""
        SELECT o FROM Order o
        WHERE (:status IS NULL OR o.status = :status)
        AND (:keyword IS NULL OR
             LOWER(o.orderCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             LOWER(o.recipientName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             LOWER(o.recipientPhone) LIKE LOWER(CONCAT('%', :keyword, '%')))
        AND (:startDate IS NULL OR o.createdAt >= :startDate)
        AND (:endDate IS NULL OR o.createdAt <= :endDate)
        ORDER BY o.createdAt DESC
    """)
    Page<Order> searchOrders(
            @Param("status") Order.OrderStatus status,
            @Param("keyword") String keyword,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
    );

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") Order.OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status = 'COMPLETED' AND DATE(o.createdAt) = CURRENT_DATE")
    BigDecimal getTodayRevenue();

    @Query("SELECT COALESCE(SUM(o.total), 0) FROM Order o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt <= :endDate")
    BigDecimal getRevenueByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT DATE(o.createdAt) as date, COUNT(o) as count FROM Order o WHERE o.createdAt >= :startDate GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt)")
    List<Object[]> getDailyOrderCount(@Param("startDate") LocalDateTime startDate);

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
}
