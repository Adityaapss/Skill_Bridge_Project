package com.skillbridge.service;

import com.skillbridge.dto.LoginRequest;
import com.skillbridge.dto.LoginResponse;
import com.skillbridge.entity.Employee;
import com.skillbridge.exception.DuplicateResourceException;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.security.CustomUserDetailsService;
import com.skillbridge.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication and user registration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Authenticate user and generate JWT token
     */
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        log.info("Attempting login for user: {}", request.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get employee details
        Employee employee = userDetailsService.getEmployeeByEmail(request.getEmail());

        // Generate JWT token
        String token = jwtUtil.generateToken(
                employee.getEmail(),
                employee.getRole().name(),
                employee.getId()
        );

        log.info("Login successful for user: {}", request.getEmail());

        return LoginResponse.builder()
                .token(token)
                .type("Bearer")
                .id(employee.getId())
                .email(employee.getEmail())
                .name(employee.getName())
                .role(employee.getRole().name())
                .jobTitle(employee.getJobTitle())
                .department(employee.getDepartment())
                .build();
    }

    /**
     * Register a new employee (HR_ADMIN only)
     */
    @Transactional
    public Employee register(Employee employee) {
        log.info("Registering new employee: {}", employee.getEmail());

        // Check if email already exists
        if (employeeRepository.existsByEmail(employee.getEmail())) {
            throw new DuplicateResourceException("Employee", "email", employee.getEmail());
        }

        // Encode password
        employee.setPassword(passwordEncoder.encode(employee.getPassword()));

        // Save employee
        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee registered successfully: {}", savedEmployee.getEmail());

        return savedEmployee;
    }

    /**
     * Get current authenticated user
     */
    @Transactional(readOnly = true)
    public Employee getCurrentUser(String email) {
        return userDetailsService.getEmployeeByEmail(email);
    }
}
