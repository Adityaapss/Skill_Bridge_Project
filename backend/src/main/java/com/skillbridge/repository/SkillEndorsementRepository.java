package com.skillbridge.repository;

import com.skillbridge.entity.SkillEndorsement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillEndorsementRepository extends JpaRepository<SkillEndorsement, Long> {
    List<SkillEndorsement> findByEmployeeSkillId(Long employeeSkillId);

    List<SkillEndorsement> findByEmployeeSkillIdIn(java.util.Collection<Long> ids);

    boolean existsByEmployeeSkillIdAndEndorserId(Long employeeSkillId, Long endorserId);

    Optional<SkillEndorsement> findByEmployeeSkillIdAndEndorserId(Long employeeSkillId, Long endorserId);
}
