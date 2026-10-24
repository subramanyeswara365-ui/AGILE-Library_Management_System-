package com.lms.repository;

import com.lms.entity.OtpPurpose;
import com.lms.entity.OtpToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailAndPurposeOrderByExpiresAtDesc(String email, OtpPurpose purpose);
    void deleteByExpiresAtBefore(LocalDateTime time);
}
