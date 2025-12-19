package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeAssignmentDTO {
    private Long id;
    private Long employeeId;
    private String name;
    private String email;
    private String role;
    private LocalDate startDate;
    private LocalDate endDate;
    private String allocationType; // BILLABLE, NON_BILLABLE, INVESTMENT
}
