package com.skillbridge.repository;

import com.skillbridge.entity.SkillHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillHistoryRepository extends JpaRepository<SkillHistory, Long> {
    List<SkillHistory> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
