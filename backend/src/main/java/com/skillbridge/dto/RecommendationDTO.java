package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationDTO {
    private Long skillId;
    private String skillName;
    private String skillCategory;
    private Integer currentLevel;
    private Integer targetLevel;
    private Integer gap;
    private List<LearningResourceDTO> resources;
}
