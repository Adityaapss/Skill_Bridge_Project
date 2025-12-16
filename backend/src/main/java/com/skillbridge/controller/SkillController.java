package com.skillbridge.controller;

import com.skillbridge.dto.CreateSkillRequest;
import com.skillbridge.dto.SkillDTO;
import com.skillbridge.service.SkillService;
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
@RequestMapping("/skills")
@RequiredArgsConstructor
@Tag(name = "Skills", description = "Skill catalog management endpoints")
public class SkillController {

    private final SkillService skillService;

    @GetMapping
    @Operation(summary = "Get all skills", description = "Get all skills, optionally filtered by active status")
    public ResponseEntity<List<SkillDTO>> getAllSkills(
            @RequestParam(required = false) Boolean active) {
        List<SkillDTO> skills = skillService.getAllSkills(active);
        return ResponseEntity.ok(skills);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get skill by ID", description = "Get a specific skill by its ID")
    public ResponseEntity<SkillDTO> getSkillById(@PathVariable Long id) {
        SkillDTO skill = skillService.getSkillById(id);
        return ResponseEntity.ok(skill);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get skills by category", description = "Get all active skills in a specific category")
    public ResponseEntity<List<SkillDTO>> getSkillsByCategory(@PathVariable String category) {
        List<SkillDTO> skills = skillService.getSkillsByCategory(category);
        return ResponseEntity.ok(skills);
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Create skill", description = "Create a new skill (HR_ADMIN only)")
    public ResponseEntity<SkillDTO> createSkill(@Valid @RequestBody CreateSkillRequest request) {
        SkillDTO skill = skillService.createSkill(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(skill);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Update skill", description = "Update an existing skill (HR_ADMIN only)")
    public ResponseEntity<SkillDTO> updateSkill(
            @PathVariable Long id,
            @Valid @RequestBody CreateSkillRequest request) {
        SkillDTO skill = skillService.updateSkill(id, request);
        return ResponseEntity.ok(skill);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Deactivate skill", description = "Deactivate a skill (HR_ADMIN only)")
    public ResponseEntity<Void> deactivateSkill(@PathVariable Long id) {
        skillService.deactivateSkill(id);
        return ResponseEntity.noContent().build();
    }
}
