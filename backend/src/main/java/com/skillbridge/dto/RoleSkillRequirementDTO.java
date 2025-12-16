package com.skillbridge.dto;

import com.skillbridge.entity.RoleSkillRequirement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleSkillRequirementDTO {
    private Long id;
    private Long roleProjectId;
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer requiredLevel;
    private String importance;

    public static RoleSkillRequirementDTO fromEntity(RoleSkillRequirement req, String skillName, String skillCategory) {
        return RoleSkillRequirementDTO.builder()
                .id(req.getId())
                .roleProjectId(req.getRoleProjectId())
                .skillId(req.getSkillId())
                .skillName(skillName)
                .skillCategory(skillCategory)
                .requiredLevel(req.getRequiredLevel())
                .importance(req.getImportance().name())
                .build();
    }
}
