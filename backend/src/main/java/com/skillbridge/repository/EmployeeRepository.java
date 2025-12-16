package com.skillbridge.repository;

import com.skillbridge.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<Employee> findByDepartment(String department);
    
    List<Employee> findByManagerId(Long managerId);
    
    List<Employee> findByRole(Employee.Role role);
}
