package com.skillbridge.service;

import com.skillbridge.dto.AddEmployeeSkillRequest;
import com.skillbridge.dto.EmployeeSkillDTO;
import com.skillbridge.entity.EmployeeSkill;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.EmployeeSkillRepository;
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
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<EmployeeSkillDTO> getEmployeeSkills(Long employeeId) {
        log.info("Fetching skills for employee id={}", employeeId);
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployeeId(employeeId);

        return employeeSkills.stream()
                .map(es -> {
                    Skill skill = skillRepository.findById(es.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", es.getSkillId()));
                    return EmployeeSkillDTO.fromEntity(es, skill.getName(), skill.getCategory().name());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public EmployeeSkillDTO addEmployeeSkill(Long employeeId, AddEmployeeSkillRequest request) {
        log.info("Adding skill {} to employee {}", request.getSkillId(), employeeId);

        // Check if skill exists
        Skill skill = skillRepository.findById(request.getSkillId())
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", request.getSkillId()));

        // Check if employee already has this skill
        if (employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, request.getSkillId())) {
            throw new DuplicateResourceException("Employee already has this skill");
        }

        EmployeeSkill employeeSkill = new EmployeeSkill();
        employeeSkill.setEmployeeId(employeeId);
        employeeSkill.setSkillId(request.getSkillId());
        employeeSkill.setProficiencyLevel(request.getProficiencyLevel());
        employeeSkill.setInterestLevel(request.getInterestLevel());
        employeeSkill.setYearsExperience(request.getYearsExperience());
        employeeSkill.setLastUsedDate(request.getLastUsedDate());
        employeeSkill.setSource(EmployeeSkill.Source.valueOf(request.getSource().toUpperCase()));

        EmployeeSkill saved = employeeSkillRepository.save(employeeSkill);
        log.info("Employee skill added successfully");
        return EmployeeSkillDTO.fromEntity(saved, skill.getName(), skill.getCategory().name());
    }

    @Transactional
    public EmployeeSkillDTO updateEmployeeSkill(Long employeeId, Long skillId, AddEmployeeSkillRequest request) {
        log.info("Updating skill {} for employee {}", skillId, employeeId);

        EmployeeSkill employeeSkill = employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill not found"));

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", skillId));

        employeeSkill.setProficiencyLevel(request.getProficiencyLevel());
        employeeSkill.setInterestLevel(request.getInterestLevel());
        employeeSkill.setYearsExperience(request.getYearsExperience());
        employeeSkill.setLastUsedDate(request.getLastUsedDate());

        EmployeeSkill updated = employeeSkillRepository.save(employeeSkill);
        log.info("Employee skill updated successfully");
        return EmployeeSkillDTO.fromEntity(updated, skill.getName(), skill.getCategory().name());
    }

    @Transactional
    public void deleteEmployeeSkill(Long employeeId, Long skillId) {
        log.info("Deleting skill {} from employee {}", skillId, employeeId);

        if (!employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, skillId)) {
            throw new ResourceNotFoundException("Employee skill not found");
        }

        employeeSkillRepository.deleteByEmployeeIdAndSkillId(employeeId, skillId);
        log.info("Employee skill deleted successfully");
    }
}
