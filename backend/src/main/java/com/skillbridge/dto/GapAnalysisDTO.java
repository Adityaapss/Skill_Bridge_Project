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
public class GapAnalysisDTO {
    private Long employeeId;
    private String employeeName;
    private Long roleProjectId;
    private String roleProjectName;
    private Double matchScore;
    private List<SkillGapDTO> gaps;
    private List<SkillMatchDTO> matches;
    private List<SkillGapDTO> missing;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapDTO {
        private Long skillId;
        private String skillName;
        private String skillCategory;
        private Integer requiredLevel;
        private Integer currentLevel;
        private Integer gap;
        private String importance;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillMatchDTO {
        private Long skillId;
        private String skillName;
        private Integer requiredLevel;
        private Integer currentLevel;
        private String importance;
    }
}
