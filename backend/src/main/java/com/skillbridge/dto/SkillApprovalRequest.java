package com.skillbridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for skill approval/rejection requests
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SkillApprovalRequest {
    private Long managerId;
    private String action; // "APPROVE" or "REJECT"
    private String rejectionReason; // Only for rejection
}
