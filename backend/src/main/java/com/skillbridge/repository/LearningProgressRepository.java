package com.skillbridge.repository;

import com.skillbridge.entity.LearningProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LearningProgressRepository extends JpaRepository<LearningProgress, Long> {
    List<LearningProgress> findByEmployeeId(Long employeeId);

    Optional<LearningProgress> findByEmployeeIdAndResourceId(Long employeeId, Long resourceId);
}
