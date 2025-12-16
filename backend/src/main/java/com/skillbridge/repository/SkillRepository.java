package com.skillbridge.repository;

import com.skillbridge.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, Long> {
    
    Optional<Skill> findByName(String name);
    
    List<Skill> findByCategory(Skill.Category category);
    
    List<Skill> findByActive(Boolean active);
    
    List<Skill> findByCategoryAndActive(Skill.Category category, Boolean active);
    
    boolean existsByName(String name);
}
