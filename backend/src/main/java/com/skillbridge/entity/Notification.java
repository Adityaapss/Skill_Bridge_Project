package com.skillbridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

/** In-app notification for a single employee. */
@Entity
@Table(name = "notifications", indexes = @Index(columnList = "recipient_id"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "recipient_id", nullable = false)
    private Long recipientId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Type type;

    @Column(nullable = false, length = 500)
    private String message;

    /** Frontend route the notification points at, e.g. /my-skills */
    private String link;

    @Column(name = "is_read", nullable = false)
    private boolean read = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Type {
        SKILL_SUBMITTED, SKILL_APPROVED, SKILL_REJECTED, PROJECT_ASSIGNED, ENDORSEMENT, CERTIFICATION_EXPIRING, GENERAL
    }
}
