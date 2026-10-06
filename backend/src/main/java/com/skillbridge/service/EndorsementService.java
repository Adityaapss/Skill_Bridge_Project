package com.skillbridge.service;

import com.skillbridge.entity.*;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EndorsementService {

    public record EndorsementView(Long id, Long employeeSkillId, Long endorserId, String endorserName,
                                  String comment) {}

    private final SkillEndorsementRepository endorsementRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final NotificationService notificationService;

    @Transactional
    public void endorse(Long endorserId, Long employeeSkillId, String comment) {
        EmployeeSkill es = employeeSkillRepository.findById(employeeSkillId)
                .orElseThrow(() -> new ResourceNotFoundException("Employee skill", "id", employeeSkillId));
        if (es.getEmployeeId().equals(endorserId)) {
            throw new IllegalArgumentException("You cannot endorse your own skill");
        }
        if (es.getApprovalStatus() != EmployeeSkill.ApprovalStatus.APPROVED) {
            throw new IllegalStateException("Only approved skills can be endorsed");
        }
        if (endorsementRepository.existsByEmployeeSkillIdAndEndorserId(employeeSkillId, endorserId)) {
            throw new DuplicateResourceException("You have already endorsed this skill");
        }
        SkillEndorsement e = new SkillEndorsement();
        e.setEmployeeSkillId(employeeSkillId);
        e.setEndorserId(endorserId);
        e.setComment(comment == null || comment.isBlank() ? null : comment.trim());
        endorsementRepository.save(e);

        String endorser = employeeRepository.findById(endorserId).map(Employee::getName).orElse("A colleague");
        String skill = skillRepository.findById(es.getSkillId()).map(Skill::getName).orElse("a skill");
        notificationService.notify(es.getEmployeeId(), Notification.Type.ENDORSEMENT,
                endorser + " endorsed your " + skill + " skill", "/my-skills");
    }

    @Transactional
    public void removeEndorsement(Long endorserId, Long employeeSkillId) {
        endorsementRepository.findByEmployeeSkillIdAndEndorserId(employeeSkillId, endorserId)
                .ifPresent(endorsementRepository::delete);
    }

    /** All endorsements for one employee's skills, grouped by employee-skill id. */
    @Transactional(readOnly = true)
    public Map<Long, List<EndorsementView>> forEmployee(Long employeeId) {
        Set<Long> ids = employeeSkillRepository.findByEmployeeId(employeeId).stream()
                .map(EmployeeSkill::getId).collect(Collectors.toSet());
        if (ids.isEmpty()) {
            return Map.of();
        }
        List<SkillEndorsement> rows = endorsementRepository.findByEmployeeSkillIdIn(ids);
        Map<Long, String> names = employeeRepository
                .findAllById(rows.stream().map(SkillEndorsement::getEndorserId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Employee::getId, Employee::getName));
        return rows.stream().collect(Collectors.groupingBy(SkillEndorsement::getEmployeeSkillId,
                Collectors.mapping(r -> new EndorsementView(r.getId(), r.getEmployeeSkillId(), r.getEndorserId(),
                        names.getOrDefault(r.getEndorserId(), "Unknown"), r.getComment()), Collectors.toList())));
    }
}
