package com.skillbridge.service;

import com.skillbridge.dto.EmployeeDashboardDTO;
import com.skillbridge.dto.ProjectDetailDTO;
import com.skillbridge.dto.TeamMemberDTO;
import com.skillbridge.entity.Employee;
import com.skillbridge.entity.EmployeeSkill;
import com.skillbridge.entity.Project;
import com.skillbridge.entity.ProjectAssignment;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.repository.EmployeeSkillRepository;
import com.skillbridge.repository.ProjectAssignmentRepository;
import com.skillbridge.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final ProjectAssignmentRepository projectAssignmentRepository;
    private final ProjectRepository projectRepository;

    /**
     * Get all employees
     */
    public List<Employee> getAllEmployees() {
        return employeeRepository.findAll();
    }

    /**
     * Get employee by ID
     */
    public Employee getEmployeeById(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
    }

    /**
     * Get employee by email
     */
    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
    }

    /**
     * Create new employee
     */
    @Transactional
    public Employee createEmployee(Employee employee) {
        // Check if email already exists
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new RuntimeException("Email already exists: " + employee.getEmail());
        }

        // Encode password
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        return employeeRepository.save(employee);
    }

    /**
     * Update employee
     */
    @Transactional
    public Employee updateEmployee(Long id, Employee employeeDetails) {
        Employee employee = getEmployeeById(id);

        // Update fields
        employee.setName(employeeDetails.getName());
        employee.setEmail(employeeDetails.getEmail());
        employee.setRole(employeeDetails.getRole());
        employee.setDepartment(employeeDetails.getDepartment());

        // Only update password if provided
        if (employeeDetails.getPassword() != null && !employeeDetails.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(employeeDetails.getPassword()));
        }

        return employeeRepository.save(employee);
    }

    /**
     * Delete employee
     */
    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = getEmployeeById(id);
        employeeRepository.delete(employee);
    }

    /**
     * Get employees by department
     */
    public List<Employee> getEmployeesByDepartment(String department) {
        return employeeRepository.findByDepartment(department);
    }

    /**
     * Get employees by role
     */
    public List<Employee> getEmployeesByRole(Employee.Role role) {
        return employeeRepository.findByRole(role);
    }

    /**
     * Get employee dashboard data
     */
    public EmployeeDashboardDTO getEmployeeDashboard(Long employeeId) {
        Employee employee = getEmployeeById(employeeId);

        EmployeeDashboardDTO dashboard = new EmployeeDashboardDTO();
        dashboard.setEmployeeId(employeeId);
        dashboard.setEmployeeName(employee.getName());

        // Get manager name if employee has a manager
        if (employee.getManagerId() != null) {
            Employee manager = employeeRepository.findById(employee.getManagerId()).orElse(null);
            if (manager != null) {
                dashboard.setManagerName(manager.getName());
            }
        }

        // Get approved skills count (only APPROVED, not PENDING or REJECTED)
        List<EmployeeSkill> employeeSkills = employeeSkillRepository
                .findByEmployeeIdAndApprovalStatus(employeeId, EmployeeSkill.ApprovalStatus.APPROVED);
        dashboard.setApprovedSkillsCount(employeeSkills.size());

        // Get assigned projects
        List<ProjectAssignment> assignments = projectAssignmentRepository.findByEmployeeIdAndActiveTrue(employeeId);
        List<ProjectDetailDTO> projectDetails = new ArrayList<>();

        for (ProjectAssignment assignment : assignments) {
            Project project = projectRepository.findById(assignment.getProjectId()).orElse(null);
            if (project != null && project.getActive()) {
                ProjectDetailDTO projectDetail = new ProjectDetailDTO();
                projectDetail.setProjectId(project.getId());
                projectDetail.setProjectName(project.getName());
                projectDetail.setDescription(project.getDescription());
                projectDetail.setTechStack(project.getTechStack());
                projectDetail.setStartDate(project.getStartDate());
                projectDetail.setStatus(project.getStatus().toString());

                // Get all team members for this project
                List<ProjectAssignment> projectAssignments = projectAssignmentRepository
                        .findByProjectIdAndActiveTrue(project.getId());
                List<TeamMemberDTO> teamMembers = new ArrayList<>();

                for (ProjectAssignment pa : projectAssignments) {
                    Employee teamMember = employeeRepository.findById(pa.getEmployeeId()).orElse(null);
                    if (teamMember != null) {
                        TeamMemberDTO memberDTO = new TeamMemberDTO();
                        memberDTO.setEmployeeId(teamMember.getId());
                        memberDTO.setName(teamMember.getName());
                        memberDTO.setEmail(teamMember.getEmail());
                        memberDTO.setRole(teamMember.getRole().toString());
                        memberDTO.setDepartment(teamMember.getDepartment());
                        teamMembers.add(memberDTO);
                    }
                }

                projectDetail.setTeamMembers(teamMembers);
                projectDetails.add(projectDetail);
            }
        }

        dashboard.setAssignedProjects(projectDetails);
        return dashboard;
    }
}
