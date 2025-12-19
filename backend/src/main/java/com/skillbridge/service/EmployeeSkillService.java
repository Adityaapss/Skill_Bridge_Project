package com.skillbridge.service;

import com.skillbridge.dto.AddEmployeeSkillRequest;
import com.skillbridge.dto.EmployeeSkillDTO;
import com.skillbridge.dto.PendingSkillDTO;
import com.skillbridge.entity.Employee;
import com.skillbridge.entity.EmployeeSkill;
import com.skillbridge.entity.Skill;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.repository.EmployeeSkillRepository;
import com.skillbridge.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeSkillService {

    private final EmployeeSkillRepository employeeSkillRepository;
    private final SkillRepository skillRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<EmployeeSkillDTO> getEmployeeSkills(Long employeeId) {
        log.info("Fetching skills for employee id={}", employeeId);
        // Only return APPROVED skills
        List<EmployeeSkill> employeeSkills = employeeSkillRepository
                .findByEmployeeIdAndApprovalStatus(employeeId, EmployeeSkill.ApprovalStatus.APPROVED);

        return employeeSkills.stream()
                .map(es -> {
                    Skill skill = skillRepository.findById(es.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", es.getSkillId()));
                    return EmployeeSkillDTO.fromEntity(es, skill.getName(), skill.getCategory().name());
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmployeeSkillDTO> getAllEmployeeSkills(Long employeeId) {
        log.info("Fetching ALL skills (including pending/rejected) for employee id={}", employeeId);
        List<EmployeeSkill> employeeSkills = employeeSkillRepository.findByEmployeeId(employeeId);

        return employeeSkills.stream()
                .map(es -> {
                    Skill skill = skillRepository.findById(es.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", es.getSkillId()));
                    EmployeeSkillDTO dto = EmployeeSkillDTO.fromEntity(es, skill.getName(), skill.getCategory().name());

                    // Add approver name if approved/rejected
                    if (es.getApprovedBy() != null) {
                        Employee approver = employeeRepository.findById(es.getApprovedBy()).orElse(null);
                        if (approver != null) {
                            dto.setApprovedByName(approver.getName());
                        }
                    }

                    return dto;
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

        // Set approval status to PENDING by default
        employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.PENDING);

        EmployeeSkill saved = employeeSkillRepository.save(employeeSkill);
        log.info("Employee skill added successfully with PENDING status");
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

    // Approval workflow methods
    @Transactional(readOnly = true)
    public List<PendingSkillDTO> getPendingSkillsForManager(Long managerId) {
        log.info("Fetching pending skill approvals for manager id={}", managerId);

        List<EmployeeSkill> pendingSkills = employeeSkillRepository
                .findPendingSkillsForManager(managerId, EmployeeSkill.ApprovalStatus.PENDING);

        return pendingSkills.stream()
                .map(es -> {
                    Employee employee = employeeRepository.findById(es.getEmployeeId())
                            .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", es.getEmployeeId()));
                    Skill skill = skillRepository.findById(es.getSkillId())
                            .orElseThrow(() -> new ResourceNotFoundException("Skill", "id", es.getSkillId()));

                    PendingSkillDTO dto = new PendingSkillDTO();
                    dto.setId(es.getId());
                    dto.setEmployeeId(employee.getId());
                    dto.setEmployeeName(employee.getName());
                    dto.setEmployeeEmail(employee.getEmail());
                    dto.setSkillId(skill.getId());
                    dto.setSkillName(skill.getName());
                    dto.setSkillCategory(skill.getCategory().name());
                    dto.setProficiencyLevel(es.getProficiencyLevel());
                    dto.setInterestLevel(es.getInterestLevel());
                    dto.setYearsExperience(es.getYearsExperience());
                    dto.setLastUsedDate(es.getLastUsedDate());
                    dto.setSource(es.getSource().name());
                    dto.setSubmittedAt(es.getCreatedAt());
                    dto.setApprovalStatus(es.getApprovalStatus().name());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void approveSkill(Long skillId, Long managerId) {
        log.info("Manager {} approving skill {}", managerId, skillId);

        EmployeeSkill employeeSkill = employeeSkillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill", "id", skillId));

        if (employeeSkill.getApprovalStatus() != EmployeeSkill.ApprovalStatus.PENDING) {
            throw new IllegalStateException("Skill is not in PENDING status");
        }

        employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED);
        employeeSkill.setApprovedBy(managerId);
        employeeSkill.setApprovedAt(LocalDateTime.now());
        employeeSkill.setSource(EmployeeSkill.Source.MANAGER_VALIDATED);

        employeeSkillRepository.save(employeeSkill);
        log.info("Skill approved successfully");
    }

    @Transactional
    public void rejectSkill(Long skillId, Long managerId, String reason) {
        log.info("Manager {} rejecting skill {}", managerId, skillId);

        EmployeeSkill employeeSkill = employeeSkillRepository.findById(skillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill", "id", skillId));

        if (employeeSkill.getApprovalStatus() != EmployeeSkill.ApprovalStatus.PENDING) {
            throw new IllegalStateException("Skill is not in PENDING status");
        }

        employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.REJECTED);
        employeeSkill.setApprovedBy(managerId);
        employeeSkill.setApprovedAt(LocalDateTime.now());
        employeeSkill.setRejectionReason(reason);

        employeeSkillRepository.save(employeeSkill);
        log.info("Skill rejected successfully");
    }
}
