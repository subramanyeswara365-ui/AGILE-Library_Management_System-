package com.lms.repository;

import com.lms.entity.Upvote;
import com.lms.entity.VoteTargetType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UpvoteRepository extends JpaRepository<Upvote, Long> {
    Optional<Upvote> findByUserIdAndTargetTypeAndTargetId(Long userId, VoteTargetType targetType, Long targetId);
    boolean existsByUserIdAndTargetTypeAndTargetId(Long userId, VoteTargetType targetType, Long targetId);
    void deleteByUserIdAndTargetTypeAndTargetId(Long userId, VoteTargetType targetType, Long targetId);
    long countByTargetTypeAndTargetId(VoteTargetType targetType, Long targetId);
}
