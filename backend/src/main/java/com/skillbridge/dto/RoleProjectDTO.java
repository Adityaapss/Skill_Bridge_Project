package com.skillbridge.dto;

import com.skillbridge.entity.RoleProject;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleProjectDTO {
    private Long id;
    private String name;
    private String type;
    private String description;
    private Long ownerId;
    private String ownerName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static RoleProjectDTO fromEntity(RoleProject rp, String ownerName) {
        return RoleProjectDTO.builder()
                .id(rp.getId())
                .name(rp.getName())
                .type(rp.getType().name())
                .description(rp.getDescription())
                .ownerId(rp.getOwnerId())
                .ownerName(ownerName)
                .status(rp.getStatus().name())
                .createdAt(rp.getCreatedAt())
                .updatedAt(rp.getUpdatedAt())
                .build();
    }
}
