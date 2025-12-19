package com.skillbridge.dto;

import com.skillbridge.entity.ProjectAssignment;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartProjectRequest {
    private List<Long> employeeIds = new ArrayList<>();

    // Map of employeeId to allocation type (BILLABLE, NON_BILLABLE, INVESTMENT)
    private Map<Long, ProjectAssignment.AllocationType> allocationTypes = new HashMap<>();
}
