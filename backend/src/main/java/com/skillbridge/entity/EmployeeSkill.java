package com.skillbridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * EmployeeSkill entity representing an employee's proficiency in a skill
 */
@Entity
@Table(name = "employee_skills", uniqueConstraints = @UniqueConstraint(columnNames = { "employee_id", "skill_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class EmployeeSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_id", nullable = false)
    private Long employeeId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel; // 0-3: None, Beginner, Intermediate, Advanced

    @Column(name = "interest_level", nullable = false)
    private Integer interestLevel; // 0-3

    @Column(name = "years_experience")
    private Double yearsExperience;

    @Column(name = "last_used_date")
    private LocalDate lastUsedDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Source source = Source.SELF_REPORTED;

    // Approval workflow fields
    @Enumerated(EnumType.STRING)
    @Column(name = "approval_status", nullable = false)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

    @Column(name = "approved_by")
    private Long approvedBy; // Manager ID who approved/rejected

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @Column(name = "rejection_reason")
    private String rejectionReason;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Source {
        SELF_REPORTED,
        MANAGER_VALIDATED,
        CERTIFICATION
    }

    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
