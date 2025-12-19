package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardDTO {
    private Long employeeId;
    private String employeeName;
    private String managerName;
    private int approvedSkillsCount;
    private List<ProjectDetailDTO> assignedProjects = new ArrayList<>();
}
