package com.skillbridge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoleProjectRequest {

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Type is required (ROLE or PROJECT)")
    private String type;

    private String description;

    @NotNull(message = "Status is required")
    private String status = "ACTIVE";
}
