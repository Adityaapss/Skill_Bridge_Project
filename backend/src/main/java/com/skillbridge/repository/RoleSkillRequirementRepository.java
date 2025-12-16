package com.skillbridge.repository;

import com.skillbridge.entity.RoleSkillRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleSkillRequirementRepository extends JpaRepository<RoleSkillRequirement, Long> {
    
    List<RoleSkillRequirement> findByRoleProjectId(Long roleProjectId);
    
    List<RoleSkillRequirement> findBySkillId(Long skillId);
    
    Optional<RoleSkillRequirement> findByRoleProjectIdAndSkillId(Long roleProjectId, Long skillId);
    
    boolean existsByRoleProjectIdAndSkillId(Long roleProjectId, Long skillId);
    
    void deleteByRoleProjectIdAndSkillId(Long roleProjectId, Long skillId);
    
    List<RoleSkillRequirement> findByRoleProjectIdAndImportance(Long roleProjectId, 
                                                                  RoleSkillRequirement.Importance importance);
    
    @Query("SELECT rsr FROM RoleSkillRequirement rsr WHERE rsr.roleProjectId = :roleProjectId AND rsr.requiredLevel >= :minLevel")
    List<RoleSkillRequirement> findByRoleProjectIdAndMinLevel(@Param("roleProjectId") Long roleProjectId, 
                                                                @Param("minLevel") Integer minLevel);
}
