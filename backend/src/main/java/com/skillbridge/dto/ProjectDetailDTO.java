package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDetailDTO {
    private Long projectId;
    private String projectName;
    private String description;
    private List<String> techStack = new ArrayList<>();
    private LocalDate startDate;
    private String status;
    private List<TeamMemberDTO> teamMembers = new ArrayList<>();
}
