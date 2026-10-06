package com.skillbridge.service;

import com.skillbridge.dto.GapAnalysisDTO;
import com.skillbridge.entity.*;
import com.skillbridge.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock EmployeeSkillRepository employeeSkillRepository;
    @Mock RoleSkillRequirementRepository requirementRepository;
    @Mock SkillRepository skillRepository;
    @Mock LearningResourceRepository resourceRepository;
    @Mock RoleProjectRepository roleProjectRepository;
    @Mock EmployeeRepository employeeRepository;
    @InjectMocks AnalyticsService service;

    private Skill skill(long id, String name) {
        Skill s = new Skill();
        s.setId(id);
        s.setName(name);
        s.setCategory(Skill.Category.LANGUAGE);
        return s;
    }

    private RoleSkillRequirement req(long skillId, int level) {
        RoleSkillRequirement r = new RoleSkillRequirement();
        r.setRoleProjectId(10L);
        r.setSkillId(skillId);
        r.setRequiredLevel(level);
        r.setImportance(RoleSkillRequirement.Importance.MUST_HAVE);
        return r;
    }

    private EmployeeSkill have(long skillId, int level) {
        EmployeeSkill es = new EmployeeSkill();
        es.setEmployeeId(1L);
        es.setSkillId(skillId);
        es.setProficiencyLevel(level);
        es.setApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED);
        return es;
    }

    @Test
    void classifiesMatchesGapsAndMissingUsingApprovedSkillsOnly() {
        Employee e = new Employee();
        e.setId(1L);
        e.setName("Eve");
        RoleProject rp = new RoleProject();
        rp.setId(10L);
        rp.setName("Backend Dev");
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(e));
        when(roleProjectRepository.findById(10L)).thenReturn(Optional.of(rp));
        // Only approved rows are requested: java=3 (meets 2), sql=1 (needs 3), docker absent (needs 2)
        when(employeeSkillRepository.findByEmployeeIdAndApprovalStatus(1L, EmployeeSkill.ApprovalStatus.APPROVED))
                .thenReturn(List.of(have(1, 3), have(2, 1)));
        when(requirementRepository.findByRoleProjectId(10L)).thenReturn(List.of(req(1, 2), req(2, 3), req(3, 2)));
        when(skillRepository.findAllById(any())).thenReturn(List.of(skill(1, "Java"), skill(2, "SQL"), skill(3, "Docker")));

        GapAnalysisDTO result = service.getEmployeeGapAnalysis(1L, 10L);

        assertEquals(1, result.getMatches().size());
        assertEquals(1, result.getGaps().size());
        assertEquals(2, result.getGaps().get(0).getGap());
        assertEquals(1, result.getMissing().size());
        assertEquals("Docker", result.getMissing().get(0).getSkillName());
        assertEquals(33.33, result.getMatchScore());
    }
}
