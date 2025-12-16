package com.skillbridge.service;

import com.skillbridge.dto.CreateRoleProjectRequest;
import com.skillbridge.dto.RoleProjectDTO;
import com.skillbridge.entity.Employee;
import com.skillbridge.entity.RoleProject;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.repository.RoleProjectRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleProjectService {

    private final RoleProjectRepository roleProjectRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<RoleProjectDTO> getAllRolesProjects(String type, String status) {
        log.info("Fetching roles/projects with type={}, status={}", type, status);

        List<RoleProject> roleProjects;
        if (type != null && status != null) {
            roleProjects = roleProjectRepository.findByTypeAndStatus(
                    RoleProject.Type.valueOf(type.toUpperCase()),
                    RoleProject.Status.valueOf(status.toUpperCase()));
        } else if (type != null) {
            roleProjects = roleProjectRepository.findByType(RoleProject.Type.valueOf(type.toUpperCase()));
        } else if (status != null) {
            roleProjects = roleProjectRepository.findByStatus(RoleProject.Status.valueOf(status.toUpperCase()));
        } else {
            roleProjects = roleProjectRepository.findAll();
        }

        return roleProjects.stream()
                .map(rp -> {
                    String ownerName = employeeRepository.findById(rp.getOwnerId())
                            .map(Employee::getName)
                            .orElse("Unknown");
                    return RoleProjectDTO.fromEntity(rp, ownerName);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RoleProjectDTO getRoleProjectById(Long id) {
        log.info("Fetching role/project with id={}", id);
        RoleProject rp = roleProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoleProject", "id", id));

        String ownerName = employeeRepository.findById(rp.getOwnerId())
                .map(Employee::getName)
                .orElse("Unknown");

        return RoleProjectDTO.fromEntity(rp, ownerName);
    }

    @Transactional
    public RoleProjectDTO createRoleProject(CreateRoleProjectRequest request, Long ownerId) {
        log.info("Creating new role/project: {}", request.getName());

        RoleProject roleProject = new RoleProject();
        roleProject.setName(request.getName());
        roleProject.setType(RoleProject.Type.valueOf(request.getType().toUpperCase()));
        roleProject.setDescription(request.getDescription());
        roleProject.setOwnerId(ownerId);
        roleProject.setStatus(RoleProject.Status.valueOf(request.getStatus().toUpperCase()));

        RoleProject saved = roleProjectRepository.save(roleProject);
        log.info("Role/project created successfully with id={}", saved.getId());

        String ownerName = employeeRepository.findById(ownerId)
                .map(Employee::getName)
                .orElse("Unknown");

        return RoleProjectDTO.fromEntity(saved, ownerName);
    }

    @Transactional
    public RoleProjectDTO updateRoleProject(Long id, CreateRoleProjectRequest request) {
        log.info("Updating role/project with id={}", id);

        RoleProject roleProject = roleProjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RoleProject", "id", id));

        roleProject.setName(request.getName());
        roleProject.setType(RoleProject.Type.valueOf(request.getType().toUpperCase()));
        roleProject.setDescription(request.getDescription());
        roleProject.setStatus(RoleProject.Status.valueOf(request.getStatus().toUpperCase()));

        RoleProject updated = roleProjectRepository.save(roleProject);
        log.info("Role/project updated successfully");

        String ownerName = employeeRepository.findById(updated.getOwnerId())
                .map(Employee::getName)
                .orElse("Unknown");

        return RoleProjectDTO.fromEntity(updated, ownerName);
    }

    @Transactional
    public void deleteRoleProject(Long id) {
        log.info("Deleting role/project with id={}", id);

        if (!roleProjectRepository.existsById(id)) {
            throw new ResourceNotFoundException("RoleProject", "id", id);
        }

        roleProjectRepository.deleteById(id);
        log.info("Role/project deleted successfully");
    }
}
