package com.skillbridge.repository;

import com.skillbridge.entity.Certification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    List<Certification> findByEmployeeIdOrderByExpiryDateAsc(Long employeeId);

    List<Certification> findByExpiryDateBetween(java.time.LocalDate from, java.time.LocalDate to);
}
