package com.cuteshop.repository;

import com.cuteshop.entity.TaobaoOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaobaoOrderRepository extends JpaRepository<TaobaoOrder, Long> {

    Optional<TaobaoOrder> findByOrderCode(String orderCode);

    Page<TaobaoOrder> findByUserId(Long userId, Pageable pageable);

    @Query("""
        SELECT t FROM TaobaoOrder t
        WHERE (:status IS NULL OR t.status = :status)
        AND (:keyword IS NULL OR
             LOWER(t.orderCode) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR
             LOWER(t.customerName) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')) OR
             LOWER(t.customerPhone) LIKE LOWER(CONCAT('%', CAST(:keyword AS string), '%')))
        ORDER BY t.createdAt DESC
    """)
    Page<TaobaoOrder> searchOrders(
            @Param("status") TaobaoOrder.TaobaoOrderStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    @Query("SELECT COUNT(t) FROM TaobaoOrder t WHERE t.status = :status")
    long countByStatus(@Param("status") TaobaoOrder.TaobaoOrderStatus status);

    List<TaobaoOrder> findByUserIdOrderByCreatedAtDesc(Long userId);
}
