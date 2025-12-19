package com.skillbridge.service;

import com.skillbridge.dto.CreateProjectRequest;
import com.skillbridge.dto.EmployeeAssignmentDTO;
import com.skillbridge.dto.ProjectDTO;
import com.skillbridge.dto.StartProjectRequest;
import com.skillbridge.entity.Employee;
import com.skillbridge.entity.Project;
import com.skillbridge.entity.ProjectAssignment;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.repository.ProjectAssignmentRepository;
import com.skillbridge.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectAssignmentRepository assignmentRepository;
    private final EmployeeRepository employeeRepository;

    /**
     * Get all active projects
     */
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get ongoing projects
     */
    public List<ProjectDTO> getOngoingProjects() {
        return projectRepository.findByStatusAndActiveTrue(Project.ProjectStatus.ONGOING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get upcoming projects
     */
    public List<ProjectDTO> getUpcomingProjects() {
        return projectRepository.findByStatusAndActiveTrue(Project.ProjectStatus.UPCOMING).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get project by ID
     */
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        return convertToDTO(project);
    }

    /**
     * Create new project
     */
    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, Long ownerId) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setExpectedStartDate(request.getExpectedStartDate());
        project.setStatus(Project.ProjectStatus.UPCOMING);
        project.setActive(true);
        project.setOwnerId(ownerId);

        Project saved = projectRepository.save(project);
        return convertToDTO(saved);
    }

    /**
     * Update project
     */
    @Transactional
    public ProjectDTO updateProject(Long id, CreateProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setTechStack(request.getTechStack());
        project.setExpectedStartDate(request.getExpectedStartDate());

        Project updated = projectRepository.save(project);
        return convertToDTO(updated);
    }

    /**
     * Delete project (soft delete)
     */
    @Transactional
    public void deleteProject(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));
        project.setActive(false);
        projectRepository.save(project);
    }

    /**
     * Start project with employee assignments
     */
    @Transactional
    public ProjectDTO startProject(Long id, StartProjectRequest request) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + id));

        if (project.getStatus() != Project.ProjectStatus.UPCOMING) {
            throw new RuntimeException("Only upcoming projects can be started");
        }

        // Update project status
        project.setStatus(Project.ProjectStatus.ONGOING);
        project.setStartDate(LocalDate.now());
        projectRepository.save(project);

        // Assign employees with allocation types
        for (Long employeeId : request.getEmployeeIds()) {
            ProjectAssignment.AllocationType allocationType = request.getAllocationTypes() != null
                    ? request.getAllocationTypes().getOrDefault(employeeId, ProjectAssignment.AllocationType.BILLABLE)
                    : ProjectAssignment.AllocationType.BILLABLE;
            assignEmployee(id, employeeId, allocationType);
        }

        return convertToDTO(project);
    }

    /**
     * Assign employee to project with allocation type
     */
    @Transactional
    public void assignEmployee(Long projectId, Long employeeId, ProjectAssignment.AllocationType allocationType) {
        // Verify project exists
        projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found with id: " + projectId));

        // Verify employee exists
        employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + employeeId));

        // Create assignment
        ProjectAssignment assignment = new ProjectAssignment();
        assignment.setProjectId(projectId);
        assignment.setEmployeeId(employeeId);
        assignment.setStartDate(LocalDate.now());
        assignment.setActive(true);
        assignment.setAllocationType(allocationType);

        assignmentRepository.save(assignment);
    }

    /**
     * Assign employee to project (default to BILLABLE)
     */
    @Transactional
    public void assignEmployee(Long projectId, Long employeeId) {
        assignEmployee(projectId, employeeId, ProjectAssignment.AllocationType.BILLABLE);
    }

    /**
     * Remove employee from project
     */
    @Transactional
    public void unassignEmployee(Long projectId, Long employeeId) {
        List<ProjectAssignment> assignments = assignmentRepository.findByProjectIdAndActiveTrue(projectId);

        assignments.stream()
                .filter(a -> a.getEmployeeId().equals(employeeId))
                .forEach(a -> {
                    a.setActive(false);
                    a.setEndDate(LocalDate.now());
                    assignmentRepository.save(a);
                });
    }

    /**
     * Convert Project entity to DTO with assigned employees
     */
    private ProjectDTO convertToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setTechStack(project.getTechStack());
        dto.setStartDate(project.getStartDate());
        dto.setExpectedStartDate(project.getExpectedStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setStatus(project.getStatus());
        dto.setActive(project.getActive());
        dto.setOwnerId(project.getOwnerId());

        // Get assigned employees
        List<ProjectAssignment> assignments = assignmentRepository.findByProjectIdAndActiveTrue(project.getId());
        List<EmployeeAssignmentDTO> assignedEmployees = new ArrayList<>();

        for (ProjectAssignment assignment : assignments) {
            employeeRepository.findById(assignment.getEmployeeId()).ifPresent(employee -> {
                EmployeeAssignmentDTO empDto = new EmployeeAssignmentDTO();
                empDto.setId(assignment.getId());
                empDto.setEmployeeId(employee.getId());
                empDto.setName(employee.getName());
                empDto.setEmail(employee.getEmail());
                empDto.setRole(employee.getRole().toString());
                empDto.setStartDate(assignment.getStartDate());
                empDto.setEndDate(assignment.getEndDate());
                empDto.setAllocationType(assignment.getAllocationType() != null
                        ? assignment.getAllocationType().toString()
                        : ProjectAssignment.AllocationType.BILLABLE.toString());
                assignedEmployees.add(empDto);
            });
        }

        dto.setAssignedEmployees(assignedEmployees);
        return dto;
    }
}
