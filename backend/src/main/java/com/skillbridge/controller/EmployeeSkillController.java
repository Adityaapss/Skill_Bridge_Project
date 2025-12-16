package com.skillbridge.controller;

import com.skillbridge.dto.AddEmployeeSkillRequest;
import com.skillbridge.dto.EmployeeSkillDTO;
import com.skillbridge.service.EmployeeSkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees/{employeeId}/skills")
@RequiredArgsConstructor
@Tag(name = "Employee Skills", description = "Employee skill management endpoints")
public class EmployeeSkillController {

    private final EmployeeSkillService employeeSkillService;

    @GetMapping
    @Operation(summary = "Get employee skills", description = "Get all skills for a specific employee")
    public ResponseEntity<List<EmployeeSkillDTO>> getEmployeeSkills(@PathVariable Long employeeId) {
        List<EmployeeSkillDTO> skills = employeeSkillService.getEmployeeSkills(employeeId);
        return ResponseEntity.ok(skills);
    }

    @PostMapping
    @Operation(summary = "Add employee skill", description = "Add a new skill to an employee's profile")
    public ResponseEntity<EmployeeSkillDTO> addEmployeeSkill(
            @PathVariable Long employeeId,
            @Valid @RequestBody AddEmployeeSkillRequest request) {
        EmployeeSkillDTO skill = employeeSkillService.addEmployeeSkill(employeeId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PutMapping("/{skillId}")
    @Operation(summary = "Update employee skill", description = "Update an employee's skill proficiency")
    public ResponseEntity<EmployeeSkillDTO> updateEmployeeSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @Valid @RequestBody AddEmployeeSkillRequest request) {
        EmployeeSkillDTO skill = employeeSkillService.updateEmployeeSkill(employeeId, skillId, request);
        return ResponseEntity.ok(skill);
    }

    @DeleteMapping("/{skillId}")
    @Operation(summary = "Delete employee skill", description = "Remove a skill from an employee's profile")
    public ResponseEntity<Void> deleteEmployeeSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId) {
        employeeSkillService.deleteEmployeeSkill(employeeId, skillId);
        return ResponseEntity.noContent().build();
    }
}
