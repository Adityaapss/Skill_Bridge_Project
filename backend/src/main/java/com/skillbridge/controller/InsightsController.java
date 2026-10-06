package com.skillbridge.controller;

import com.skillbridge.service.InsightsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Insights", description = "Organisation analytics, staffing and career paths")
public class InsightsController {

    private final InsightsService insightsService;

    @GetMapping("/organization/summary")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Organisation overview by category and department")
    public ResponseEntity<InsightsService.OrganizationSummary> summary() {
        return ResponseEntity.ok(insightsService.organizationSummary());
    }

    @GetMapping("/organization/bus-factor")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Skills held by at most one person")
    public ResponseEntity<List<InsightsService.BusFactorEntry>> busFactor() {
        return ResponseEntity.ok(insightsService.busFactor());
    }

    @GetMapping("/organization/supply-demand")
    @PreAuthorize("hasRole('HR_ADMIN')")
    @Operation(summary = "Skill demand of active roles/projects vs qualified employees")
    public ResponseEntity<List<InsightsService.SupplyDemandEntry>> supplyDemand() {
        return ResponseEntity.ok(insightsService.supplyDemand());
    }

    @GetMapping("/staffing/{roleProjectId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    @Operation(summary = "Best-fit employees for a role/project")
    public ResponseEntity<List<InsightsService.StaffingSuggestion>> staffing(
            @PathVariable Long roleProjectId,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(insightsService.staffingSuggestions(roleProjectId, limit));
    }

    @GetMapping("/employee/{employeeId}/career-paths")
    @PreAuthorize("@access.canView(#employeeId)")
    @Operation(summary = "Gap to each active role, closest first")
    public ResponseEntity<List<InsightsService.CareerPath>> careerPaths(@PathVariable Long employeeId) {
        return ResponseEntity.ok(insightsService.careerPaths(employeeId));
    }
}
