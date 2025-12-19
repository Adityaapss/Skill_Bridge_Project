package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for displaying pending skill approval requests to managers
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PendingSkillDTO {
    private Long id;
    private Long employeeId;
    private String employeeName;
    private String employeeEmail;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer proficiencyLevel;
    private Integer interestLevel;
    private Double yearsExperience;
    private LocalDate lastUsedDate;
    private String source;
    private LocalDateTime submittedAt;
    private String approvalStatus;
}
