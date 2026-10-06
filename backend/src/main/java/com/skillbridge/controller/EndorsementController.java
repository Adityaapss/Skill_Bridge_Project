package com.skillbridge.controller;

import com.skillbridge.security.AccessGuard;
import com.skillbridge.service.EndorsementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Endorsements", description = "Peer endorsements of approved skills")
public class EndorsementController {

    private final EndorsementService service;
    private final AccessGuard access;

    @GetMapping("/employees/{employeeId}/endorsements")
    @PreAuthorize("@access.canView(#employeeId)")
    public Map<Long, List<EndorsementService.EndorsementView>> forEmployee(@PathVariable Long employeeId) {
        return service.forEmployee(employeeId);
    }

    @PostMapping("/employee-skills/{employeeSkillId}/endorse")
    public ResponseEntity<Void> endorse(@PathVariable Long employeeSkillId,
                                        @RequestBody(required = false) Map<String, String> body) {
        service.endorse(access.currentEmployeeId(), employeeSkillId, body == null ? null : body.get("comment"));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping("/employee-skills/{employeeSkillId}/endorse")
    public ResponseEntity<Void> removeEndorsement(@PathVariable Long employeeSkillId) {
        service.removeEndorsement(access.currentEmployeeId(), employeeSkillId);
        return ResponseEntity.noContent().build();
    }
}
