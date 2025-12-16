package com.skillbridge.service;

import com.skillbridge.dto.AddRequirementRequest;
import com.skillbridge.dto.RoleSkillRequirementDTO;
import com.skillbridge.entity.RoleSkillRequirement;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.RoleSkillRequirementRepository;
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
public class RoleSkillRequirementService {

    private final RoleSkillRequirementRepository requirementRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<RoleSkillRequirementDTO> getRequirements(Long roleProjectId) {
        log.info("Fetching requirements for role/project id={}", roleProjectId);
        List<RoleSkillRequirement> requirements = requirementRepository.findByRoleProjectId(roleProjectId);

        return requirements.stream()
                .map(req -> {
                    Skill skill = skillRepository.findById(req.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", req.getSkillId()));
                    return RoleSkillRequirementDTO.fromEntity(req, skill.getName(), skill.getCategory().name());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public RoleSkillRequirementDTO addRequirement(Long roleProjectId, AddRequirementRequest request) {
        log.info("Adding requirement for role/project {}: skill {}", roleProjectId, request.getSkillId());

        // Check if skill exists
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", request.getSkillId()));

        // Check if requirement already exists
        if (requirementRepository.existsByRoleProjectIdAndSkillId(roleProjectId, request.getSkillId())) {
            throw new DuplicateResourceException("Requirement already exists for this skill");
        }

        RoleSkillRequirement requirement = new RoleSkillRequirement();
        requirement.setRoleProjectId(roleProjectId);
        requirement.setSkillId(request.getSkillId());
        requirement.setRequiredLevel(request.getRequiredLevel());
        requirement.setImportance(RoleSkillRequirement.Importance.valueOf(request.getImportance().toUpperCase()));

        RoleSkillRequirement saved = requirementRepository.save(requirement);
        log.info("Requirement added successfully");
        return RoleSkillRequirementDTO.fromEntity(saved, skill.getName(), skill.getCategory().name());
    }

    @Transactional
    public RoleSkillRequirementDTO updateRequirement(Long roleProjectId, Long skillId, AddRequirementRequest request) {
        log.info("Updating requirement for role/project {}: skill {}", roleProjectId, skillId);

        RoleSkillRequirement requirement = requirementRepository.findByRoleProjectIdAndSkillId(roleProjectId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement not found"));

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId));

        requirement.setRequiredLevel(request.getRequiredLevel());
        requirement.setImportance(RoleSkillRequirement.Importance.valueOf(request.getImportance().toUpperCase()));

        RoleSkillRequirement updated = requirementRepository.save(requirement);
        log.info("Requirement updated successfully");
        return RoleSkillRequirementDTO.fromEntity(updated, skill.getName(), skill.getCategory().name());
    }

    @Transactional
    public void deleteRequirement(Long roleProjectId, Long skillId) {
        log.info("Deleting requirement for role/project {}: skill {}", roleProjectId, skillId);

        if (!requirementRepository.existsByRoleProjectIdAndSkillId(roleProjectId, skillId)) {
            throw new ResourceNotFoundException("Requirement not found");
        }

        requirementRepository.deleteByRoleProjectIdAndSkillId(roleProjectId, skillId);
        log.info("Requirement deleted successfully");
    }
}
