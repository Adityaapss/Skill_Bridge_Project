package com.skillbridge.service;

import com.skillbridge.entity.Employee;
import com.skillbridge.entity.EmployeeSkill;
import com.skillbridge.entity.Skill;
import com.skillbridge.repository.EmployeeRepository;
import com.skillbridge.repository.EmployeeSkillRepository;
import com.skillbridge.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/** CSV export of the skill matrix and bulk import of employees. */
@Service
@RequiredArgsConstructor
public class CsvService {

    public record ImportResult(int created, int skipped, List<String> errors) {}

    private final EmployeeRepository employeeRepository;
    private final SkillRepository skillRepository;
    private final EmployeeSkillRepository employeeSkillRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public String exportSkillMatrix() {
        List<Skill> skills = skillRepository.findByActive(true).stream()
                .sorted(Comparator.comparing(Skill::getName)).toList();
        Map<Long, Map<Long, Integer>> levels = new HashMap<>();
        for (EmployeeSkill es : employeeSkillRepository.findByApprovalStatus(EmployeeSkill.ApprovalStatus.APPROVED)) {
            levels.computeIfAbsent(es.getEmployeeId(), k -> new HashMap<>()).put(es.getSkillId(), es.getProficiencyLevel());
        }
        StringBuilder sb = new StringBuilder("Name,Email,Department,Job Title");
        skills.forEach(s -> sb.append(',').append(escape(s.getName())));
        sb.append('\n');
        for (Employee e : employeeRepository.findAll()) {
            sb.append(escape(e.getName())).append(',').append(escape(e.getEmail())).append(',')
                    .append(escape(e.getDepartment())).append(',').append(escape(e.getJobTitle()));
            Map<Long, Integer> mine = levels.getOrDefault(e.getId(), Map.of());
            for (Skill s : skills) {
                sb.append(',').append(mine.getOrDefault(s.getId(), 0));
            }
            sb.append('\n');
        }
        return sb.toString();
    }

    /**
     * Columns: name,email,role,jobTitle,department,managerEmail,password
     * (header row required; role defaults to EMPLOYEE; password must be 8+ characters).
     */
    @Transactional
    public ImportResult importEmployees(String csv) {
        List<List<String>> rows = parse(csv);
        List<String> errors = new ArrayList<>();
        int created = 0;
        int skipped = 0;
        if (rows.isEmpty()) {
            return new ImportResult(0, 0, List.of("File is empty"));
        }
        List<String> header = rows.get(0).stream().map(h -> h.trim().toLowerCase()).toList();
        for (String required : List.of("name", "email", "password")) {
            if (!header.contains(required)) {
                return new ImportResult(0, 0, List.of("Missing required column: " + required));
            }
        }
        for (int i = 1; i < rows.size(); i++) {
            List<String> r = rows.get(i);
            if (r.stream().allMatch(String::isBlank)) {
                continue;
            }
            Function3 get = (col) -> {
                int idx = header.indexOf(col);
                return idx >= 0 && idx < r.size() ? r.get(idx).trim() : "";
            };
            String email = get.apply("email");
            String name = get.apply("name");
            String password = get.apply("password");
            int line = i + 1;
            if (name.isEmpty() || email.isEmpty() || !email.contains("@")) {
                errors.add("Line " + line + ": name and a valid email are required");
                skipped++;
                continue;
            }
            if (password.length() < 8) {
                errors.add("Line " + line + ": password must be at least 8 characters");
                skipped++;
                continue;
            }
            if (employeeRepository.existsByEmail(email)) {
                errors.add("Line " + line + ": " + email + " already exists");
                skipped++;
                continue;
            }
            Employee.Role role;
            try {
                String roleText = get.apply("role");
                role = roleText.isEmpty() ? Employee.Role.EMPLOYEE : Employee.Role.valueOf(roleText.toUpperCase());
            } catch (IllegalArgumentException ex) {
                errors.add("Line " + line + ": unknown role '" + get.apply("role") + "'");
                skipped++;
                continue;
            }
            Employee e = new Employee();
            e.setName(name);
            e.setEmail(email);
            e.setRole(role);
            e.setJobTitle(emptyToNull(get.apply("jobtitle")));
            e.setDepartment(emptyToNull(get.apply("department")));
            String managerEmail = get.apply("manageremail");
            if (!managerEmail.isEmpty()) {
                Optional<Employee> manager = employeeRepository.findByEmail(managerEmail);
                if (manager.isEmpty()) {
                    errors.add("Line " + line + ": manager " + managerEmail + " not found");
                    skipped++;
                    continue;
                }
                e.setManagerId(manager.get().getId());
            }
            e.setPassword(passwordEncoder.encode(password));
            employeeRepository.save(e);
            created++;
        }
        return new ImportResult(created, skipped, errors);
    }

    @FunctionalInterface
    private interface Function3 {
        String apply(String column);
    }

    private static String emptyToNull(String s) {
        return s == null || s.isEmpty() ? null : s;
    }

    /** Escapes a value and neutralises spreadsheet formula injection (=, +, -, @ prefixes). */
    static String escape(String v) {
        if (v == null) {
            return "";
        }
        String out = v;
        if (!out.isEmpty() && "=+-@".indexOf(out.charAt(0)) >= 0) {
            out = "'" + out;
        }
        if (out.contains(",") || out.contains("\"") || out.contains("\n")) {
            out = "\"" + out.replace("\"", "\"\"") + "\"";
        }
        return out;
    }

    /** Minimal RFC-4180 parser (quoted fields, escaped quotes, CRLF). */
    static List<List<String>> parse(String csv) {
        List<List<String>> rows = new ArrayList<>();
        List<String> row = new ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean quoted = false;
        String text = csv.startsWith("﻿") ? csv.substring(1) : csv;
        for (int i = 0; i < text.length(); i++) {
            char c = text.charAt(i);
            if (quoted) {
                if (c == '"' && i + 1 < text.length() && text.charAt(i + 1) == '"') {
                    cur.append('"');
                    i++;
                } else if (c == '"') {
                    quoted = false;
                } else {
                    cur.append(c);
                }
            } else if (c == '"') {
                quoted = true;
            } else if (c == ',') {
                row.add(cur.toString());
                cur.setLength(0);
            } else if (c == '\n' || c == '\r') {
                if (c == '\r' && i + 1 < text.length() && text.charAt(i + 1) == '\n') {
                    i++;
                }
                row.add(cur.toString());
                cur.setLength(0);
                rows.add(row);
                row = new ArrayList<>();
            } else {
                cur.append(c);
            }
        }
        if (cur.length() > 0 || !row.isEmpty()) {
            row.add(cur.toString());
            rows.add(row);
        }
        return rows;
    }
}
