# 🗄️ SkillBridge Database - Quick Reference

## Database Overview

**Name:** `skillbridge`  
**Type:** PostgreSQL  
**Port:** 5432  
**Tables:** 6  
**Seed Records:** 50

---

## 📊 Tables at a Glance

| # | Table Name | Records | Purpose |
|---|------------|---------|---------|
| 1 | `employees` | 4 | User accounts and employee info |
| 2 | `skills` | 18 | Skill catalog |
| 3 | `employee_skills` | 9 | Employee skill proficiencies |
| 4 | `roles_projects` | 3 | Job roles and projects |
| 5 | `role_skill_requirements` | 11 | Required skills for roles/projects |
| 6 | `learning_resources` | 5 | Learning materials |

---

## 🔑 Test Accounts

| Email | Password | Role | Name |
|-------|----------|------|------|
| admin@skillbridge.com | admin123 | HR_ADMIN | Admin User |
| manager@skillbridge.com | manager123 | MANAGER | Alice Manager |
| employee@skillbridge.com | employee123 | EMPLOYEE | John Doe |
| jane@skillbridge.com | employee123 | EMPLOYEE | Jane Smith |

---

## 🎯 Skills Catalog (18 Total)

### Programming Languages (4)
- Java, Python, JavaScript, TypeScript

### Frameworks (4)
- Spring Boot, React, Angular, Node.js

### Cloud (4)
- AWS, Azure, Docker, Kubernetes

### Databases (3)
- PostgreSQL, MongoDB, MySQL

### Soft Skills (3)
- Communication, Leadership, Problem Solving

---

## 👤 Employee Profiles

### John Doe (employee@skillbridge.com)
**Role:** Software Engineer  
**Skills:**
- ⭐⭐⭐ Java (5 years)
- ⭐⭐⭐ Spring Boot (4 years)
- ⭐⭐ PostgreSQL (3 years)
- ⭐⭐ Docker (2 years)
- ⭐ React (0.5 years)

### Jane Smith (jane@skillbridge.com)
**Role:** Junior Developer  
**Skills:**
- ⭐⭐ JavaScript (2 years)
- ⭐⭐ React (1.5 years)
- ⭐⭐ Node.js (1 year)
- ⭐ MongoDB (0.5 years)

---

## 💼 Roles & Projects

### 1. Backend Engineer L2 (Role)
**Must Have:**
- Java (Intermediate)
- Spring Boot (Intermediate)
- PostgreSQL (Intermediate)

**Nice to Have:**
- Docker (Intermediate)
- AWS (Beginner)

### 2. Frontend Engineer L1 (Role)
**Must Have:**
- JavaScript (Intermediate)
- React (Intermediate)

**Nice to Have:**
- TypeScript (Beginner)

### 3. Cloud Migration Project
**Must Have:**
- AWS (Intermediate)
- Docker (Intermediate)

**Nice to Have:**
- Kubernetes (Intermediate)

---

## 📚 Learning Resources

| Skill | Resource | Level | Duration | Free |
|-------|----------|-------|----------|------|
| Java | Java Fundamentals | Beginner | 8h | ✅ |
| Spring Boot | Spring Boot Masterclass | Intermediate | 10h | ✅ |
| React | React Official Tutorial | Beginner | 5h | ✅ |
| AWS | AWS Cloud Practitioner | Beginner | 12h | ❌ |
| Docker | Docker Deep Dive | Intermediate | 6h | ✅ |

---

## 🔗 Relationships

```
employees (4)
    ├── manager_id → employees
    ├── employee_skills (9) → skills (18)
    └── roles_projects (3) [as owner]
            └── role_skill_requirements (11) → skills (18)

skills (18)
    ├── employee_skills (9)
    ├── role_skill_requirements (11)
    └── learning_resources (5)
```

---

## 🚀 Quick Setup

```bash
# 1. Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# 2. Create database
createdb skillbridge

# 3. Run application
cd backend
mvn spring-boot:run

# 4. Access Swagger UI
open http://localhost:8080/swagger-ui.html
```

---

## 📖 Full Documentation

For complete details, see **[DATABASE.md](./DATABASE.md)**

---

**Last Updated:** December 16, 2024
