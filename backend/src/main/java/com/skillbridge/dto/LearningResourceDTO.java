package com.skillbridge.dto;

import com.skillbridge.entity.LearningResource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningResourceDTO {
    private Long id;
    private String title;
    private String url;
    private String type;
    private Long skillId;
    private String skillName;
    private String level;
    private Integer estimatedDuration;
    private Boolean isFree;
    private String description;

    public static LearningResourceDTO fromEntity(LearningResource resource, String skillName) {
        return LearningResourceDTO.builder()
                .id(resource.getId())
                .title(resource.getTitle())
                .url(resource.getUrl())
                .type(resource.getType().name())
                .skillId(resource.getSkillId())
                .skillName(skillName)
                .level(resource.getLevel().name())
                .estimatedDuration(resource.getEstimatedDuration())
                .isFree(resource.getIsFree())
                .description(resource.getDescription())
                .build();
    }
}
