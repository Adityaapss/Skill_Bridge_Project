package com.skillbridge.service;

import com.skillbridge.dto.AddEmployeeSkillRequest;
import com.skillbridge.dto.EmployeeSkillDTO;
import com.skillbridge.dto.PendingSkillDTO;
import com.skillbridge.entity.Employee;
import com.skillbridge.entity.EmployeeSkill;
import com.skillbridge.entity.Notification;
import com.skillbridge.entity.Skill;
import com.skillbridge.entity.SkillHistory;
import com.skillbridge.repository.SkillHistoryRepository;
import com.skillbridge.security.AccessGuard;
import org.springframework.security.access.AccessDeniedException;
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
    private final SkillHistoryRepository skillHistoryRepository;
    private final NotificationService notificationService;
    private final AccessGuard accessGuard;

    private void recordHistory(Long employeeId, Long skillId, SkillHistory.Action action,
                               Integer oldLevel, Integer newLevel, Long actorId, String note) {
        SkillHistory h = new SkillHistory();
        h.setEmployeeId(employeeId);
        h.setSkillId(skillId);
        h.setAction(action);
        h.setOldLevel(oldLevel);
        h.setNewLevel(newLevel);
        h.setActorId(actorId);
        h.setNote(note);
        skillHistoryRepository.save(h);
    }

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
        recordHistory(employeeId, skill.getId(), SkillHistory.Action.ADDED, null,
                request.getProficiencyLevel(), accessGuard.currentEmployeeId(), null);
        notifyManagerOfSubmission(employeeId, skill.getName());
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

        Integer oldLevel = employeeSkill.getProficiencyLevel();
        boolean levelChanged = !oldLevel.equals(request.getProficiencyLevel());

        employeeSkill.setProficiencyLevel(request.getProficiencyLevel());
        employeeSkill.setInterestLevel(request.getInterestLevel());
        employeeSkill.setYearsExperience(request.getYearsExperience());
        employeeSkill.setLastUsedDate(request.getLastUsedDate());

        // A changed proficiency level must be re-validated; otherwise an approved skill could be
        // inflated without review.
        if (levelChanged) {
            employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.PENDING);
            employeeSkill.setApprovedBy(null);
            employeeSkill.setApprovedAt(null);
            employeeSkill.setRejectionReason(null);
            employeeSkill.setSource(EmployeeSkill.Source.SELF_REPORTED);
        }

        EmployeeSkill updated = employeeSkillRepository.save(employeeSkill);
        if (levelChanged) {
            recordHistory(employeeId, skillId, SkillHistory.Action.UPDATED, oldLevel,
                    request.getProficiencyLevel(), accessGuard.currentEmployeeId(), null);
            notifyManagerOfSubmission(employeeId, skill.getName());
        }
        log.info("Employee skill updated successfully");
        return EmployeeSkillDTO.fromEntity(updated, skill.getName(), skill.getCategory().name());
    }

    @Transactional
    public void deleteEmployeeSkill(Long employeeId, Long skillId) {
        log.info("Deleting skill {} from employee {}", skillId, employeeId);

        if (!employeeSkillRepository.existsByEmployeeIdAndSkillId(employeeId, skillId)) {
            throw new ResourceNotFoundException("Employee skill not found");
        }

        employeeSkillRepository.findByEmployeeIdAndSkillId(employeeId, skillId).ifPresent(es ->
                recordHistory(employeeId, skillId, SkillHistory.Action.REMOVED, es.getProficiencyLevel(), null,
                        accessGuard.currentEmployeeId(), null));
        employeeSkillRepository.deleteByEmployeeIdAndSkillId(employeeId, skillId);
        log.info("Employee skill deleted successfully");
    }

    // Approval workflow methods
    @Transactional(readOnly = true)
    public List<PendingSkillDTO> getPendingSkillsForCurrentUser() {
        Employee me = accessGuard.currentEmployee();
        if (me.getRole() == Employee.Role.HR_ADMIN) {
            return toPendingDTOs(employeeSkillRepository.findByApprovalStatus(EmployeeSkill.ApprovalStatus.PENDING));
        }
        return getPendingSkillsForManager(me.getId());
    }

    @Transactional(readOnly = true)
    public List<PendingSkillDTO> getPendingSkillsForManager(Long managerId) {
        log.info("Fetching pending skill approvals for manager id={}", managerId);

        List<EmployeeSkill> pendingSkills = employeeSkillRepository
                .findPendingSkillsForManager(managerId, EmployeeSkill.ApprovalStatus.PENDING);

        return toPendingDTOs(pendingSkills);
    }

    private List<PendingSkillDTO> toPendingDTOs(List<EmployeeSkill> pendingSkills) {
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
    public void approveSkill(Long employeeSkillId) {
        Employee approver = accessGuard.currentEmployee();
        EmployeeSkill employeeSkill = loadPendingForReview(employeeSkillId);
        log.info("Employee {} approving employee-skill {}", approver.getId(), employeeSkillId);

        employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED);
        employeeSkill.setApprovedBy(approver.getId());
        employeeSkill.setApprovedAt(LocalDateTime.now());
        employeeSkill.setRejectionReason(null);
        employeeSkill.setSource(EmployeeSkill.Source.MANAGER_VALIDATED);
        employeeSkillRepository.save(employeeSkill);

        String skillName = skillName(employeeSkill.getSkillId());
        recordHistory(employeeSkill.getEmployeeId(), employeeSkill.getSkillId(), SkillHistory.Action.APPROVED,
                null, employeeSkill.getProficiencyLevel(), approver.getId(), null);
        notificationService.notify(employeeSkill.getEmployeeId(), Notification.Type.SKILL_APPROVED,
                approver.getName() + " approved your " + skillName + " skill", "/my-skills");
    }

    @Transactional
    public void rejectSkill(Long employeeSkillId, String reason) {
        Employee approver = accessGuard.currentEmployee();
        EmployeeSkill employeeSkill = loadPendingForReview(employeeSkillId);
        log.info("Employee {} rejecting employee-skill {}", approver.getId(), employeeSkillId);

        employeeSkill.setApprovalStatus(EmployeeSkill.ApprovalStatus.REJECTED);
        employeeSkill.setApprovedBy(approver.getId());
        employeeSkill.setApprovedAt(LocalDateTime.now());
        employeeSkill.setRejectionReason(reason);
        employeeSkillRepository.save(employeeSkill);

        String skillName = skillName(employeeSkill.getSkillId());
        recordHistory(employeeSkill.getEmployeeId(), employeeSkill.getSkillId(), SkillHistory.Action.REJECTED,
                null, employeeSkill.getProficiencyLevel(), approver.getId(), reason);
        notificationService.notify(employeeSkill.getEmployeeId(), Notification.Type.SKILL_REJECTED,
                approver.getName() + " rejected your " + skillName + " skill"
                        + (reason != null && !reason.isBlank() ? ": " + reason : ""), "/my-skills");
    }

    /** Loads a pending skill and verifies the caller may review it (their report, or HR). */
    private EmployeeSkill loadPendingForReview(Long employeeSkillId) {
        EmployeeSkill employeeSkill = employeeSkillRepository.findById(employeeSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill", "id", employeeSkillId));
        if (!accessGuard.canApproveFor(employeeSkill.getEmployeeId())) {
            throw new AccessDeniedException("You can only review skills of your direct reports");
        }
        if (employeeSkill.getApprovalStatus() != EmployeeSkill.ApprovalStatus.PENDING) {
            throw new IllegalStateException("Skill is not in PENDING status");
        }
        return employeeSkill;
    }

    private void notifyManagerOfSubmission(Long employeeId, String skillName) {
        employeeRepository.findById(employeeId).ifPresent(emp -> {
            if (emp.getManagerId() != null) {
                notificationService.notify(emp.getManagerId(), Notification.Type.SKILL_SUBMITTED,
                        emp.getName() + " submitted " + skillName + " for approval", "/dashboard");
            }
        });
    }

    private String skillName(Long skillId) {
        return skillRepository.findById(skillId).map(Skill::getName).orElse("a");
    }

    @Transactional(readOnly = true)
    public List<SkillHistory> getHistory(Long employeeId) {
        return skillHistoryRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
    }
}
