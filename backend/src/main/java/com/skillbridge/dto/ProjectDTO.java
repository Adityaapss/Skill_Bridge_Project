package com.skillbridge.dto;

import com.skillbridge.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private List<String> techStack = new ArrayList<>();
    private LocalDate startDate;
    private LocalDate expectedStartDate;
    private LocalDate endDate;
    private Project.ProjectStatus status;
    private Boolean active;
    private Long ownerId;
    private List<EmployeeAssignmentDTO> assignedEmployees = new ArrayList<>();
}
