package com.skillbridge.repository;

import com.skillbridge.entity.EmployeeSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {

    List<EmployeeSkill> findByEmployeeId(Long employeeId);

    List<EmployeeSkill> findBySkillId(Long skillId);

    Optional<EmployeeSkill> findByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    boolean existsByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    void deleteByEmployeeIdAndSkillId(Long employeeId, Long skillId);

    @Query("SELECT es FROM EmployeeSkill es WHERE es.employeeId = :employeeId AND es.proficiencyLevel >= :minLevel")
    List<EmployeeSkill> findByEmployeeIdAndMinProficiency(@Param("employeeId") Long employeeId,
            @Param("minLevel") Integer minLevel);

    @Query("SELECT es FROM EmployeeSkill es WHERE es.skillId = :skillId AND es.proficiencyLevel >= :minLevel")
    List<EmployeeSkill> findBySkillIdAndMinProficiency(@Param("skillId") Long skillId,
            @Param("minLevel") Integer minLevel);

    // Approval workflow methods
    List<EmployeeSkill> findByApprovalStatus(EmployeeSkill.ApprovalStatus status);

    List<EmployeeSkill> findByEmployeeIdAndApprovalStatus(Long employeeId, EmployeeSkill.ApprovalStatus status);

    @Query("SELECT es FROM EmployeeSkill es JOIN Employee e ON es.employeeId = e.id " +
            "WHERE e.managerId = :managerId AND es.approvalStatus = :status")
    List<EmployeeSkill> findPendingSkillsForManager(@Param("managerId") Long managerId,
            @Param("status") EmployeeSkill.ApprovalStatus status);
}
