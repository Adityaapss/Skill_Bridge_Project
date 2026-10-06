package com.skillbridge.controller;

import com.skillbridge.service.CsvService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "CSV", description = "Skill matrix export and employee bulk import")
public class CsvController {

    private final CsvService csvService;

    @GetMapping("/export/skill-matrix")
    @PreAuthorize("hasAnyRole('MANAGER', 'HR_ADMIN')")
    public ResponseEntity<byte[]> exportMatrix() {
        byte[] body = csvService.exportSkillMatrix().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"skill-matrix.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(body);
    }

    @PostMapping(value = "/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('HR_ADMIN')")
    public CsvService.ImportResult importEmployees(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        return csvService.importEmployees(new String(file.getBytes(), StandardCharsets.UTF_8));
    }
}
