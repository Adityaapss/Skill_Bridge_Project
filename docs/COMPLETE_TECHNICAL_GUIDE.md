# SkillBridge - Complete Technical Documentation

**Purpose**: Complete technical reference for SkillBridge application  
**Audience**: Managers, Developers, Stakeholders  
**Last Updated**: 2025-12-18

---

## 📋 Table of Contents

### Part 1: Backend (See MANAGER_GUIDE.md)
- ✅ What Does the Backend Do?
- ✅ How is the Code Organized?
- ✅ 3-Layer Architecture Explained

### Part 2: Database & Data Flow (This Document)
- Database Design
- Entity Relationships
- Data Flow Examples

### Part 3: Frontend Architecture
- React Application Structure
- Component Organization
- State Management

### Part 4: Key Features
- Skill Management Workflow
- Project Allocation System
- Gap Analysis Engine
- Learning Recommendations

### Part 5: Security & APIs
- JWT Authentication
- Role-Based Access Control
- API Endpoints Reference

### Part 6: Deployment
- Running Locally
- Production Deployment
- Environment Configuration

---

## 3. DATABASE DESIGN

### 3.1 Database Overview

**Database**: PostgreSQL  
**Total Tables**: 8  
**Relationships**: Foreign keys with referential integrity  
**Features**: Auto-timestamps, soft deletes, approval workflows

### 3.2 All Database Tables

```
┌─────────────────────────────────────────────────────────┐
│                    CORE TABLES                          │
├─────────────────────────────────────────────────────────┤
│ 1. employees          - Employee master data            │
│ 2. skills             - Skill catalog                   │
│ 3. employee_skills    - Employee-Skill mapping          │
│ 4. projects           - Project master data             │
│ 5. project_assignments - Employee-Project assignments   │
│ 6. role_projects      - Roles for gap analysis          │
│ 7. role_project_requirements - Required skills          │
│ 8. learning_resources - Learning materials              │
└─────────────────────────────────────────────────────────┘
```

### 3.3 Table Details

#### Table 1: `employees`
**Purpose**: Store employee information

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique employee ID |
| name | VARCHAR(255) | Full name |
| email | VARCHAR(255) UNIQUE | Email (used for login) |
| password | VARCHAR(255) | Hashed password (BCrypt) |
| role | VARCHAR(50) | EMPLOYEE, MANAGER, HR_ADMIN |
| job_title | VARCHAR(255) | Actual job title (e.g., "Senior Developer") |
| department | VARCHAR(255) | Department name |
| location | VARCHAR(255) | Office location |
| manager_id | BIGINT (FK) | References employees(id) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Key Points**:
- Email is unique (used for login)
- Password is hashed (never stored in plain text)
- Self-referencing FK (manager_id → employees.id)
- Role determines access permissions

---

#### Table 2: `skills`
**Purpose**: Catalog of all skills in the organization

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique skill ID |
| name | VARCHAR(255) UNIQUE | Skill name (e.g., "Java", "React") |
| category | VARCHAR(100) | PROGRAMMING, DATABASE, CLOUD, etc. |
| description | TEXT | Detailed description |
| active | BOOLEAN | Is skill active? (soft delete) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Key Points**:
- Name is unique (can't have duplicate skills)
- Category helps organize skills
- Active flag for soft delete (don't show inactive skills)

---

#### Table 3: `employee_skills`
**Purpose**: Track which employees have which skills (with approval workflow)

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique record ID |
| employee_id | BIGINT (FK) | References employees(id) |
| skill_id | BIGINT (FK) | References skills(id) |
| proficiency_level | INT | 1-5 (1=Beginner, 5=Expert) |
| years_experience | DECIMAL | Years of experience |
| approval_status | VARCHAR(50) | PENDING, APPROVED, REJECTED |
| source | VARCHAR(50) | SELF_REPORTED, MANAGER_ASSIGNED, etc. |
| approved_by | BIGINT (FK) | References employees(id) (manager) |
| approved_at | TIMESTAMP | When approved |
| rejection_reason | TEXT | Why rejected (if applicable) |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Key Points**:
- **Approval workflow**: New skills start as PENDING
- Manager must approve before skill is official
- Tracks who approved and when
- Rejection reason helps employee understand why

**Business Rule**: Employees can only add skills; managers approve/reject

---

#### Table 4: `projects`
**Purpose**: Store project information

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique project ID |
| name | VARCHAR(255) | Project name |
| description | TEXT | Project description |
| tech_stack | TEXT | Required technologies (comma-separated) |
| status | VARCHAR(50) | UPCOMING, ONGOING, COMPLETED |
| start_date | DATE | Actual start date |
| expected_start_date | DATE | Expected start date (for upcoming) |
| end_date | DATE | Completion date |
| owner_id | BIGINT (FK) | References employees(id) (project owner) |
| active | BOOLEAN | Is project active? |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

**Key Points**:
- Status tracks project lifecycle
- Tech stack helps with gap analysis
- Owner is responsible for project

---

#### Table 5: `project_assignments`
**Purpose**: Track which employees are assigned to which projects

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique assignment ID |
| project_id | BIGINT (FK) | References projects(id) |
| employee_id | BIGINT (FK) | References employees(id) |
| start_date | DATE | Assignment start date |
| end_date | DATE | Assignment end date (if unassigned) |
| allocation_type | VARCHAR(50) | BILLABLE, NON_BILLABLE, INVESTMENT |
| active | BOOLEAN | Is assignment active? |
| assigned_at | TIMESTAMP | When assigned |

**Key Points**:
- **Allocation type** tracks billable vs non-billable work
- Active flag for soft delete (unassign without deleting)
- One employee can be on multiple projects

**Allocation Types**:
- **BILLABLE**: Client work (revenue generating)
- **NON_BILLABLE**: Internal work
- **INVESTMENT**: Training, R&D, learning

---

#### Table 6: `role_projects`
**Purpose**: Define roles/projects for gap analysis

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique role/project ID |
| name | VARCHAR(255) | Role or project name |
| type | VARCHAR(50) | ROLE or PROJECT |
| description | TEXT | Description |
| active | BOOLEAN | Is active? |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

#### Table 7: `role_project_requirements`
**Purpose**: Define required skills for roles/projects

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique requirement ID |
| role_project_id | BIGINT (FK) | References role_projects(id) |
| skill_id | BIGINT (FK) | References skills(id) |
| required_proficiency | INT | Required proficiency level (1-5) |

**Key Points**:
- Links roles/projects to required skills
- Proficiency level sets the bar
- Used for gap analysis calculations

---

#### Table 8: `learning_resources`
**Purpose**: Store learning materials and courses

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT (PK) | Unique resource ID |
| title | VARCHAR(255) | Resource title |
| description | TEXT | Description |
| url | VARCHAR(500) | External link |
| skill_id | BIGINT (FK) | References skills(id) |
| level | VARCHAR(50) | BEGINNER, INTERMEDIATE, ADVANCED |
| type | VARCHAR(50) | COURSE, TUTORIAL, DOCUMENTATION, etc. |
| estimated_duration | VARCHAR(100) | e.g., "4 hours", "2 weeks" |
| is_free | BOOLEAN | Is it free? |
| created_at | TIMESTAMP | Auto-generated |
| updated_at | TIMESTAMP | Auto-updated |

---

### 3.4 Entity Relationship Diagram (ERD)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  employees  │────────▶│employee_    │◀────────│   skills    │
│             │ 1     * │skills       │ *     1 │             │
│ - id        │         │             │         │ - id        │
│ - name      │         │- employee_id│         │ - name      │
│ - email     │         │- skill_id   │         │ - category  │
│ - role      │         │- proficiency│         │             │
│ - manager_id│         │- approval   │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
      │                                                │
      │ 1                                            1 │
      │                                                │
      │ *                                            * │
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  project_   │────────▶│  projects   │◀────────│role_project_│
│assignments  │ *     1 │             │ 1     * │requirements │
│             │         │ - id        │         │             │
│- project_id │         │ - name      │         │- skill_id   │
│- employee_id│         │ - status    │         │- required_  │
│- allocation │         │             │         │  proficiency│
└─────────────┘         └─────────────┘         └─────────────┘
                                                       │
                                                       │ *
                                                       │
                                                       │ 1
                                                ┌─────────────┐
                                                │role_projects│
                                                │             │
                                                │ - id        │
                                                │ - name      │
                                                │ - type      │
                                                └─────────────┘
```

### 3.5 Common Database Queries

#### Query 1: Get all approved skills for an employee
```sql
SELECT 
    es.id,
    s.name AS skill_name,
    s.category,
    es.proficiency_level,
    es.years_experience
FROM employee_skills es
JOIN skills s ON es.skill_id = s.id
WHERE es.employee_id = ?
  AND es.approval_status = 'APPROVED'
ORDER BY s.name;
```

#### Query 2: Get all employees on a project with allocation types
```sql
SELECT 
    e.id,
    e.name,
    e.email,
    e.job_title,
    pa.allocation_type,
    pa.start_date
FROM project_assignments pa
JOIN employees e ON pa.employee_id = e.id
WHERE pa.project_id = ?
  AND pa.active = true
ORDER BY e.name;
```

#### Query 3: Find pending skill approvals for a manager
```sql
SELECT 
    es.id,
    e.name AS employee_name,
    s.name AS skill_name,
    es.proficiency_level,
    es.created_at
FROM employee_skills es
JOIN employees e ON es.employee_id = e.id
JOIN skills s ON es.skill_id = s.id
WHERE e.manager_id = ?
  AND es.approval_status = 'PENDING'
ORDER BY es.created_at DESC;
```

---

**Continue to next section for Frontend Architecture...**
