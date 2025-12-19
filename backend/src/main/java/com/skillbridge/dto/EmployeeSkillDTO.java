package com.skillbridge.dto;

import com.skillbridge.entity.EmployeeSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeSkillDTO {
    private Long id;
    private Long employeeId;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer proficiencyLevel;
    private Integer interestLevel;
    private Double yearsExperience;
    private LocalDate lastUsedDate;
    private String source;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Approval workflow fields
    private String approvalStatus;
    private Long approvedBy;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectionReason;

    public static EmployeeSkillDTO fromEntity(EmployeeSkill es, String skillName, String skillCategory) {
        return EmployeeSkillDTO.builder()
                .id(es.getId())
                .employeeId(es.getEmployeeId())
                .skillId(es.getSkillId())
                .skillName(skillName)
                .skillCategory(skillCategory)
                .proficiencyLevel(es.getProficiencyLevel())
                .interestLevel(es.getInterestLevel())
                .yearsExperience(es.getYearsExperience())
                .lastUsedDate(es.getLastUsedDate())
                .source(es.getSource().name())
                .approvalStatus(es.getApprovalStatus().name())
                .approvedBy(es.getApprovedBy())
                .approvedAt(es.getApprovedAt())
                .rejectionReason(es.getRejectionReason())
                .createdAt(es.getCreatedAt())
                .updatedAt(es.getUpdatedAt())
                .build();
    }
}
