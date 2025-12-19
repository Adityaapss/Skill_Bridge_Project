package com.skillbridge.repository;

import com.skillbridge.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatus(Project.ProjectStatus status);

    List<Project> findByStatusAndActiveTrue(Project.ProjectStatus status);

    List<Project> findByActiveTrue();

    List<Project> findByOwnerId(Long ownerId);
}
