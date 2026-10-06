package com.skillbridge.controller;

import com.skillbridge.entity.Certification;
import com.skillbridge.service.CertificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Certifications", description = "Employee certifications and expiry tracking")
public class CertificationController {

    private final CertificationService service;

    @GetMapping("/employees/{employeeId}/certifications")
    @PreAuthorize("@access.canView(#employeeId)")
    public List<Certification> list(@PathVariable Long employeeId) {
        return service.forEmployee(employeeId);
    }

    @PostMapping("/employees/{employeeId}/certifications")
    @PreAuthorize("@access.canEditProfile(#employeeId)")
    public ResponseEntity<Certification> add(@PathVariable Long employeeId, @RequestBody Certification body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.add(employeeId, body));
    }

    @DeleteMapping("/employees/{employeeId}/certifications/{id}")
    @PreAuthorize("@access.canEditProfile(#employeeId)")
    public ResponseEntity<Void> delete(@PathVariable Long employeeId, @PathVariable Long id) {
        service.delete(employeeId, id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/certifications/expiring")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    public List<Certification> expiring() {
        return service.expiringSoon();
    }
}
