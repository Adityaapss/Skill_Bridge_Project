package com.skillbridge.repository;

import com.skillbridge.entity.RoleProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleProjectRepository extends JpaRepository<RoleProject, Long> {
    
    List<RoleProject> findByType(RoleProject.Type type);
    
    List<RoleProject> findByOwnerId(Long ownerId);
    
    List<RoleProject> findByStatus(RoleProject.Status status);
    
    List<RoleProject> findByTypeAndStatus(RoleProject.Type type, RoleProject.Status status);
    
    List<RoleProject> findByOwnerIdAndStatus(Long ownerId, RoleProject.Status status);
}
