# 🗄️ SkillBridge Database Documentation

## 📋 Table of Contents
- [Database Overview](#database-overview)
- [Database Schema](#database-schema)
- [Table Definitions](#table-definitions)
- [Relationships](#relationships)
- [Seed Data](#seed-data)
- [Indexes & Constraints](#indexes--constraints)
- [Configuration](#configuration)

---

## 🎯 Database Overview

**Database Name:** `skillbridge`  
**Database Type:** PostgreSQL  
**Default Port:** 5432  
**Default Host:** localhost  
**Schema Management:** Hibernate Auto-DDL (create mode)

### Purpose
The SkillBridge database stores employee information, skills catalog, employee skill proficiencies, role/project requirements, and learning resources to enable skill gap analysis and career development recommendations.

---

## 📊 Database Schema

### Entity Relationship Diagram

```
┌─────────────┐
│  employees  │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────┐         ┌─────────────┐
│ employee_skills │ N:1 ───▶│   skills    │
└─────────────────┘         └──────┬──────┘
                                   │
                                   │ 1:N
                                   │
                            ┌──────▼──────────────────┐
                            │ learning_resources      │
                            └─────────────────────────┘

┌─────────────────┐         ┌─────────────┐
│ roles_projects  │ 1:N ───▶│   skills    │
└────────┬────────┘         └─────────────┘
         │
         │ 1:N
         │
┌────────▼─────────────────┐
│ role_skill_requirements  │
└──────────────────────────┘
```

### Tables Summary

| Table Name | Records (Seed) | Purpose |
|------------|----------------|---------|
| `employees` | 4 | User accounts and employee information |
| `skills` | 18 | Skill catalog with categories |
| `employee_skills` | 9 | Employee skill proficiencies and interests |
| `roles_projects` | 3 | Job roles and project definitions |
| `role_skill_requirements` | 11 | Required skills for roles/projects |
| `learning_resources` | 5 | Learning materials for skills |

---

## 📑 Table Definitions

### 1. `employees`

Stores employee/user information including authentication and organizational details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique employee identifier |
| `name` | VARCHAR(255) | NOT NULL | Employee full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email address (used for login) |
| `password` | VARCHAR(255) | NOT NULL | Encrypted password (BCrypt) |
| `role` | VARCHAR(50) | NOT NULL | User role enum |
| `job_title` | VARCHAR(255) | | Job title/position |
| `department` | VARCHAR(255) | | Department name |
| `location` | VARCHAR(255) | | Office location |
| `manager_id` | BIGINT | FOREIGN KEY → employees(id) | Reference to manager |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Enums:**
- `role`: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`

**Indexes:**
- Primary Key: `id`
- Unique: `email`
- Foreign Key: `manager_id` → `employees(id)`

---

### 2. `skills`

Master catalog of all skills available in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique skill identifier |
| `name` | VARCHAR(255) | NOT NULL, UNIQUE | Skill name |
| `category` | VARCHAR(50) | NOT NULL | Skill category enum |
| `description` | VARCHAR(1000) | | Skill description |
| `active` | BOOLEAN | NOT NULL, DEFAULT true | Whether skill is active |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Enums:**
- `category`: `LANGUAGE`, `FRAMEWORK`, `CLOUD`, `DATABASE`, `SOFT_SKILL`, `OTHER`

**Indexes:**
- Primary Key: `id`
- Unique: `name`

---

### 3. `employee_skills`

Junction table tracking employee proficiency and interest in skills.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique record identifier |
| `employee_id` | BIGINT | NOT NULL, FOREIGN KEY → employees(id) | Employee reference |
| `skill_id` | BIGINT | NOT NULL, FOREIGN KEY → skills(id) | Skill reference |
| `proficiency_level` | INTEGER | NOT NULL | Proficiency: 0-3 |
| `interest_level` | INTEGER | NOT NULL | Interest: 0-3 |
| `years_experience` | DOUBLE | | Years of experience |
| `last_used_date` | DATE | | Last time skill was used |
| `source` | VARCHAR(50) | NOT NULL, DEFAULT 'SELF_REPORTED' | Data source enum |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Proficiency Levels:**
- `0`: None
- `1`: Beginner
- `2`: Intermediate
- `3`: Advanced

**Interest Levels:**
- `0`: No interest
- `1`: Low interest
- `2`: Moderate interest
- `3`: High interest

**Enums:**
- `source`: `SELF_REPORTED`, `MANAGER_VALIDATED`, `CERTIFICATION`

**Indexes:**
- Primary Key: `id`
- Unique Constraint: `(employee_id, skill_id)`
- Foreign Keys: `employee_id`, `skill_id`

---

### 4. `roles_projects`

Defines job roles and projects that have skill requirements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `name` | VARCHAR(255) | NOT NULL | Role or project name |
| `type` | VARCHAR(50) | NOT NULL | Type enum |
| `description` | VARCHAR(2000) | | Detailed description |
| `owner_id` | BIGINT | NOT NULL, FOREIGN KEY → employees(id) | Manager who created it |
| `status` | VARCHAR(50) | NOT NULL, DEFAULT 'ACTIVE' | Status enum |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Enums:**
- `type`: `ROLE`, `PROJECT`
- `status`: `ACTIVE`, `ARCHIVED`

**Indexes:**
- Primary Key: `id`
- Foreign Key: `owner_id` → `employees(id)`

---

### 5. `role_skill_requirements`

Defines skill requirements for roles and projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `role_project_id` | BIGINT | NOT NULL, FOREIGN KEY → roles_projects(id) | Role/Project reference |
| `skill_id` | BIGINT | NOT NULL, FOREIGN KEY → skills(id) | Skill reference |
| `required_level` | INTEGER | NOT NULL | Required proficiency: 1-3 |
| `importance` | VARCHAR(50) | NOT NULL, DEFAULT 'NICE_TO_HAVE' | Importance enum |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Required Levels:**
- `1`: Beginner
- `2`: Intermediate
- `3`: Advanced

**Enums:**
- `importance`: `MUST_HAVE`, `NICE_TO_HAVE`

**Indexes:**
- Primary Key: `id`
- Unique Constraint: `(role_project_id, skill_id)`
- Foreign Keys: `role_project_id`, `skill_id`

---

### 6. `learning_resources`

Learning materials and courses for skill development.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique identifier |
| `title` | VARCHAR(255) | NOT NULL | Resource title |
| `url` | VARCHAR(2000) | NOT NULL | Resource URL |
| `type` | VARCHAR(50) | NOT NULL | Resource type enum |
| `skill_id` | BIGINT | NOT NULL, FOREIGN KEY → skills(id) | Associated skill |
| `level` | VARCHAR(50) | NOT NULL | Difficulty level enum |
| `estimated_duration` | INTEGER | | Duration in minutes |
| `is_free` | BOOLEAN | NOT NULL, DEFAULT true | Whether resource is free |
| `description` | VARCHAR(2000) | | Resource description |
| `created_at` | TIMESTAMP | NOT NULL | Record creation timestamp |
| `updated_at` | TIMESTAMP | | Last update timestamp |

**Enums:**
- `type`: `INTERNAL`, `EXTERNAL`
- `level`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`

**Indexes:**
- Primary Key: `id`
- Foreign Key: `skill_id` → `skills(id)`

---

## 🔗 Relationships

### Foreign Key Relationships

```sql
-- Employee self-reference for manager
employees.manager_id → employees.id

-- Employee skills relationships
employee_skills.employee_id → employees.id
employee_skills.skill_id → skills.id

-- Role/Project ownership
roles_projects.owner_id → employees.id

-- Role skill requirements
role_skill_requirements.role_project_id → roles_projects.id
role_skill_requirements.skill_id → skills.id

-- Learning resources
learning_resources.skill_id → skills.id
```

### Cardinality

- **Employee → Employee (Manager)**: Many-to-One (optional)
- **Employee → EmployeeSkills**: One-to-Many
- **Skill → EmployeeSkills**: One-to-Many
- **Skill → LearningResources**: One-to-Many
- **Employee → RoleProject**: One-to-Many (as owner)
- **RoleProject → RoleSkillRequirement**: One-to-Many
- **Skill → RoleSkillRequirement**: One-to-Many

---

## 🌱 Seed Data

The database is automatically populated with seed data on first run via `DataLoader.java`.

### Employees (4 records)

| ID | Name | Email | Password | Role | Job Title | Department |
|----|------|-------|----------|------|-----------|------------|
| 1 | Admin User | admin@skillbridge.com | admin123 | HR_ADMIN | HR Director | Human Resources |
| 2 | Alice Manager | manager@skillbridge.com | manager123 | MANAGER | Engineering Manager | Engineering |
| 3 | John Doe | employee@skillbridge.com | employee123 | EMPLOYEE | Software Engineer | Engineering |
| 4 | Jane Smith | jane@skillbridge.com | employee123 | EMPLOYEE | Junior Developer | Engineering |

**Manager Relationships:**
- John Doe (ID: 3) reports to Alice Manager (ID: 2)
- Jane Smith (ID: 4) reports to Alice Manager (ID: 2)

---

### Skills (18 records)

#### Programming Languages
| ID | Name | Category | Description |
|----|------|----------|-------------|
| 1 | Java | LANGUAGE | Java programming language |
| 2 | Python | LANGUAGE | Python programming language |
| 3 | JavaScript | LANGUAGE | JavaScript programming language |
| 4 | TypeScript | LANGUAGE | TypeScript programming language |

#### Frameworks
| ID | Name | Category | Description |
|----|------|----------|-------------|
| 5 | Spring Boot | FRAMEWORK | Spring Boot framework for Java |
| 6 | React | FRAMEWORK | React JavaScript library |
| 7 | Angular | FRAMEWORK | Angular framework |
| 8 | Node.js | FRAMEWORK | Node.js runtime |

#### Cloud Technologies
| ID | Name | Category | Description |
|----|------|----------|-------------|
| 9 | AWS | CLOUD | Amazon Web Services |
| 10 | Azure | CLOUD | Microsoft Azure |
| 11 | Docker | CLOUD | Docker containerization |
| 12 | Kubernetes | CLOUD | Kubernetes orchestration |

#### Databases
| ID | Name | Category | Description |
|----|------|----------|-------------|
| 13 | PostgreSQL | DATABASE | PostgreSQL database |
| 14 | MongoDB | DATABASE | MongoDB NoSQL database |
| 15 | MySQL | DATABASE | MySQL database |

#### Soft Skills
| ID | Name | Category | Description |
|----|------|----------|-------------|
| 16 | Communication | SOFT_SKILL | Effective communication |
| 17 | Leadership | SOFT_SKILL | Team leadership |
| 18 | Problem Solving | SOFT_SKILL | Analytical problem solving |

---

### Employee Skills (9 records)

#### John Doe (employee@skillbridge.com)
| Skill | Proficiency | Interest | Years | Last Used |
|-------|-------------|----------|-------|-----------|
| Java | 3 (Advanced) | 3 (High) | 5.0 | Today |
| Spring Boot | 3 (Advanced) | 3 (High) | 4.0 | Today |
| PostgreSQL | 2 (Intermediate) | 2 (Moderate) | 3.0 | Today |
| Docker | 2 (Intermediate) | 3 (High) | 2.0 | Today |
| React | 1 (Beginner) | 2 (Moderate) | 0.5 | Today |

#### Jane Smith (jane@skillbridge.com)
| Skill | Proficiency | Interest | Years | Last Used |
|-------|-------------|----------|-------|-----------|
| JavaScript | 2 (Intermediate) | 3 (High) | 2.0 | Today |
| React | 2 (Intermediate) | 3 (High) | 1.5 | Today |
| Node.js | 2 (Intermediate) | 2 (Moderate) | 1.0 | Today |
| MongoDB | 1 (Beginner) | 2 (Moderate) | 0.5 | Today |

---

### Roles & Projects (3 records)

| ID | Name | Type | Description | Owner |
|----|------|------|-------------|-------|
| 1 | Backend Engineer L2 | ROLE | Mid-level backend engineer position | Alice Manager |
| 2 | Frontend Engineer L1 | ROLE | Entry-level frontend engineer position | Alice Manager |
| 3 | Cloud Migration Project | PROJECT | Migrate legacy systems to AWS cloud | Alice Manager |

---

### Role Skill Requirements (11 records)

#### Backend Engineer L2
| Skill | Required Level | Importance |
|-------|----------------|------------|
| Java | 2 (Intermediate) | MUST_HAVE |
| Spring Boot | 2 (Intermediate) | MUST_HAVE |
| PostgreSQL | 2 (Intermediate) | MUST_HAVE |
| Docker | 2 (Intermediate) | NICE_TO_HAVE |
| AWS | 1 (Beginner) | NICE_TO_HAVE |

#### Frontend Engineer L1
| Skill | Required Level | Importance |
|-------|----------------|------------|
| JavaScript | 2 (Intermediate) | MUST_HAVE |
| React | 2 (Intermediate) | MUST_HAVE |
| TypeScript | 1 (Beginner) | NICE_TO_HAVE |

#### Cloud Migration Project
| Skill | Required Level | Importance |
|-------|----------------|------------|
| AWS | 2 (Intermediate) | MUST_HAVE |
| Docker | 2 (Intermediate) | MUST_HAVE |
| Kubernetes | 2 (Intermediate) | NICE_TO_HAVE |

---

### Learning Resources (5 records)

| ID | Title | Skill | Level | Duration | Free | URL |
|----|-------|-------|-------|----------|------|-----|
| 1 | Java Fundamentals | Java | BEGINNER | 480 min | ✅ | https://docs.oracle.com/javase/tutorial/ |
| 2 | Spring Boot Masterclass | Spring Boot | INTERMEDIATE | 600 min | ✅ | https://spring.io/guides |
| 3 | React Official Tutorial | React | BEGINNER | 300 min | ✅ | https://react.dev/learn |
| 4 | AWS Cloud Practitioner | AWS | BEGINNER | 720 min | ❌ | https://aws.amazon.com/training/ |
| 5 | Docker Deep Dive | Docker | INTERMEDIATE | 360 min | ✅ | https://docs.docker.com/get-started/ |

---

## 🔒 Indexes & Constraints

### Primary Keys
All tables use auto-incrementing `BIGINT` primary keys named `id`.

### Unique Constraints
- `employees.email` - Ensures unique login credentials
- `skills.name` - Prevents duplicate skill names
- `employee_skills(employee_id, skill_id)` - One record per employee-skill pair
- `role_skill_requirements(role_project_id, skill_id)` - One requirement per role-skill pair

### Foreign Key Constraints
```sql
-- Employee manager relationship
ALTER TABLE employees 
  ADD CONSTRAINT fk_employee_manager 
  FOREIGN KEY (manager_id) REFERENCES employees(id);

-- Employee skills
ALTER TABLE employee_skills 
  ADD CONSTRAINT fk_employee_skill_employee 
  FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE employee_skills 
  ADD CONSTRAINT fk_employee_skill_skill 
  FOREIGN KEY (skill_id) REFERENCES skills(id);

-- Role/Project ownership
ALTER TABLE roles_projects 
  ADD CONSTRAINT fk_role_project_owner 
  FOREIGN KEY (owner_id) REFERENCES employees(id);

-- Role skill requirements
ALTER TABLE role_skill_requirements 
  ADD CONSTRAINT fk_requirement_role_project 
  FOREIGN KEY (role_project_id) REFERENCES roles_projects(id);

ALTER TABLE role_skill_requirements 
  ADD CONSTRAINT fk_requirement_skill 
  FOREIGN KEY (skill_id) REFERENCES skills(id);

-- Learning resources
ALTER TABLE learning_resources 
  ADD CONSTRAINT fk_resource_skill 
  FOREIGN KEY (skill_id) REFERENCES skills(id);
```

### Audit Timestamps
All tables include:
- `created_at` - Automatically set on record creation
- `updated_at` - Automatically updated on record modification

These are managed by Spring Data JPA's `@EntityListeners(AuditingEntityListener.class)`.

---

## ⚙️ Configuration

### Database Connection

**File:** `backend/src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/skillbridge
spring.datasource.username=postgres
spring.datasource.password=postgres
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=create
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.open-in-view=false
```

### DDL Mode: `create`

⚠️ **Important:** The application uses `spring.jpa.hibernate.ddl-auto=create`, which means:
- Database schema is **dropped and recreated** on every application startup
- All data is **lost** when the application restarts
- Seed data is **automatically loaded** on startup

**For Production:** Change to `validate` or `update`:
```properties
spring.jpa.hibernate.ddl-auto=validate  # Recommended for production
```

---

## 🚀 Setup Instructions

### 1. Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from [postgresql.org](https://www.postgresql.org/download/windows/)

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE skillbridge;

# Verify
\l

# Exit
\q
```

### 3. Configure Credentials

If your PostgreSQL uses different credentials, update `application.properties`:

```properties
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 4. Run Application

```bash
cd backend
mvn spring-boot:run
```

The application will:
1. Connect to PostgreSQL
2. Create all tables
3. Load seed data automatically

---

## 📊 Database Statistics

| Metric | Value |
|--------|-------|
| Total Tables | 6 |
| Total Columns | 58 |
| Foreign Keys | 7 |
| Unique Constraints | 4 |
| Enum Types | 9 |
| Seed Records | 50 |
| Estimated Size (empty) | ~2 MB |

---

## 🔍 Useful Queries

### View All Employees
```sql
SELECT id, name, email, role, job_title, department 
FROM employees 
ORDER BY id;
```

### View All Skills by Category
```sql
SELECT category, COUNT(*) as count 
FROM skills 
GROUP BY category 
ORDER BY count DESC;
```

### View Employee Skills with Names
```sql
SELECT 
  e.name as employee_name,
  s.name as skill_name,
  es.proficiency_level,
  es.years_experience
FROM employee_skills es
JOIN employees e ON es.employee_id = e.id
JOIN skills s ON es.skill_id = s.id
ORDER BY e.name, s.name;
```

### View Role Requirements
```sql
SELECT 
  rp.name as role_name,
  s.name as skill_name,
  rsr.required_level,
  rsr.importance
FROM role_skill_requirements rsr
JOIN roles_projects rp ON rsr.role_project_id = rp.id
JOIN skills s ON rsr.skill_id = s.id
ORDER BY rp.name, rsr.importance DESC;
```

### Find Skill Gaps for an Employee
```sql
SELECT 
  s.name as skill_name,
  rsr.required_level,
  COALESCE(es.proficiency_level, 0) as current_level,
  rsr.required_level - COALESCE(es.proficiency_level, 0) as gap
FROM role_skill_requirements rsr
JOIN skills s ON rsr.skill_id = s.id
LEFT JOIN employee_skills es ON es.skill_id = s.id AND es.employee_id = 3
WHERE rsr.role_project_id = 1
ORDER BY gap DESC;
```

---

## 📚 Additional Resources

- **Entity Classes:** `/backend/src/main/java/com/skillbridge/entity/`
- **Repositories:** `/backend/src/main/java/com/skillbridge/repository/`
- **Data Loader:** `/backend/src/main/java/com/skillbridge/config/DataLoader.java`
- **API Documentation:** `/docs/API.md`
- **Setup Guide:** `/docs/SETUP.md`

---

## 🆘 Troubleshooting

### Connection Refused
```
Error: Connection to localhost:5432 refused
```
**Solution:** Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql@15

# Linux
sudo systemctl start postgresql
```

### Database Does Not Exist
```
Error: database "skillbridge" does not exist
```
**Solution:** Create the database:
```bash
createdb skillbridge
```

### Authentication Failed
```
Error: password authentication failed for user "postgres"
```
**Solution:** Update credentials in `application.properties` or reset PostgreSQL password.

### Schema Already Exists
If you want to reset the database:
```bash
dropdb skillbridge
createdb skillbridge
```

---

**Last Updated:** December 16, 2024  
**Version:** 1.0  
**Maintained By:** SkillBridge Development Team
