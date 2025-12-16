package com.skillbridge.controller;

import com.skillbridge.dto.LearningResourceDTO;
import com.skillbridge.entity.LearningResource;
import com.skillbridge.service.LearningResourceService;
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
@RequestMapping("/learning-resources")
@RequiredArgsConstructor
@Tag(name = "Learning Resources", description = "Learning resource management endpoints")
public class LearningResourceController {

    private final LearningResourceService resourceService;

    @GetMapping
    @Operation(summary = "Get all resources", description = "Get all learning resources, optionally filtered")
    public ResponseEntity<List<LearningResourceDTO>> getAllResources(
            @RequestParam(required = false) Long skillId,
            @RequestParam(required = false) String level,
            @RequestParam(required = false) String type) {
        List<LearningResourceDTO> resources = resourceService.getAllResources(skillId, level, type);
        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get resource by ID", description = "Get a specific learning resource by ID")
    public ResponseEntity<LearningResourceDTO> getResourceById(@PathVariable Long id) {
        LearningResourceDTO resource = resourceService.getResourceById(id);
        return ResponseEntity.ok(resource);
    }

    @PostMapping
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Create resource", description = "Create a new learning resource (HR_ADMIN only)")
    public ResponseEntity<LearningResourceDTO> createResource(@Valid @RequestBody LearningResource resource) {
        LearningResourceDTO created = resourceService.createResource(resource);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Update resource", description = "Update a learning resource (HR_ADMIN only)")
    public ResponseEntity<LearningResourceDTO> updateResource(
            @PathVariable Long id,
            @Valid @RequestBody LearningResource resource) {
        LearningResourceDTO updated = resourceService.updateResource(id, resource);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Delete resource", description = "Delete a learning resource (HR_ADMIN only)")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
