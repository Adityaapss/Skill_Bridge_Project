package com.skillbridge.service;

import com.skillbridge.dto.LearningResourceDTO;
import com.skillbridge.entity.LearningResource;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.LearningResourceRepository;
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
public class LearningResourceService {

    private final LearningResourceRepository resourceRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<LearningResourceDTO> getAllResources(Long skillId, String level, String type) {
        log.info("Fetching learning resources with skillId={}, level={}, type={}", skillId, level, type);

        List<LearningResource> resources;
        if (skillId != null && level != null && type != null) {
            resources = resourceRepository.findBySkillIdAndLevelAndType(
                    skillId,
                    LearningResource.Level.valueOf(level.toUpperCase()),
                    LearningResource.Type.valueOf(type.toUpperCase()));
        } else if (skillId != null && level != null) {
            resources = resourceRepository.findBySkillIdAndLevel(
                    skillId,
                    LearningResource.Level.valueOf(level.toUpperCase()));
        } else if (skillId != null) {
            resources = resourceRepository.findBySkillId(skillId);
        } else if (level != null) {
            resources = resourceRepository.findByLevel(LearningResource.Level.valueOf(level.toUpperCase()));
        } else if (type != null) {
            resources = resourceRepository.findByType(LearningResource.Type.valueOf(type.toUpperCase()));
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream()
                .map(res -> {
                    String skillName = skillRepository.findById(res.getSkillId())
                            .map(Skill::getName)
                            .orElse("Unknown");
                    return LearningResourceDTO.fromEntity(res, skillName);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public LearningResourceDTO getResourceById(Long id) {
        log.info("Fetching learning resource with id={}", id);
        LearningResource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningResource", "id", id));

        String skillName = skillRepository.findById(resource.getSkillId())
                .map(Skill::getName)
                .orElse("Unknown");

        return LearningResourceDTO.fromEntity(resource, skillName);
    }

    @Transactional
    public LearningResourceDTO createResource(LearningResource resource) {
        log.info("Creating new learning resource: {}", resource.getTitle());

        // Verify skill exists
        Skill skill = skillRepository.findById(resource.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", resource.getSkillId()));

        LearningResource saved = resourceRepository.save(resource);
        log.info("Learning resource created successfully with id={}", saved.getId());
        return LearningResourceDTO.fromEntity(saved, skill.getName());
    }

    @Transactional
    public LearningResourceDTO updateResource(Long id, LearningResource resource) {
        log.info("Updating learning resource with id={}", id);

        LearningResource existing = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LearningResource", "id", id));

        // Verify skill exists
        Skill skill = skillRepository.findById(resource.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", resource.getSkillId()));

        existing.setTitle(resource.getTitle());
        existing.setUrl(resource.getUrl());
        existing.setType(resource.getType());
        existing.setSkillId(resource.getSkillId());
        existing.setLevel(resource.getLevel());
        existing.setEstimatedDuration(resource.getEstimatedDuration());
        existing.setIsFree(resource.getIsFree());
        existing.setDescription(resource.getDescription());

        LearningResource updated = resourceRepository.save(existing);
        log.info("Learning resource updated successfully");
        return LearningResourceDTO.fromEntity(updated, skill.getName());
    }

    @Transactional
    public void deleteResource(Long id) {
        log.info("Deleting learning resource with id={}", id);

        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("LearningResource", "id", id);
        }

        resourceRepository.deleteById(id);
        log.info("Learning resource deleted successfully");
    }
}
