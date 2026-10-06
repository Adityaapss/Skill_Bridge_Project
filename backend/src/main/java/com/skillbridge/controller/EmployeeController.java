package com.skillbridge.controller;

import com.skillbridge.entity.Employee;
import com.skillbridge.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for employee management endpoints
 */
@RestController
@RequestMapping("/employees")
@RequiredArgsConstructor
@Tag(name = "Employees", description = "Employee management endpoints")
public class EmployeeController {

    private final EmployeeService employeeService;

    @GetMapping
    @Operation(summary = "Get all employees", description = "Retrieve all employees")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.getAllEmployees();

        // Remove passwords from response
        employees.forEach(emp -> emp.setPassword(null));

        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@access.canView(#id)")
    @Operation(summary = "Get employee by ID", description = "Retrieve employee details by ID")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable Long id) {
        Employee employee = employeeService.getEmployeeById(id);

        // Remove password from response
        employee.setPassword(null);

        return ResponseEntity.ok(employee);
    }

    @PostMapping
    @Operation(summary = "Create employee", description = "Create a new employee account")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee createdEmployee = employeeService.createEmployee(employee);

        // Remove password from response
        createdEmployee.setPassword(null);

        return ResponseEntity.status(HttpStatus.CREATED).body(createdEmployee);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update employee", description = "Update employee details")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<Employee> updateEmployee(
            @PathVariable Long id,
            @RequestBody Employee employeeDetails) {
        Employee updatedEmployee = employeeService.updateEmployee(id, employeeDetails);

        // Remove password from response
        updatedEmployee.setPassword(null);

        return ResponseEntity.ok(updatedEmployee);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete employee", description = "Delete an employee account")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<Void> deleteEmployee(@PathVariable Long id) {
        employeeService.deleteEmployee(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/department/{department}")
    @Operation(summary = "Get employees by department", description = "Retrieve employees by department")
    @PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable String department) {
        List<Employee> employees = employeeService.getEmployeesByDepartment(department);

        // Remove passwords from response
        employees.forEach(emp -> emp.setPassword(null));

        return ResponseEntity.ok(employees);
    }

    @GetMapping("/role/{role}")
    @Operation(summary = "Get employees by role", description = "Retrieve employees by role")
    @PreAuthorize("hasRole('HR_ADMIN')")
    public ResponseEntity<List<Employee>> getEmployeesByRole(@PathVariable Employee.Role role) {
        List<Employee> employees = employeeService.getEmployeesByRole(role);

        // Remove passwords from response
        employees.forEach(emp -> emp.setPassword(null));

        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}/dashboard")
    @PreAuthorize("@access.canView(#id)")
    @Operation(summary = "Get employee dashboard", description = "Get employee dashboard data including skills and projects")
    public ResponseEntity<com.skillbridge.dto.EmployeeDashboardDTO> getDashboard(@PathVariable Long id) {
        com.skillbridge.dto.EmployeeDashboardDTO dashboard = employeeService.getEmployeeDashboard(id);
        return ResponseEntity.ok(dashboard);
    }
}
