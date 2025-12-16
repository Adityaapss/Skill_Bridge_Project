package com.skillbridge.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddRequirementRequest {

    @NotNull(message = "Skill ID is required")
    private Long skillId;

    @NotNull(message = "Required level is required")
    @Min(value = 1, message = "Required level must be between 1 and 3")
    @Max(value = 3, message = "Required level must be between 1 and 3")
    private Integer requiredLevel;

    @NotNull(message = "Importance is required")
    private String importance = "NICE_TO_HAVE";
}
