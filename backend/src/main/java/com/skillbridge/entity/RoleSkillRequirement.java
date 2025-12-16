package com.skillbridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * RoleSkillRequirement entity representing required skills for a role or project
 */
@Entity
@Table(name = "role_skill_requirements",
       uniqueConstraints = @UniqueConstraint(columnNames = {"role_project_id", "skill_id"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class RoleSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_project_id", nullable = false)
    private Long roleProjectId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "required_level", nullable = false)
    private Integer requiredLevel; // 1-3: Beginner, Intermediate, Advanced

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Importance importance = Importance.NICE_TO_HAVE;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum Importance {
        MUST_HAVE,
        NICE_TO_HAVE
    }
}
