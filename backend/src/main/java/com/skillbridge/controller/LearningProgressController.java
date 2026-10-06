package com.skillbridge.controller;

import com.skillbridge.entity.LearningProgress;
import com.skillbridge.security.AccessGuard;
import com.skillbridge.service.LearningProgressService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/learning-progress")
@RequiredArgsConstructor
@Tag(name = "Learning Progress", description = "Track the signed-in user's progress through learning resources")
public class LearningProgressController {

    private final LearningProgressService service;
    private final AccessGuard access;

    @GetMapping("/me")
    public List<LearningProgress> mine() {
        return service.forEmployee(access.currentEmployeeId());
    }

    /** Managers and HR can see a person's learning progress. */
    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("@access.canView(#employeeId)")
    public List<LearningProgress> forEmployee(@PathVariable Long employeeId) {
        return service.forEmployee(employeeId);
    }

    @PostMapping("/{resourceId}/start")
    public LearningProgress start(@PathVariable Long resourceId) {
        return service.start(access.currentEmployeeId(), resourceId);
    }

    @PostMapping("/{resourceId}/complete")
    public LearningProgress complete(@PathVariable Long resourceId) {
        return service.complete(access.currentEmployeeId(), resourceId);
    }

    @DeleteMapping("/{resourceId}")
    public ResponseEntity<Void> remove(@PathVariable Long resourceId) {
        service.remove(access.currentEmployeeId(), resourceId);
        return ResponseEntity.noContent().build();
    }
}
