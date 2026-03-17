package com.ecommerShop.clothingsystem.repository;

import com.ecommerShop.clothingsystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    boolean existsByOrderCode(String orderCode);

    long countByUserId(Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT SUM(o.totalPrice) FROM Order o WHERE o.status <> 'CANCELLED'")
    Double sumTotalRevenue();

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(o) FROM Order o")
    long countTotalOrders();

    @org.springframework.data.jpa.repository.Query(value = "SELECT DATE_FORMAT(created_at, '%d %b') as date, SUM(total_price) as revenue, COUNT(*) as count " +
            "FROM orders " +
            "WHERE created_at >= :startDate " +
            "GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%d %b') " +
            "ORDER BY DATE(created_at) ASC", nativeQuery = true)
    List<Object[]> getRevenueByDateRange(@org.springframework.data.repository.query.Param("startDate") java.time.LocalDateTime startDate);

    @org.springframework.data.jpa.repository.Query("SELECT c.name, SUM(oi.price * oi.quantity) " +
            "FROM OrderItem oi " +
            "JOIN oi.productVariant pv " +
            "JOIN pv.product p " +
            "JOIN p.category c " +
            "JOIN oi.order o " +
            "WHERE o.status <> 'CANCELLED' " +
            "GROUP BY c.name")
    List<Object[]> getRevenueByCategory();
}
