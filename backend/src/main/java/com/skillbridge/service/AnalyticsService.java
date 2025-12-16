package com.skillbridge.service;

import com.skillbridge.dto.GapAnalysisDTO;
import com.skillbridge.dto.LearningResourceDTO;
import com.skillbridge.dto.RecommendationDTO;
import com.skillbridge.entity.*;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AnalyticsService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final RoleSkillRequirementRepository requirementRepository;
    private final SkillRepository skillRepository;
    private final LearningResourceRepository resourceRepository;
    private final RoleProjectRepository roleProjectRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public GapAnalysisDTO getEmployeeGapAnalysis(Long employeeId, Long roleProjectId) {
        log.info("Analyzing gaps for employee {} against role/project {}", employeeId, roleProjectId);

        // Get employee
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", employeeId));

        // Get role/project
        RoleProject roleProject = roleProjectRepository.findById(roleProjectId)
                .orElseThrow(() -> new ResourceNotFoundException("RoleProject", "id", roleProjectId));

        // Get employee's skills
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployeeId(employeeId);
        Map<Long, Integer> skillLevels = employeeSkills.stream()
                .collect(Collectors.toMap(EmployeeSkill::getSkillId, EmployeeSkill::getProficiencyLevel));

        // Get requirements
        List<RoleSkillRequirement> requirements = requirementRepository.findByRoleProjectId(roleProjectId);

        List<GapAnalysisDTO.SkillGapDTO> gaps = new ArrayList<>();
        List<GapAnalysisDTO.SkillMatchDTO> matches = new ArrayList<>();
        List<GapAnalysisDTO.SkillGapDTO> missing = new ArrayList<>();

        int totalRequired = 0;
        int totalMet = 0;

        for (RoleSkillRequirement req : requirements) {
            Skill skill = skillRepository.findById(req.getSkillId())
                    .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", req.getSkillId()));

            Integer currentLevel = skillLevels.getOrDefault(req.getSkillId(), 0);
            int requiredLevel = req.getRequiredLevel();

            totalRequired++;

            if (currentLevel == 0) {
                // Missing skill
                missing.add(GapAnalysisDTO.SkillGapDTO.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .skillCategory(skill.getCategory().name())
                        .requiredLevel(requiredLevel)
                        .currentLevel(0)
                        .gap(requiredLevel)
                        .importance(req.getImportance().name())
                        .build());
            } else if (currentLevel < requiredLevel) {
                // Has skill but below required level
                gaps.add(GapAnalysisDTO.SkillGapDTO.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .skillCategory(skill.getCategory().name())
                        .requiredLevel(requiredLevel)
                        .currentLevel(currentLevel)
                        .gap(requiredLevel - currentLevel)
                        .importance(req.getImportance().name())
                        .build());
            } else {
                // Meets or exceeds requirement
                matches.add(GapAnalysisDTO.SkillMatchDTO.builder()
                        .skillId(skill.getId())
                        .skillName(skill.getName())
                        .requiredLevel(requiredLevel)
                        .currentLevel(currentLevel)
                        .importance(req.getImportance().name())
                        .build());
                totalMet++;
            }
        }

        // Calculate match score
        double matchScore = totalRequired > 0 ? (totalMet * 100.0 / totalRequired) : 0.0;

        return GapAnalysisDTO.builder()
                .employeeId(employeeId)
                .employeeName(employee.getName())
                .roleProjectId(roleProjectId)
                .roleProjectName(roleProject.getName())
                .matchScore(Math.round(matchScore * 100.0) / 100.0)
                .gaps(gaps)
                .matches(matches)
                .missing(missing)
                .build();
    }

    @Transactional(readOnly = true)
    public List<RecommendationDTO> getRecommendationsForEmployee(Long employeeId, Long roleProjectId, Integer limit) {
        log.info("Getting recommendations for employee {} for role/project {}", employeeId, roleProjectId);

        GapAnalysisDTO gapAnalysis = getEmployeeGapAnalysis(employeeId, roleProjectId);
        List<RecommendationDTO> recommendations = new ArrayList<>();

        // Combine gaps and missing skills
        List<GapAnalysisDTO.SkillGapDTO> allGaps = new ArrayList<>();
        allGaps.addAll(gapAnalysis.getGaps());
        allGaps.addAll(gapAnalysis.getMissing());

        // Sort by importance (MUST_HAVE first) and gap size
        allGaps.sort((a, b) -> {
            if (!a.getImportance().equals(b.getImportance())) {
                return a.getImportance().equals("MUST_HAVE") ? -1 : 1;
            }
            return Integer.compare(b.getGap(), a.getGap());
        });

        // Limit results
        int count = limit != null ? Math.min(limit, allGaps.size()) : allGaps.size();

        for (int i = 0; i < count; i++) {
            GapAnalysisDTO.SkillGapDTO gap = allGaps.get(i);

            // Determine target level for recommendations
            LearningResource.Level targetLevel;
            if (gap.getCurrentLevel() == 0) {
                targetLevel = LearningResource.Level.BEGINNER;
            } else if (gap.getCurrentLevel() == 1) {
                targetLevel = LearningResource.Level.INTERMEDIATE;
            } else {
                targetLevel = LearningResource.Level.ADVANCED;
            }

            // Get resources for this skill at appropriate level
            List<LearningResource> resources = resourceRepository.findBySkillIdAndLevel(gap.getSkillId(), targetLevel);

            // If no resources at target level, get any resources for this skill
            if (resources.isEmpty()) {
                resources = resourceRepository.findBySkillId(gap.getSkillId());
            }

            // Convert to DTOs
            List<LearningResourceDTO> resourceDTOs = resources.stream()
                    .limit(3) // Limit to top 3 resources per skill
                    .map(res -> {
                        Skill skill = skillRepository.findById(res.getSkillId()).orElse(null);
                        return LearningResourceDTO.fromEntity(res, skill != null ? skill.getName() : "Unknown");
                    })
                    .collect(Collectors.toList());

            recommendations.add(RecommendationDTO.builder()
                    .skillId(gap.getSkillId())
                    .skillName(gap.getSkillName())
                    .skillCategory(gap.getSkillCategory())
                    .currentLevel(gap.getCurrentLevel())
                    .targetLevel(gap.getRequiredLevel())
                    .gap(gap.getGap())
                    .resources(resourceDTOs)
                    .build());
        }

        return recommendations;
    }
}
