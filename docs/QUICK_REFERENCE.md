# SkillBridge - Quick Reference Guide

**Purpose**: Quick answers to common questions  
**Last Updated**: 2025-12-18

---

## 🚀 Quick Start

### Running the Application

**Backend** (Terminal 1):
```bash
cd backend
mvn spring-boot:run
```
Server starts on: `http://localhost:8080`

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```
App opens on: `http://localhost:5173`

---

## 📊 Application Statistics

| Metric | Count |
|--------|-------|
| **Backend Controllers** | 8 |
| **API Endpoints** | 49 |
| **Database Tables** | 8 |
| **Frontend Pages** | 10 |
| **User Roles** | 3 (Employee, Manager, HR) |
| **Total Features** | 10 major features |

---

## 🎯 Key Features Summary

### 1. **Skill Management**
- Employees add skills → PENDING status
- Managers approve/reject → APPROVED/REJECTED
- Tracks proficiency (1-5) and experience (years)

### 2. **Team Matrix**
- View all employees with skills
- 6 advanced filters (search, skills, dept, availability, billable, project)
- Real-time availability tracking

### 3. **Project Management**
- Create upcoming projects
- Allocate resources with filters
- Track allocation types (Billable/Non-Billable/Investment)
- Start projects with team assignments

### 4. **Gap Analysis**
- Compare employee skills vs role requirements
- Identify missing skills
- Show proficiency gaps

### 5. **Learning Recommendations**
- Personalized based on gaps
- Filter by level and type
- External resource links

---

## 🔑 Test Users

| Email | Password | Role | Use For |
|-------|----------|------|---------|
| hr@skillbridge.com | password | HR_ADMIN | Full access testing |
| manager@skillbridge.com | password | MANAGER | Manager features |
| employee@skillbridge.com | password | EMPLOYEE | Employee features |

---

## 📁 Project Structure

```
TeamProject/
├── backend/                    # Spring Boot backend
│   ├── src/main/java/com/skillbridge/
│   │   ├── controller/        # 8 REST controllers
│   │   ├── service/           # 9 business logic services
│   │   ├── repository/        # 8 database repositories
│   │   ├── entity/            # 8 database models
│   │   ├── dto/               # 22 data transfer objects
│   │   ├── security/          # JWT authentication
│   │   └── config/            # Configuration
│   └── pom.xml                # Maven dependencies
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── pages/             # 10 page components
│   │   ├── services/          # API client
│   │   └── App.jsx            # Main app
│   └── package.json           # NPM dependencies
│
└── docs/                       # Documentation
    ├── MANAGER_GUIDE.md        # Backend deep dive
    ├── COMPLETE_TECHNICAL_GUIDE.md  # Full reference
    └── QUICK_REFERENCE.md      # This file
```

---

## 🔄 Common Workflows

### Workflow 1: Adding a Skill
1. Employee logs in
2. Goes to "My Skills"
3. Clicks "Add Skill"
4. Selects skill, sets proficiency
5. Submits → Status: PENDING
6. Manager sees in dashboard
7. Manager approves → Status: APPROVED
8. Employee sees approved skill

### Workflow 2: Allocating Resources
1. HR logs in
2. Goes to "Project Management" → "Ongoing Projects"
3. Clicks "Allocate Resource" on a project
4. Uses filters to find suitable employees
5. Selects employees
6. Sets allocation type for each (Billable/Non-Billable/Investment)
7. Clicks "Allocate Selected"
8. Employees appear in project's team
9. Team Matrix shows employees as "Busy"

### Workflow 3: Gap Analysis
1. Employee logs in
2. Goes to "My Gaps"
3. Selects a role/project
4. Sees:
   - ❌ Missing skills (don't have)
   - ⚠️ Skills needing improvement (proficiency too low)
   - ✅ Matching skills (meets requirements)
5. Goes to "Recommendations"
6. Sees learning resources for gap skills
7. Clicks resource link to learn

---

## 🛠️ Technology Stack

### Backend
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Database**: PostgreSQL
- **Security**: JWT + Spring Security
- **ORM**: Hibernate/JPA

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **HTTP Client**: Axios
- **Routing**: React Router

---

## 📡 API Endpoints (Quick Reference)

### Authentication
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Employees
- `GET /employees` - Get all employees
- `POST /employees` - Create employee
- `PUT /employees/{id}` - Update employee
- `DELETE /employees/{id}` - Delete employee

### Skills
- `GET /skills` - Get all skills
- `POST /skills` - Create skill (HR only)
- `GET /employees/{id}/skills` - Get employee skills
- `POST /employees/{id}/skills` - Add skill
- `POST /employees/{id}/skills/{skillId}/approve` - Approve skill
- `POST /employees/{id}/skills/{skillId}/reject` - Reject skill

### Projects
- `GET /projects/ongoing` - Get ongoing projects
- `GET /projects/upcoming` - Get upcoming projects
- `POST /projects` - Create project
- `POST /projects/{id}/assign` - Assign employee (with allocation type)
- `POST /projects/{id}/start` - Start project with team

### Analytics
- `GET /analytics/employee/{id}/gap` - Get gap analysis
- `GET /analytics/employee/{id}/recommendations` - Get recommendations

---

## 🔒 Security

### Authentication Flow
1. User submits email + password
2. Backend validates credentials
3. Backend generates JWT token
4. Frontend stores token in localStorage
5. Frontend sends token in Authorization header for all requests
6. Backend validates token on each request

### Role-Based Access
- **EMPLOYEE**: Own skills, gaps, recommendations
- **MANAGER**: Approve skills, view team, allocate resources
- **HR_ADMIN**: Full access to all features

---

## 💾 Database Tables

1. **employees** - Employee master data
2. **skills** - Skill catalog
3. **employee_skills** - Employee-skill mapping (with approval)
4. **projects** - Project master data
5. **project_assignments** - Employee-project assignments (with allocation type)
6. **role_projects** - Roles for gap analysis
7. **role_project_requirements** - Required skills for roles
8. **learning_resources** - Learning materials

---

## 🐛 Troubleshooting

### Backend won't start
- Check PostgreSQL is running
- Verify database credentials in `application.properties`
- Run `mvn clean install`

### Frontend won't start
- Run `npm install`
- Check backend is running on port 8080
- Clear browser cache

### Login fails
- Check test users exist in database
- Verify password is "password"
- Check JWT secret in application.properties

### 401 Unauthorized errors
- Token expired - log out and log in again
- Token not sent - check localStorage has 'token'
- Invalid token - clear localStorage and log in

---

## 📞 Support

For questions, refer to:
- **MANAGER_GUIDE.md** - Backend architecture deep dive
- **COMPLETE_TECHNICAL_GUIDE.md** - Full technical reference
- **E2E_VERIFICATION_REPORT.md** - Feature verification
- **BROWSER_TESTING_CHECKLIST.md** - Testing guide

---

**Last Updated**: 2025-12-18  
**Version**: 1.0  
**Status**: Production Ready ✅
