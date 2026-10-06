package com.skillbridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** A peer's endorsement of an employee's skill. */
@Entity
@Table(name = "skill_endorsements", uniqueConstraints = @UniqueConstraint(columnNames = { "employee_skill_id", "endorser_id" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SkillEndorsement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "employee_skill_id", nullable = false)
    private Long employeeSkillId;

    @Column(name = "endorser_id", nullable = false)
    private Long endorserId;

    @Column(length = 500)
    private String comment;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
