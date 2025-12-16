package com.skillbridge.controller;

import com.skillbridge.dto.GapAnalysisDTO;
import com.skillbridge.dto.RecommendationDTO;
import com.skillbridge.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Analytics and gap analysis endpoints")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/employee/{employeeId}/gap")
    @Operation(summary = "Get employee gap analysis", description = "Analyze skill gaps for an employee against a role/project")
    public ResponseEntity<GapAnalysisDTO> getEmployeeGapAnalysis(
            @PathVariable Long employeeId,
            @RequestParam Long roleProjectId) {
        GapAnalysisDTO analysis = analyticsService.getEmployeeGapAnalysis(employeeId, roleProjectId);
        return ResponseEntity.ok(analysis);
    }

    @GetMapping("/employee/{employeeId}/recommendations")
    @Operation(summary = "Get learning recommendations", description = "Get recommended learning resources for an employee")
    public ResponseEntity<List<RecommendationDTO>> getRecommendations(
            @PathVariable Long employeeId,
            @RequestParam Long roleProjectId,
            @RequestParam(required = false, defaultValue = "10") Integer limit) {
        List<RecommendationDTO> recommendations = analyticsService.getRecommendationsForEmployee(
                employeeId, roleProjectId, limit);
        return ResponseEntity.ok(recommendations);
    }
}
