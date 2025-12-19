package com.skillbridge.controller;

import com.skillbridge.dto.CreateProjectRequest;
import com.skillbridge.dto.ProjectDTO;
import com.skillbridge.dto.StartProjectRequest;
import com.skillbridge.entity.ProjectAssignment;
import com.skillbridge.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller for project management endpoints
 */
@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@Tag(name = "Projects", description = "Project management endpoints")
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    @Operation(summary = "Get all projects", description = "Retrieve all active projects")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<ProjectDTO>> getAllProjects() {
        List<ProjectDTO> projects = projectService.getAllProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/ongoing")
    @Operation(summary = "Get ongoing projects", description = "Retrieve all ongoing projects")
    public ResponseEntity<List<ProjectDTO>> getOngoingProjects() {
        List<ProjectDTO> projects = projectService.getOngoingProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/upcoming")
    @Operation(summary = "Get upcoming projects", description = "Retrieve all upcoming projects")
    public ResponseEntity<List<ProjectDTO>> getUpcomingProjects() {
        List<ProjectDTO> projects = projectService.getUpcomingProjects();
        return ResponseEntity.ok(projects);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID", description = "Retrieve project details by ID")
    public ResponseEntity<ProjectDTO> getProjectById(@PathVariable Long id) {
        ProjectDTO project = projectService.getProjectById(id);
        return ResponseEntity.ok(project);
    }

    @PostMapping
    @Operation(summary = "Create project", description = "Create a new project (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ProjectDTO> createProject(
            @Valid @RequestBody CreateProjectRequest request,
            Authentication authentication) {
        // In a real app, get owner ID from authentication
        Long ownerId = 1L; // Placeholder
        ProjectDTO project = projectService.createProject(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(project);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update project", description = "Update project details (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ProjectDTO> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody CreateProjectRequest request) {
        ProjectDTO project = projectService.updateProject(id, request);
        return ResponseEntity.ok(project);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete project", description = "Delete a project (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    @Operation(summary = "Start project", description = "Start an upcoming project with employee assignments (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<ProjectDTO> startProject(
            @PathVariable Long id,
            @Valid @RequestBody StartProjectRequest request) {
        ProjectDTO project = projectService.startProject(id, request);
        return ResponseEntity.ok(project);
    }

    @PostMapping("/{id}/assign")
    @Operation(summary = "Assign employee", description = "Assign an employee to a project with allocation type (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> assignEmployee(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {
        Long employeeId = ((Number) request.get("employeeId")).longValue();
        String allocationTypeStr = (String) request.get("allocationType");

        if (allocationTypeStr != null && !allocationTypeStr.isEmpty()) {
            ProjectAssignment.AllocationType allocationType = ProjectAssignment.AllocationType
                    .valueOf(allocationTypeStr);
            projectService.assignEmployee(id, employeeId, allocationType);
        } else {
            projectService.assignEmployee(id, employeeId);
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unassign")
    @Operation(summary = "Unassign employee", description = "Remove an employee from a project (HR_ADMIN/MANAGER only)")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<Void> unassignEmployee(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long employeeId = request.get("employeeId");
        projectService.unassignEmployee(id, employeeId);
        return ResponseEntity.ok().build();
    }
}
