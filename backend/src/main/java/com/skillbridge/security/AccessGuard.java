package com.skillbridge.security;

import com.skillbridge.entity.Employee;
import com.skillbridge.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Object-level authorization rules, referenced from @PreAuthorize as @access.
 * The acting identity always comes from the validated JWT, never from request parameters.
 */
@Component("access")
@RequiredArgsConstructor
public class AccessGuard {

    private final EmployeeRepository employeeRepository;

    /** The authenticated employee (throws if there is none). */
    public Employee currentEmployee() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Not authenticated");
        }
        return employeeRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Unknown user"));
    }

    public Long currentEmployeeId() {
        return currentEmployee().getId();
    }

    public boolean isSelf(Long employeeId) {
        return employeeId != null && employeeId.equals(currentEmployeeId());
    }

    /** Read access: self, any manager (needed for staffing) or HR. */
    public boolean canView(Long employeeId) {
        Employee me = currentEmployee();
        return me.getRole() != Employee.Role.EMPLOYEE || me.getId().equals(employeeId);
    }

    /** Write access to an employee's own skill profile: self only (HR may also correct data). */
    public boolean canEditProfile(Long employeeId) {
        Employee me = currentEmployee();
        return me.getRole() == Employee.Role.HR_ADMIN || me.getId().equals(employeeId);
    }

    /** Approval rights: HR, or the employee's direct manager. */
    public boolean canApproveFor(Long employeeId) {
        Employee me = currentEmployee();
        if (me.getRole() == Employee.Role.HR_ADMIN) {
            return true;
        }
        if (me.getRole() != Employee.Role.MANAGER) {
            return false;
        }
        return employeeRepository.findById(employeeId)
                .map(e -> me.getId().equals(e.getManagerId()))
                .orElse(false);
    }
}
