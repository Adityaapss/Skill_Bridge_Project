package com.skillbridge.service;

import com.skillbridge.entity.LearningProgress;
import com.skillbridge.exception.ResourceNotFoundException;
import com.skillbridge.repository.LearningProgressRepository;
import com.skillbridge.repository.LearningResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningProgressService {

    private final LearningProgressRepository progressRepository;
    private final LearningResourceRepository resourceRepository;

    @Transactional(readOnly = true)
    public List<LearningProgress> forEmployee(Long employeeId) {
        return progressRepository.findByEmployeeId(employeeId);
    }

    @Transactional
    public LearningProgress start(Long employeeId, Long resourceId) {
        requireResource(resourceId);
        return progressRepository.findByEmployeeIdAndResourceId(employeeId, resourceId).orElseGet(() -> {
            LearningProgress p = new LearningProgress();
            p.setEmployeeId(employeeId);
            p.setResourceId(resourceId);
            p.setStatus(LearningProgress.Status.IN_PROGRESS);
            p.setStartedAt(LocalDateTime.now());
            return progressRepository.save(p);
        });
    }

    @Transactional
    public LearningProgress complete(Long employeeId, Long resourceId) {
        LearningProgress p = start(employeeId, resourceId);
        p.setStatus(LearningProgress.Status.COMPLETED);
        p.setCompletedAt(LocalDateTime.now());
        return progressRepository.save(p);
    }

    @Transactional
    public void remove(Long employeeId, Long resourceId) {
        progressRepository.findByEmployeeIdAndResourceId(employeeId, resourceId)
                .ifPresent(progressRepository::delete);
    }

    private void requireResource(Long resourceId) {
        if (!resourceRepository.existsById(resourceId)) {
            throw new ResourceNotFoundException("LearningResource", "id", resourceId);
        }
    }
}
