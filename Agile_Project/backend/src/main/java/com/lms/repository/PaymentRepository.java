package com.lms.repository;

import com.lms.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserIdOrderByPaymentDateDesc(Long userId);
    List<Payment> findAllByOrderByPaymentDateDesc();
}
