package com.skillbridge.service;

import com.skillbridge.dto.CreateSkillRequest;
import com.skillbridge.dto.SkillDTO;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SkillService {

    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<SkillDTO> getAllSkills(Boolean active) {
        log.info("Fetching all skills with active={}", active);
        List<Skill> skills = active != null
                ? skillRepository.findByActive(active)
                : skillRepository.findAll();
        return skills.stream()
                .map(SkillDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SkillDTO getSkillById(Long id) {
        log.info("Fetching skill with id={}", id);
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));
        return SkillDTO.fromEntity(skill);
    }

    @Transactional(readOnly = true)
    public List<SkillDTO> getSkillsByCategory(String category) {
        log.info("Fetching skills by category={}", category);
        Skill.Category cat = Skill.Category.valueOf(category.toUpperCase());
        List<Skill> skills = skillRepository.findByCategoryAndActive(cat, true);
        return skills.stream()
                .map(SkillDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SkillDTO createSkill(CreateSkillRequest request) {
        log.info("Creating new skill: {}", request.getName());

        if (skillRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Skill", "name", request.getName());
        }

        Skill skill = new Skill();
        skill.setName(request.getName());
        skill.setCategory(Skill.Category.valueOf(request.getCategory().toUpperCase()));
        skill.setDescription(request.getDescription());
        skill.setActive(request.getActive());

        Skill saved = skillRepository.save(skill);
        log.info("Skill created successfully with id={}", saved.getId());
        return SkillDTO.fromEntity(saved);
    }

    @Transactional
    public SkillDTO updateSkill(Long id, CreateSkillRequest request) {
        log.info("Updating skill with id={}", id);

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));

        // Check if name is being changed and if new name already exists
        if (!skill.getName().equals(request.getName()) &&
                skillRepository.existsByName(request.getName())) {
            throw new DuplicateResourceException("Skill", "name", request.getName());
        }

        skill.setName(request.getName());
        skill.setCategory(Skill.Category.valueOf(request.getCategory().toUpperCase()));
        skill.setDescription(request.getDescription());
        skill.setActive(request.getActive());

        Skill updated = skillRepository.save(skill);
        log.info("Skill updated successfully");
        return SkillDTO.fromEntity(updated);
    }

    @Transactional
    public void deactivateSkill(Long id) {
        log.info("Deactivating skill with id={}", id);

        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", id));

        skill.setActive(false);
        skillRepository.save(skill);
        log.info("Skill deactivated successfully");
    }
}
