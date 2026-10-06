package com.skillbridge.service;

import com.skillbridge.entity.*;
import com.skillbridge.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Cross-employee analytics: organisation overview, bus-factor, supply vs demand,
 * staffing suggestions and career paths.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InsightsService {

    /** Level at which someone counts as being able to cover for a skill (Intermediate+). */
    static final int COVER_LEVEL = 2;

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final RoleProjectRepository roleProjectRepository;
    private final RoleSkillRequirementRepository requirementRepository;
    private final ProjectAssignmentRepository assignmentRepository;

    public record CategoryStat(String category, int skills, int holders, double avgLevel) {}
    public record DepartmentStat(String department, int employees, int approvedSkills, double avgLevel) {}
    public record OrganizationSummary(int employees, int activeSkills, int approvedSkillRecords,
                                      int pendingApprovals, List<CategoryStat> categories,
                                      List<DepartmentStat> departments) {}
    public record BusFactorEntry(Long skillId, String skillName, String category, int holders,
                                 List<String> holderNames, boolean requiredByActiveWork) {}
    public record SupplyDemandEntry(Long skillId, String skillName, String category, int demand,
                                    int qualified, int shortfall) {}
    public record StaffingSuggestion(Long employeeId, String name, String department, String jobTitle,
                                     double matchScore, int metSkills, int totalSkills,
                                     int activeAssignments, List<String> missingSkills) {}
    public record CareerPath(Long roleId, String roleName, double matchScore, int skillsToImprove,
                             int totalSkills, List<String> topGaps, Integer estimatedMonths) {}

    private List<EmployeeSkill> approvedSkills() {
        return employeeSkillRepository.findByApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED);
    }

    public OrganizationSummary organizationSummary() {
        List<Employee> employees = employeeRepository.findAll();
        Map<Long, Employee> byId = employees.stream().collect(Collectors.toMap(Employee::getId, e -> e));
        List<Skill> skills = skillRepository.findByActive(true);
        List<EmployeeSkill> approved = approvedSkills();
        int pending = employeeSkillRepository.findByApprovalStatus(EmployeeSkill.ApprovalStatus.PENDING).size();

        Map<Long, Skill> skillById = skills.stream().collect(Collectors.toMap(Skill::getId, s -> s));

        List<CategoryStat> categories = new ArrayList<>();
        for (Skill.Category cat : Skill.Category.values()) {
            Set<Long> catSkillIds = skills.stream().filter(s -> s.getCategory() == cat)
                    .map(Skill::getId).collect(Collectors.toSet());
            List<EmployeeSkill> rows = approved.stream().filter(es -> catSkillIds.contains(es.getSkillId())).toList();
            categories.add(new CategoryStat(cat.name(), catSkillIds.size(),
                    (int) rows.stream().map(EmployeeSkill::getEmployeeId).distinct().count(),
                    round(rows.stream().mapToInt(EmployeeSkill::getProficiencyLevel).average().orElse(0))));
        }

        Map<String, List<Employee>> byDept = employees.stream()
                .collect(Collectors.groupingBy(e -> e.getDepartment() == null ? "Unassigned" : e.getDepartment()));
        List<DepartmentStat> departments = byDept.entrySet().stream().map(en -> {
            Set<Long> ids = en.getValue().stream().map(Employee::getId).collect(Collectors.toSet());
            List<EmployeeSkill> rows = approved.stream()
                    .filter(es -> ids.contains(es.getEmployeeId()) && skillById.containsKey(es.getSkillId())).toList();
            return new DepartmentStat(en.getKey(), en.getValue().size(), rows.size(),
                    round(rows.stream().mapToInt(EmployeeSkill::getProficiencyLevel).average().orElse(0)));
        }).sorted(Comparator.comparing(DepartmentStat::department)).toList();

        return new OrganizationSummary(byId.size(), skills.size(), approved.size(), pending, categories, departments);
    }

    /** Skills held (at cover level) by at most one person: single points of failure. */
    public List<BusFactorEntry> busFactor() {
        Map<Long, Employee> employees = employeeRepository.findAll().stream()
                .collect(Collectors.toMap(Employee::getId, e -> e));
        Map<Long, List<Long>> holdersBySkill = approvedSkills().stream()
                .filter(es -> es.getProficiencyLevel() >= COVER_LEVEL)
                .collect(Collectors.groupingBy(EmployeeSkill::getSkillId,
                        Collectors.mapping(EmployeeSkill::getEmployeeId, Collectors.toList())));
        Set<Long> demanded = activeRequirements().stream().map(RoleSkillRequirement::getSkillId)
                .collect(Collectors.toSet());

        return skillRepository.findByActive(true).stream()
                .map(s -> {
                    List<Long> holders = holdersBySkill.getOrDefault(s.getId(), List.of());
                    return new BusFactorEntry(s.getId(), s.getName(), s.getCategory().name(), holders.size(),
                            holders.stream().map(employees::get).filter(Objects::nonNull).map(Employee::getName).toList(),
                            demanded.contains(s.getId()));
                })
                .filter(e -> e.holders() <= 1)
                // demanded + uncovered first, then single-holder
                .sorted(Comparator.comparing(BusFactorEntry::requiredByActiveWork).reversed()
                        .thenComparingInt(BusFactorEntry::holders)
                        .thenComparing(BusFactorEntry::skillName))
                .toList();
    }

    /** For every skill demanded by active roles/projects: how many are asked for vs. qualified people. */
    public List<SupplyDemandEntry> supplyDemand() {
        List<RoleSkillRequirement> reqs = activeRequirements();
        Map<Long, Skill> skills = skillRepository.findAll().stream().collect(Collectors.toMap(Skill::getId, s -> s));
        Map<Long, List<EmployeeSkill>> bySkill = approvedSkills().stream()
                .collect(Collectors.groupingBy(EmployeeSkill::getSkillId));

        Map<Long, List<RoleSkillRequirement>> reqBySkill = reqs.stream()
                .collect(Collectors.groupingBy(RoleSkillRequirement::getSkillId));
        List<SupplyDemandEntry> out = new ArrayList<>();
        reqBySkill.forEach((skillId, list) -> {
            Skill s = skills.get(skillId);
            if (s == null) {
                return;
            }
            int minLevel = list.stream().mapToInt(RoleSkillRequirement::getRequiredLevel).min().orElse(1);
            int qualified = (int) bySkill.getOrDefault(skillId, List.of()).stream()
                    .filter(es -> es.getProficiencyLevel() >= minLevel).count();
            int demand = list.size();
            out.add(new SupplyDemandEntry(skillId, s.getName(), s.getCategory().name(), demand, qualified,
                    Math.max(0, demand - qualified)));
        });
        out.sort(Comparator.comparingInt(SupplyDemandEntry::shortfall).reversed()
                .thenComparing(SupplyDemandEntry::skillName));
        return out;
    }

    /** Rank employees for a role/project by match score, then by lowest current workload. */
    public List<StaffingSuggestion> staffingSuggestions(Long roleProjectId, int limit) {
        List<RoleSkillRequirement> reqs = requirementRepository.findByRoleProjectId(roleProjectId);
        Map<Long, Skill> skills = skillRepository.findAllById(
                reqs.stream().map(RoleSkillRequirement::getSkillId).collect(Collectors.toSet()))
                .stream().collect(Collectors.toMap(Skill::getId, s -> s));
        Map<Long, Map<Long, Integer>> levels = new HashMap<>();
        for (EmployeeSkill es : approvedSkills()) {
            levels.computeIfAbsent(es.getEmployeeId(), k -> new HashMap<>()).put(es.getSkillId(), es.getProficiencyLevel());
        }

        List<StaffingSuggestion> out = new ArrayList<>();
        for (Employee e : employeeRepository.findAll()) {
            if (e.getRole() == Employee.Role.HR_ADMIN) {
                continue;
            }
            Map<Long, Integer> mine = levels.getOrDefault(e.getId(), Map.of());
            int met = 0;
            List<String> missing = new ArrayList<>();
            for (RoleSkillRequirement r : reqs) {
                if (mine.getOrDefault(r.getSkillId(), 0) >= r.getRequiredLevel()) {
                    met++;
                } else if (skills.containsKey(r.getSkillId())) {
                    missing.add(skills.get(r.getSkillId()).getName());
                }
            }
            double score = reqs.isEmpty() ? 0 : round(met * 100.0 / reqs.size());
            int workload = assignmentRepository.findByEmployeeIdAndActiveTrue(e.getId()).size();
            out.add(new StaffingSuggestion(e.getId(), e.getName(), e.getDepartment(), e.getJobTitle(),
                    score, met, reqs.size(), workload, missing));
        }
        out.sort(Comparator.comparingDouble(StaffingSuggestion::matchScore).reversed()
                .thenComparingInt(StaffingSuggestion::activeAssignments));
        return out.stream().limit(Math.max(1, limit)).toList();
    }

    /** Gap to every active ROLE, closest first. Estimate assumes ~3 months per level to close. */
    public List<CareerPath> careerPaths(Long employeeId) {
        Map<Long, Integer> mine = employeeSkillRepository
                .findByEmployeeIdAndApprovalStatus(employeeId, EmployeeSkill.ApprovalStatus.APPROVED).stream()
                .collect(Collectors.toMap(EmployeeSkill::getSkillId, EmployeeSkill::getProficiencyLevel, Math::max));
        Map<Long, Skill> skills = skillRepository.findAll().stream().collect(Collectors.toMap(Skill::getId, s -> s));

        List<CareerPath> out = new ArrayList<>();
        for (RoleProject role : roleProjectRepository.findByTypeAndStatus(RoleProject.Type.ROLE, RoleProject.Status.ACTIVE)) {
            List<RoleSkillRequirement> reqs = requirementRepository.findByRoleProjectId(role.getId());
            if (reqs.isEmpty()) {
                continue;
            }
            int met = 0;
            int levelsToClose = 0;
            List<RoleSkillRequirement> gaps = new ArrayList<>();
            for (RoleSkillRequirement r : reqs) {
                int have = mine.getOrDefault(r.getSkillId(), 0);
                if (have >= r.getRequiredLevel()) {
                    met++;
                } else {
                    levelsToClose += r.getRequiredLevel() - have;
                    gaps.add(r);
                }
            }
            gaps.sort(Comparator.comparingInt(
                    (RoleSkillRequirement r) -> r.getRequiredLevel() - mine.getOrDefault(r.getSkillId(), 0)).reversed());
            out.add(new CareerPath(role.getId(), role.getName(), round(met * 100.0 / reqs.size()),
                    reqs.size() - met, reqs.size(),
                    gaps.stream().limit(3).map(r -> skills.get(r.getSkillId()))
                            .filter(Objects::nonNull).map(Skill::getName).toList(),
                    gaps.isEmpty() ? 0 : levelsToClose * 3));
        }
        out.sort(Comparator.comparingDouble(CareerPath::matchScore).reversed());
        return out;
    }

    private List<RoleSkillRequirement> activeRequirements() {
        Set<Long> activeIds = roleProjectRepository.findByStatus(RoleProject.Status.ACTIVE).stream()
                .map(RoleProject::getId).collect(Collectors.toSet());
        return requirementRepository.findAll().stream()
                .filter(r -> activeIds.contains(r.getRoleProjectId())).toList();
    }

    private static double round(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
