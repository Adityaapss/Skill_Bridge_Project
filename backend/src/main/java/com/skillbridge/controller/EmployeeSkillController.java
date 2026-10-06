package com.skillbridge.controller;

import com.skillbridge.dto.AddEmployeeSkillRequest;
import com.skillbridge.dto.EmployeeSkillDTO;
import com.skillbridge.dto.PendingSkillDTO;
import com.skillbridge.dto.SkillApprovalRequest;
import com.skillbridge.service.EmployeeSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees/{employeeId}/skills")
@RequiredArgsConstructor
@Tag(name = "Employee Skills", description = "Employee skill management endpoints")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    @GetMapping
    @PreAuthorize("@access.canView(#employeeId)")
    @Operation(summary = "Get employee skills", description = "Get all skills for employee with approval status")
    public ResponseEntity<List<EmployeeSkillDTO>> getEmployeeSkills(@PathVariable Long employeeId) {
        List<EmployeeSkillDTO> skills = employeeSkillService.getAllEmployeeSkills(employeeId);
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/all")
    @PreAuthorize("@access.canView(#employeeId)")
    @Operation(summary = "Get all employee skills", description = "Get all skills including pending and rejected")
    public ResponseEntity<List<EmployeeSkillDTO>> getAllEmployeeSkills(@PathVariable Long employeeId) {
        List<EmployeeSkillDTO> skills = employeeSkillService.getAllEmployeeSkills(employeeId);
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/history")
    @PreAuthorize("@access.canView(#employeeId)")
    @Operation(summary = "Skill history", description = "Chronological log of changes to the employee's skills")
    public ResponseEntity<List<com.skillbridge.entity.SkillHistory>> getHistory(@PathVariable Long employeeId) {
        return ResponseEntity.ok(employeeSkillService.getHistory(employeeId));
    }

    @PostMapping
    @PreAuthorize("@access.canEditProfile(#employeeId)")
    @Operation(summary = "Add employee skill", description = "Add a new skill to an employee's profile (PENDING approval)")
    public ResponseEntity<EmployeeSkillDTO> addEmployeeSkill(
            @PathVariable Long employeeId,
            @Valid @RequestBody AddEmployeeSkillRequest request) {
        EmployeeSkillDTO skill = employeeSkillService.addEmployeeSkill(employeeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PutMapping("/{skillId}")
    @PreAuthorize("@access.canEditProfile(#employeeId)")
    @Operation(summary = "Update employee skill", description = "Update an employee's skill proficiency")
    public ResponseEntity<EmployeeSkillDTO> updateEmployeeSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @Valid @RequestBody AddEmployeeSkillRequest request) {
        EmployeeSkillDTO skill = employeeSkillService.updateEmployeeSkill(employeeId, skillId, request);
        return ResponseEntity.ok(skill);
    }

    @DeleteMapping("/{skillId}")
    @PreAuthorize("@access.canEditProfile(#employeeId)")
    @Operation(summary = "Delete employee skill", description = "Remove a skill from an employee's profile")
    public ResponseEntity<Void> deleteEmployeeSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {
        employeeSkillService.deleteEmployeeSkill(employeeId, skillId);
        return ResponseEntity.noContent().build();
    }

    // Approval workflow endpoints
    @GetMapping({ "/pending", "/pending/manager/{managerId}" })
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Get pending skill approvals", description = "Get all pending skill approvals for a manager")
    public ResponseEntity<List<PendingSkillDTO>> getPendingSkillsForManager(
            @PathVariable(required = false) Long managerId) {
        // The path id is ignored: pending items are always those of the authenticated manager
        // (HR sees every pending skill).
        List<PendingSkillDTO> pendingSkills = employeeSkillService.getPendingSkillsForCurrentUser();
        return ResponseEntity.ok(pendingSkills);
    }

    @PostMapping("/{skillId}/approve")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Approve skill", description = "Manager approves an employee's skill")
    public ResponseEntity<Void> approveSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @Valid @RequestBody SkillApprovalRequest request) {
        employeeSkillService.approveSkill(skillId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{skillId}/reject")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Reject skill", description = "Manager rejects an employee's skill")
    public ResponseEntity<Void> rejectSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @Valid @RequestBody SkillApprovalRequest request) {
        employeeSkillService.rejectSkill(skillId, request.getRejectionReason());
        return ResponseEntity.ok().build();
    }
}
