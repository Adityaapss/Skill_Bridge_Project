package com.skillbridge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddEmployeeSkillRequest {

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Proficiency level is required")
    @Min(value = 0, message = "Proficiency level must be between 0 and 3")
    @Max(value = 3, message = "Proficiency level must be between 0 and 3")
    private Integer proficiencyLevel;

    @NotNull(message = "Interest level is required")
    @Min(value = 0, message = "Interest level must be between 0 and 3")
    @Max(value = 3, message = "Interest level must be between 0 and 3")
    private Integer interestLevel;

    @Min(value = 0, message = "Years of experience cannot be negative")
    private Double yearsExperience;

    private LocalDate lastUsedDate;

    private String source = "SELF_REPORTED";
}
