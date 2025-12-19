package com.skillbridge.config;

import com.skillbridge.entity.*;
import com.skillbridge.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

/**
 * Data loader to seed initial data for development and testing
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataLoader implements CommandLineRunner {

        private final EmployeeRepository employeeRepository;
        private final SkillRepository skillRepository;
        private final EmployeeSkillRepository employeeSkillRepository;
        private final RoleProjectRepository roleProjectRepository;
        private final RoleSkillRequirementRepository roleSkillRequirementRepository;
        private final LearningResourceRepository learningResourceRepository;
        private final PasswordEncoder passwordEncoder;

        @Override
        public void run(String... args) {
                // Only load data if database is empty
                if (employeeRepository.count() > 0) {
                        log.info("Database already contains data. Skipping data loading.");
                        return;
                }

                log.info("Loading seed data...");

                // Create employees
                List<Employee> employees = createEmployees();

                // Create skills
                List<Skill> skills = createSkills();

                // Create employee skills
                createEmployeeSkills(employees, skills);

                // Create roles and projects
                List<RoleProject> roleProjects = createRoleProjects(employees);

                // Create role skill requirements
                createRoleSkillRequirements(roleProjects, skills);

                // Create learning resources
                createLearningResources(skills);

                log.info("Seed data loaded successfully!");
        }

        private List<Employee> createEmployees() {
                Employee admin = new Employee();
                admin.setName("Admin User");
                admin.setEmail("admin@skillbridge.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Employee.Role.HR_ADMIN);
                admin.setJobTitle("HR Director");
                admin.setDepartment("Human Resources");
                admin.setLocation("New York");

                Employee manager1 = new Employee();
                manager1.setName("Alice Manager");
                manager1.setEmail("manager@skillbridge.com");
                manager1.setPassword(passwordEncoder.encode("manager123"));
                manager1.setRole(Employee.Role.MANAGER);
                manager1.setJobTitle("Engineering Manager");
                manager1.setDepartment("Engineering");
                manager1.setLocation("San Francisco");

                Employee employee1 = new Employee();
                employee1.setName("John Doe");
                employee1.setEmail("employee@skillbridge.com");
                employee1.setPassword(passwordEncoder.encode("employee123"));
                employee1.setRole(Employee.Role.EMPLOYEE);
                employee1.setJobTitle("Software Engineer");
                employee1.setDepartment("Engineering");
                employee1.setLocation("San Francisco");

                Employee employee2 = new Employee();
                employee2.setName("Jane Smith");
                employee2.setEmail("jane@skillbridge.com");
                employee2.setPassword(passwordEncoder.encode("employee123"));
                employee2.setRole(Employee.Role.EMPLOYEE);
                employee2.setJobTitle("Junior Developer");
                employee2.setDepartment("Engineering");
                employee2.setLocation("San Francisco");

                List<Employee> employees = employeeRepository
                                .saveAll(Arrays.asList(admin, manager1, employee1, employee2));

                // Set manager relationships
                manager1.setManagerId(admin.getId()); // Manager reports to HR
                employee1.setManagerId(manager1.getId());
                employee2.setManagerId(manager1.getId());
                employeeRepository.saveAll(Arrays.asList(manager1, employee1, employee2));

                log.info("Created {} employees", employees.size());
                return employees;
        }

        private List<Skill> createSkills() {
                List<Skill> skills = Arrays.asList(
                                createSkill("Java", Skill.Category.LANGUAGE, "Java programming language"),
                                createSkill("Python", Skill.Category.LANGUAGE, "Python programming language"),
                                createSkill("JavaScript", Skill.Category.LANGUAGE, "JavaScript programming language"),
                                createSkill("TypeScript", Skill.Category.LANGUAGE, "TypeScript programming language"),
                                createSkill("Spring Boot", Skill.Category.FRAMEWORK, "Spring Boot framework for Java"),
                                createSkill("React", Skill.Category.FRAMEWORK, "React JavaScript library"),
                                createSkill("Angular", Skill.Category.FRAMEWORK, "Angular framework"),
                                createSkill("Node.js", Skill.Category.FRAMEWORK, "Node.js runtime"),
                                createSkill("AWS", Skill.Category.CLOUD, "Amazon Web Services"),
                                createSkill("Azure", Skill.Category.CLOUD, "Microsoft Azure"),
                                createSkill("Docker", Skill.Category.CLOUD, "Docker containerization"),
                                createSkill("Kubernetes", Skill.Category.CLOUD, "Kubernetes orchestration"),
                                createSkill("PostgreSQL", Skill.Category.DATABASE, "PostgreSQL database"),
                                createSkill("MongoDB", Skill.Category.DATABASE, "MongoDB NoSQL database"),
                                createSkill("MySQL", Skill.Category.DATABASE, "MySQL database"),
                                createSkill("Communication", Skill.Category.SOFT_SKILL, "Effective communication"),
                                createSkill("Leadership", Skill.Category.SOFT_SKILL, "Team leadership"),
                                createSkill("Problem Solving", Skill.Category.SOFT_SKILL,
                                                "Analytical problem solving"));

                List<Skill> savedSkills = skillRepository.saveAll(skills);
                log.info("Created {} skills", savedSkills.size());
                return savedSkills;
        }

        private Skill createSkill(String name, Skill.Category category, String description) {
                Skill skill = new Skill();
                skill.setName(name);
                skill.setCategory(category);
                skill.setDescription(description);
                skill.setActive(true);
                return skill;
        }

        private void createEmployeeSkills(List<Employee> employees, List<Skill> skills) {
                // John Doe's skills (employee@skillbridge.com)
                Employee john = employees.get(2);
                createEmployeeSkill(john.getId(), findSkillByName(skills, "Java").getId(), 3, 3, 5.0);
                createEmployeeSkill(john.getId(), findSkillByName(skills, "Spring Boot").getId(), 3, 3, 4.0);
                createEmployeeSkill(john.getId(), findSkillByName(skills, "PostgreSQL").getId(), 2, 2, 3.0);
                createEmployeeSkill(john.getId(), findSkillByName(skills, "Docker").getId(), 2, 3, 2.0);
                createEmployeeSkill(john.getId(), findSkillByName(skills, "React").getId(), 1, 2, 0.5);

                // Jane Smith's skills (jane@skillbridge.com)
                Employee jane = employees.get(3);
                createEmployeeSkill(jane.getId(), findSkillByName(skills, "JavaScript").getId(), 2, 3, 2.0);
                createEmployeeSkill(jane.getId(), findSkillByName(skills, "React").getId(), 2, 3, 1.5);
                createEmployeeSkill(jane.getId(), findSkillByName(skills, "Node.js").getId(), 2, 2, 1.0);
                createEmployeeSkill(jane.getId(), findSkillByName(skills, "MongoDB").getId(), 1, 2, 0.5);

                log.info("Created employee skills");
        }

        private void createEmployeeSkill(Long employeeId, Long skillId, int proficiency, int interest, double years) {
                EmployeeSkill es = new EmployeeSkill();
                es.setEmployeeId(employeeId);
                es.setSkillId(skillId);
                es.setProficiencyLevel(proficiency);
                es.setInterestLevel(interest);
                es.setYearsExperience(years);
                es.setLastUsedDate(LocalDate.now());
                es.setSource(EmployeeSkill.Source.SELF_REPORTED);
                es.setApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED); // Seed data is pre-approved
                employeeSkillRepository.save(es);
        }

        private List<RoleProject> createRoleProjects(List<Employee> employees) {
                Employee manager = employees.get(1);

                RoleProject backendRole = new RoleProject();
                backendRole.setName("Backend Engineer L2");
                backendRole.setType(RoleProject.Type.ROLE);
                backendRole.setDescription("Mid-level backend engineer position");
                backendRole.setOwnerId(manager.getId());
                backendRole.setStatus(RoleProject.Status.ACTIVE);

                RoleProject frontendRole = new RoleProject();
                frontendRole.setName("Frontend Engineer L1");
                frontendRole.setType(RoleProject.Type.ROLE);
                frontendRole.setDescription("Entry-level frontend engineer position");
                frontendRole.setOwnerId(manager.getId());
                frontendRole.setStatus(RoleProject.Status.ACTIVE);

                RoleProject cloudProject = new RoleProject();
                cloudProject.setName("Cloud Migration Project");
                cloudProject.setType(RoleProject.Type.PROJECT);
                cloudProject.setDescription("Migrate legacy systems to AWS cloud");
                cloudProject.setOwnerId(manager.getId());
                cloudProject.setStatus(RoleProject.Status.ACTIVE);

                List<RoleProject> roleProjects = roleProjectRepository.saveAll(
                                Arrays.asList(backendRole, frontendRole, cloudProject));
                log.info("Created {} roles/projects", roleProjects.size());
                return roleProjects;
        }

        private void createRoleSkillRequirements(List<RoleProject> roleProjects, List<Skill> skills) {
                // Backend Engineer L2 requirements
                RoleProject backendRole = roleProjects.get(0);
                createRequirement(backendRole.getId(), findSkillByName(skills, "Java").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(backendRole.getId(), findSkillByName(skills, "Spring Boot").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(backendRole.getId(), findSkillByName(skills, "PostgreSQL").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(backendRole.getId(), findSkillByName(skills, "Docker").getId(), 2,
                                RoleSkillRequirement.Importance.NICE_TO_HAVE);
                createRequirement(backendRole.getId(), findSkillByName(skills, "AWS").getId(), 1,
                                RoleSkillRequirement.Importance.NICE_TO_HAVE);

                // Frontend Engineer L1 requirements
                RoleProject frontendRole = roleProjects.get(1);
                createRequirement(frontendRole.getId(), findSkillByName(skills, "JavaScript").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(frontendRole.getId(), findSkillByName(skills, "React").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(frontendRole.getId(), findSkillByName(skills, "TypeScript").getId(), 1,
                                RoleSkillRequirement.Importance.NICE_TO_HAVE);

                // Cloud Migration Project requirements
                RoleProject cloudProject = roleProjects.get(2);
                createRequirement(cloudProject.getId(), findSkillByName(skills, "AWS").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(cloudProject.getId(), findSkillByName(skills, "Docker").getId(), 2,
                                RoleSkillRequirement.Importance.MUST_HAVE);
                createRequirement(cloudProject.getId(), findSkillByName(skills, "Kubernetes").getId(), 2,
                                RoleSkillRequirement.Importance.NICE_TO_HAVE);

                log.info("Created role skill requirements");
        }

        private void createRequirement(Long roleProjectId, Long skillId, int level,
                        RoleSkillRequirement.Importance importance) {
                RoleSkillRequirement req = new RoleSkillRequirement();
                req.setRoleProjectId(roleProjectId);
                req.setSkillId(skillId);
                req.setRequiredLevel(level);
                req.setImportance(importance);
                roleSkillRequirementRepository.save(req);
        }

        private void createLearningResources(List<Skill> skills) {
                createResource("Java Fundamentals", "https://docs.oracle.com/javase/tutorial/",
                                LearningResource.Type.EXTERNAL, findSkillByName(skills, "Java").getId(),
                                LearningResource.Level.BEGINNER, 480, true);

                createResource("Spring Boot Masterclass", "https://spring.io/guides",
                                LearningResource.Type.EXTERNAL, findSkillByName(skills, "Spring Boot").getId(),
                                LearningResource.Level.INTERMEDIATE, 600, true);

                createResource("React Official Tutorial", "https://react.dev/learn",
                                LearningResource.Type.EXTERNAL, findSkillByName(skills, "React").getId(),
                                LearningResource.Level.BEGINNER, 300, true);

                createResource("AWS Cloud Practitioner", "https://aws.amazon.com/training/",
                                LearningResource.Type.EXTERNAL, findSkillByName(skills, "AWS").getId(),
                                LearningResource.Level.BEGINNER, 720, false);

                createResource("Docker Deep Dive", "https://docs.docker.com/get-started/",
                                LearningResource.Type.EXTERNAL, findSkillByName(skills, "Docker").getId(),
                                LearningResource.Level.INTERMEDIATE, 360, true);

                log.info("Created learning resources");
        }

        private void createResource(String title, String url, LearningResource.Type type,
                        Long skillId, LearningResource.Level level, int duration, boolean isFree) {
                LearningResource resource = new LearningResource();
                resource.setTitle(title);
                resource.setUrl(url);
                resource.setType(type);
                resource.setSkillId(skillId);
                resource.setLevel(level);
                resource.setEstimatedDuration(duration);
                resource.setIsFree(isFree);
                resource.setDescription("Learn " + title);
                learningResourceRepository.save(resource);
        }

        private Skill findSkillByName(List<Skill> skills, String name) {
                return skills.stream()
                                .filter(s -> s.getName().equals(name))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Skill not found: " + name));
        }
}
