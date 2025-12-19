-- SkillBridge Database Schema for ER Diagram
-- Tool: SQLFlow (https://sqlflow.gudusoft.com)
-- Purpose: Generate detailed Entity-Relationship Diagram
-- Database: PostgreSQL
-- Created: 2025-12-18
-- Note: This reflects the ACTUAL database schema (after cleanup)

-- ============================================================================
-- TABLE 1: EMPLOYEES (Core table - Employee master data)
-- ============================================================================
CREATE TABLE employees (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR_ADMIN')),
    job_title VARCHAR(255),
    department VARCHAR(255),
    location VARCHAR(255),
    manager_id BIGINT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    
    -- Self-referencing foreign key (employee reports to manager)
    CONSTRAINT fk_employee_manager 
        FOREIGN KEY (manager_id) 
        REFERENCES employees(id) 
        ON DELETE SET NULL
);

COMMENT ON TABLE employees IS 'Employee master data - stores all employee information';
COMMENT ON COLUMN employees.id IS 'Unique employee identifier';
COMMENT ON COLUMN employees.email IS 'Login email (unique)';
COMMENT ON COLUMN employees.password IS 'Hashed password (BCrypt)';
COMMENT ON COLUMN employees.role IS 'System role: EMPLOYEE, MANAGER, or HR_ADMIN';
COMMENT ON COLUMN employees.job_title IS 'Actual job title (e.g., Senior Developer)';
COMMENT ON COLUMN employees.manager_id IS 'References manager (self-referencing FK)';

-- ============================================================================
-- TABLE 2: SKILLS (Skill catalog)
-- ============================================================================
CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(255) NOT NULL CHECK (category IN (
        'LANGUAGE', 'FRAMEWORK', 'CLOUD', 'DATABASE', 
        'SOFT_SKILL', 'OTHER'
    )),
    description VARCHAR(1000),
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

COMMENT ON TABLE skills IS 'Skill catalog - all available skills in organization';
COMMENT ON COLUMN skills.name IS 'Skill name (unique, e.g., Java, React)';
COMMENT ON COLUMN skills.category IS 'Skill category for organization';
COMMENT ON COLUMN skills.active IS 'Is skill active? (soft delete flag)';

-- ============================================================================
-- TABLE 3: EMPLOYEE_SKILLS (Employee-Skill mapping with approval workflow)
-- ============================================================================
CREATE TABLE employee_skills (
    id BIGSERIAL PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    proficiency_level INTEGER NOT NULL,
    years_experience DOUBLE PRECISION,
    interest_level INTEGER NOT NULL,
    last_used_date DATE,
    approval_status VARCHAR(20) NOT NULL DEFAULT 'APPROVED',
    source VARCHAR(255) NOT NULL CHECK (source IN ('SELF_REPORTED', 'MANAGER_VALIDATED', 'CERTIFICATION')),
    approved_by BIGINT,
    approved_at TIMESTAMP,
    rejection_reason VARCHAR(255),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_employee_skill_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_employee_skill_skill 
        FOREIGN KEY (skill_id) 
        REFERENCES skills(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_employee_skill_approver 
        FOREIGN KEY (approved_by) 
        REFERENCES employees(id) 
        ON DELETE SET NULL,
    
    -- Unique constraint: one employee can't have same skill twice
    CONSTRAINT uk_employee_skill 
        UNIQUE (employee_id, skill_id)
);

COMMENT ON TABLE employee_skills IS 'Employee skills with approval workflow';
COMMENT ON COLUMN employee_skills.proficiency_level IS 'Skill proficiency level (1-5)';
COMMENT ON COLUMN employee_skills.interest_level IS 'Interest level in this skill';
COMMENT ON COLUMN employee_skills.approval_status IS 'Approval status (default: APPROVED)';
COMMENT ON COLUMN employee_skills.approved_by IS 'Manager who approved/rejected';
COMMENT ON COLUMN employee_skills.rejection_reason IS 'Why skill was rejected (if applicable)';

-- ============================================================================
-- TABLE 4: PROJECTS (Project master data)
-- ============================================================================
CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(255) NOT NULL CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED', 'ON_HOLD', 'CANCELLED')),
    start_date DATE,
    expected_start_date DATE,
    end_date DATE,
    owner_id BIGINT NOT NULL,
    active BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL
);

COMMENT ON TABLE projects IS 'Project master data - all projects';
COMMENT ON COLUMN projects.status IS 'Project lifecycle status';
COMMENT ON COLUMN projects.owner_id IS 'Project owner/manager';
COMMENT ON COLUMN projects.expected_start_date IS 'For UPCOMING projects';
COMMENT ON COLUMN projects.start_date IS 'Actual start date (for ONGOING/COMPLETED)';

-- ============================================================================
-- TABLE 5: PROJECT_TECH_STACK (Project technologies)
-- ============================================================================
CREATE TABLE project_tech_stack (
    project_id BIGINT NOT NULL,
    technology VARCHAR(255),
    
    -- Foreign key
    CONSTRAINT fk_tech_stack_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE project_tech_stack IS 'Technologies required for each project';
COMMENT ON COLUMN project_tech_stack.technology IS 'Technology name (e.g., Java, React)';

-- ============================================================================
-- TABLE 6: PROJECT_ASSIGNMENTS (Employee-Project assignments)
-- ============================================================================
CREATE TABLE project_assignments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL,
    employee_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    allocation_type VARCHAR(255) NOT NULL CHECK (allocation_type IN ('BILLABLE', 'NON_BILLABLE', 'INVESTMENT')),
    active BOOLEAN NOT NULL,
    assigned_at TIMESTAMP NOT NULL,
    
    -- Foreign keys
    CONSTRAINT fk_assignment_project 
        FOREIGN KEY (project_id) 
        REFERENCES projects(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_assignment_employee 
        FOREIGN KEY (employee_id) 
        REFERENCES employees(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE project_assignments IS 'Employee-Project assignments with allocation tracking';
COMMENT ON COLUMN project_assignments.allocation_type IS 'BILLABLE=Client work, NON_BILLABLE=Internal, INVESTMENT=Training/R&D';
COMMENT ON COLUMN project_assignments.active IS 'Is assignment active? (soft delete for unassign)';
COMMENT ON COLUMN project_assignments.end_date IS 'Set when employee is unassigned';

-- ============================================================================
-- TABLE 7: LEARNING_RESOURCES (Learning materials)
-- ============================================================================
CREATE TABLE learning_resources (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description VARCHAR(2000),
    url VARCHAR(2000) NOT NULL,
    skill_id BIGINT NOT NULL,
    level VARCHAR(255) NOT NULL CHECK (level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    type VARCHAR(255) NOT NULL CHECK (type IN ('INTERNAL', 'EXTERNAL')),
    estimated_duration INTEGER,
    is_free BOOLEAN NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    
    -- Foreign key
    CONSTRAINT fk_resource_skill 
        FOREIGN KEY (skill_id) 
        REFERENCES skills(id) 
        ON DELETE CASCADE
);

COMMENT ON TABLE learning_resources IS 'Learning materials and courses';
COMMENT ON COLUMN learning_resources.skill_id IS 'Which skill this resource teaches';
COMMENT ON COLUMN learning_resources.level IS 'Difficulty level';
COMMENT ON COLUMN learning_resources.type IS 'INTERNAL (company) or EXTERNAL (public)';
COMMENT ON COLUMN learning_resources.is_free IS 'Is the resource free?';

-- ============================================================================
-- TABLE 8: USERS (Authentication table - separate from employees)
-- ============================================================================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL CHECK (role IN ('HR_ADMIN', 'MANAGER', 'EMPLOYEE')),
    enabled BOOLEAN NOT NULL,
    active_jti VARCHAR(255)
);

COMMENT ON TABLE users IS 'User authentication table (separate from employees)';
COMMENT ON COLUMN users.username IS 'Login username (unique)';
COMMENT ON COLUMN users.password IS 'Hashed password';
COMMENT ON COLUMN users.role IS 'User role for authentication';
COMMENT ON COLUMN users.enabled IS 'Is user account enabled?';
COMMENT ON COLUMN users.active_jti IS 'Active JWT token identifier';

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Employees
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_role ON employees(role);
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_manager ON employees(manager_id);

-- Skills
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_active ON skills(active);

-- Employee Skills
CREATE INDEX idx_employee_skills_employee ON employee_skills(employee_id);
CREATE INDEX idx_employee_skills_skill ON employee_skills(skill_id);
CREATE INDEX idx_employee_skills_status ON employee_skills(approval_status);
CREATE INDEX idx_employee_skills_approver ON employee_skills(approved_by);

-- Projects
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_active ON projects(active);

-- Project Tech Stack
CREATE INDEX idx_tech_stack_project ON project_tech_stack(project_id);

-- Project Assignments
CREATE INDEX idx_assignments_project ON project_assignments(project_id);
CREATE INDEX idx_assignments_employee ON project_assignments(employee_id);
CREATE INDEX idx_assignments_active ON project_assignments(active);
CREATE INDEX idx_assignments_allocation ON project_assignments(allocation_type);

-- Learning Resources
CREATE INDEX idx_resources_skill ON learning_resources(skill_id);
CREATE INDEX idx_resources_level ON learning_resources(level);
CREATE INDEX idx_resources_type ON learning_resources(type);

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

/*
RELATIONSHIP SUMMARY (ACTUAL DATABASE):
========================================

1. employees → employees (manager_id)
   - Self-referencing: Employee reports to Manager
   - 1:N relationship

2. employees → employee_skills
   - One employee has many skills
   - 1:N relationship

3. skills → employee_skills
   - One skill can be possessed by many employees
   - 1:N relationship

4. employees → employee_skills (approved_by)
   - One manager approves many skills
   - 1:N relationship

5. projects → project_tech_stack
   - One project has many technologies
   - 1:N relationship

6. projects → project_assignments
   - One project has many employee assignments
   - 1:N relationship

7. employees → project_assignments
   - One employee can be assigned to many projects
   - 1:N relationship

8. skills → learning_resources
   - One skill has many learning resources
   - 1:N relationship

9. users (separate authentication table)
   - No direct FK relationships (separate auth system)

TOTAL TABLES: 8
==============
1. employees (core employee data)
2. skills (skill catalog)
3. employee_skills (employee-skill mapping with approval)
4. projects (project master data)
5. project_tech_stack (project technologies)
6. project_assignments (employee-project assignments with allocation type)
7. learning_resources (learning materials)
8. users (authentication - separate from employees)

KEY FEATURES:
=============
- Skill approval workflow (approval_status, approved_by, rejection_reason)
- Project allocation types (BILLABLE, NON_BILLABLE, INVESTMENT)
- Manager hierarchy (self-referencing employees table)
- Soft deletes (active flags)
- Tech stack tracking (project_tech_stack)
- Learning resources linked to skills
*/
