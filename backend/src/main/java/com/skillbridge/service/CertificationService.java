package com.skillbridge.service;

import com.skillbridge.entity.Certification;
import com.skillbridge.entity.Notification;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.CertificationRepository;
import com.skillbridge.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificationService {

    /** Days before expiry that an employee is warned. */
    public static final int WARNING_DAYS = 60;

    private final CertificationRepository repository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public List<Certification> forEmployee(Long employeeId) {
        return repository.findByEmployeeIdOrderByExpiryDateAsc(employeeId);
    }

    @Transactional
    public Certification add(Long employeeId, Certification c) {
        if (c.getName() == null || c.getName().isBlank()) {
            throw new IllegalArgumentException("Certification name is required");
        }
        if (c.getIssuedDate() != null && c.getExpiryDate() != null && c.getExpiryDate().isBefore(c.getIssuedDate())) {
            throw new IllegalArgumentException("Expiry date cannot be before the issue date");
        }
        UrlValidator.requireWebUrl(c.getCredentialUrl(), "Credential URL");
        c.setId(null);
        c.setEmployeeId(employeeId);
        return repository.save(c);
    }

    @Transactional
    public void delete(Long employeeId, Long id) {
        Certification c = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Certification", "id", id));
        if (!c.getEmployeeId().equals(employeeId)) {
            throw new ResourceNotFoundException("Certification", "id", id);
        }
        repository.delete(c);
    }

    @Transactional(readOnly = true)
    public List<Certification> expiringSoon() {
        LocalDate today = LocalDate.now();
        return repository.findByExpiryDateBetween(today, today.plusDays(WARNING_DAYS));
    }

    /** Daily reminder for certifications about to expire (exactly 60/30/7 days out, so no daily spam). */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void sendExpiryReminders() {
        LocalDate today = LocalDate.now();
        for (Certification c : repository.findByExpiryDateBetween(today, today.plusDays(WARNING_DAYS))) {
            long days = java.time.temporal.ChronoUnit.DAYS.between(today, c.getExpiryDate());
            if (days == 60 || days == 30 || days == 7) {
                notificationService.notify(c.getEmployeeId(), Notification.Type.CERTIFICATION_EXPIRING,
                        "Your " + c.getName() + " certification expires in " + days + " days", "/my-skills");
            }
        }
        log.debug("Certification expiry reminders processed");
    }
}
