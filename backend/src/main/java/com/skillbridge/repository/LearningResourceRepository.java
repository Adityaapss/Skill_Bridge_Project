package com.skillbridge.repository;

import com.skillbridge.entity.LearningResource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LearningResourceRepository extends JpaRepository<LearningResource, Long> {
    
    List<LearningResource> findBySkillId(Long skillId);
    
    List<LearningResource> findByType(LearningResource.Type type);
    
    List<LearningResource> findByLevel(LearningResource.Level level);
    
    List<LearningResource> findByIsFree(Boolean isFree);
    
    List<LearningResource> findBySkillIdAndLevel(Long skillId, LearningResource.Level level);
    
    List<LearningResource> findBySkillIdAndType(Long skillId, LearningResource.Type type);
    
    List<LearningResource> findBySkillIdAndLevelAndType(Long skillId, 
                                                          LearningResource.Level level, 
                                                          LearningResource.Type type);
}
