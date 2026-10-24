package com.lms.repository;

import com.lms.entity.BorrowRecord;
import com.lms.entity.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {
    List<BorrowRecord> findByUserIdOrderByBorrowDateDesc(Long userId);
    List<BorrowRecord> findByUserIdAndStatus(Long userId, BorrowStatus status);
    long countByUserIdAndStatusIn(Long userId, List<BorrowStatus> statuses);
    List<BorrowRecord> findByStatusIn(List<BorrowStatus> statuses);
    List<BorrowRecord> findAllByOrderByBorrowDateDesc();
    List<BorrowRecord> findByStatus(BorrowStatus status);
}
