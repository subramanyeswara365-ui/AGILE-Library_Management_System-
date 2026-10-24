package com.lms.repository;

import com.lms.entity.DiscussionThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiscussionThreadRepository extends JpaRepository<DiscussionThread, Long> {
    List<DiscussionThread> findAllByOrderByCreatedAtDesc();
    List<DiscussionThread> findByCategoryOrderByCreatedAtDesc(String category);
    List<DiscussionThread> findByIsReportedTrueOrderByCreatedAtDesc();
}
