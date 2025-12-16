package com.skillbridge.controller;

import com.skillbridge.dto.AddRequirementRequest;
import com.skillbridge.dto.CreateRoleProjectRequest;
import com.skillbridge.dto.RoleProjectDTO;
import com.skillbridge.dto.RoleSkillRequirementDTO;
import com.skillbridge.security.CustomUserDetailsService;
import com.skillbridge.service.RoleProjectService;
import com.skillbridge.service.RoleSkillRequirementService;
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

@RestController
@RequestMapping("/roles-projects")
@RequiredArgsConstructor
@Tag(name = "Roles & Projects", description = "Role and project management endpoints")
public class RoleProjectController {

    private final RoleProjectService roleProjectService;
    private final RoleSkillRequirementService requirementService;
    private final CustomUserDetailsService userDetailsService;

    @GetMapping
    @Operation(summary = "Get all roles/projects", description = "Get all roles and projects, optionally filtered")
    public ResponseEntity<List<RoleProjectDTO>> getAllRolesProjects(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        List<RoleProjectDTO> roleProjects = roleProjectService.getAllRolesProjects(type, status);
        return ResponseEntity.ok(roleProjects);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get role/project by ID", description = "Get a specific role or project by ID")
    public ResponseEntity<RoleProjectDTO> getRoleProjectById(@PathVariable Long id) {
        RoleProjectDTO roleProject = roleProjectService.getRoleProjectById(id);
        return ResponseEntity.ok(roleProject);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Create role/project", description = "Create a new role or project (MANAGER/HR_ADMIN only)")
    public ResponseEntity<RoleProjectDTO> createRoleProject(
            @Valid @RequestBody CreateRoleProjectRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        Long ownerId = userDetailsService.getEmployeeByEmail(email).getId();
        RoleProjectDTO roleProject = roleProjectService.createRoleProject(request, ownerId);
        return ResponseEntity.status(HttpStatus.CREATED).body(roleProject);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Update role/project", description = "Update a role or project (MANAGER/HR_ADMIN only)")
    public ResponseEntity<RoleProjectDTO> updateRoleProject(
            @PathVariable Long id,
            @Valid @RequestBody CreateRoleProjectRequest request) {
        RoleProjectDTO roleProject = roleProjectService.updateRoleProject(id, request);
        return ResponseEntity.ok(roleProject);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Delete role/project", description = "Delete a role or project (MANAGER/HR_ADMIN only)")
    public ResponseEntity<Void> deleteRoleProject(@PathVariable Long id) {
        roleProjectService.deleteRoleProject(id);
        return ResponseEntity.noContent().build();
    }

    // Skill Requirements endpoints
    @GetMapping("/{roleProjectId}/requirements")
    @Operation(summary = "Get requirements", description = "Get skill requirements for a role/project")
    public ResponseEntity<List<RoleSkillRequirementDTO>> getRequirements(@PathVariable Long roleProjectId) {
        List<RoleSkillRequirementDTO> requirements = requirementService.getRequirements(roleProjectId);
        return ResponseEntity.ok(requirements);
    }

    @PostMapping("/{roleProjectId}/requirements")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Add requirement", description = "Add a skill requirement (MANAGER/HR_ADMIN only)")
    public ResponseEntity<RoleSkillRequirementDTO> addRequirement(
            @PathVariable Long roleProjectId,
            @Valid @RequestBody AddRequirementRequest request) {
        RoleSkillRequirementDTO requirement = requirementService.addRequirement(roleProjectId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(requirement);
    }

    @PutMapping("/{roleProjectId}/requirements/{skillId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Update requirement", description = "Update a skill requirement (MANAGER/HR_ADMIN only)")
    public ResponseEntity<RoleSkillRequirementDTO> updateRequirement(
            @PathVariable Long roleProjectId,
            @PathVariable Long skillId,
            @Valid @RequestBody AddRequirementRequest request) {
        RoleSkillRequirementDTO requirement = requirementService.updateRequirement(roleProjectId, skillId, request);
        return ResponseEntity.ok(requirement);
    }

    @DeleteMapping("/{roleProjectId}/requirements/{skillId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Delete requirement", description = "Delete a skill requirement (MANAGER/HR_ADMIN only)")
    public ResponseEntity<Void> deleteRequirement(
            @PathVariable Long roleProjectId,
            @PathVariable Long skillId) {
        requirementService.deleteRequirement(roleProjectId, skillId);
        return ResponseEntity.noContent().build();
    }
}
