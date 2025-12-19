package com.skillbridge.repository;

import com.skillbridge.entity.ProjectAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectAssignmentRepository extends JpaRepository<ProjectAssignment, Long> {

    List<ProjectAssignment> findByProjectId(Long projectId);

    List<ProjectAssignment> findByProjectIdAndActiveTrue(Long projectId);

    List<ProjectAssignment> findByEmployeeId(Long employeeId);

    List<ProjectAssignment> findByEmployeeIdAndActiveTrue(Long employeeId);

    void deleteByProjectIdAndEmployeeId(Long projectId, Long employeeId);
}
