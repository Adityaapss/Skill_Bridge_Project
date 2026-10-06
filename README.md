# SkillBridge - Employee Skill Matrix & Learning Recommender

## 🎯 Overview

SkillBridge is an internal web application designed to help organizations manage employee skills, identify skill gaps, and recommend targeted learning resources. It serves three primary user groups: Employees, Managers, and HR Admins.

## 🚀 Running locally

```bash
# Option A: everything in Docker (Postgres + backend + frontend on http://localhost:8081)
cp .env.example .env        # set JWT_SECRET (openssl rand -hex 32) and DB_PASSWORD
docker compose up --build

# Option B: run the pieces yourself (Postgres must be running with a `skillbridge` database)
cd backend  && mvn spring-boot:run      # http://localhost:8080/api  (Swagger: /api/swagger-ui.html)
cd frontend && npm install && npm run dev   # http://localhost:5173
```

Backend settings are environment variables with local-friendly defaults: `DB_URL`, `DB_USERNAME`,
`DB_PASSWORD`, `JWT_SECRET`, `CORS_ORIGINS`, `SEED_DATA` (demo accounts; set `false` outside local dev),
`SHOW_SQL`, `SWAGGER_ENABLED`. Tests: `cd backend && mvn test` (in-memory H2) and `cd frontend && npm test`.

## ✨ Recent additions

- **Security:** the acting user always comes from the JWT (no more `managerId`/`employeeId` trust),
  employees can only read/edit their own profile, only a skill's manager (or HR) can approve it, level
  changes to approved skills need re-approval, passwords are never serialised, login is rate-limited,
  unauthenticated calls get 401, and gap analysis counts approved skills only.
- **Employees:** skill history timeline, peer endorsements, certifications with expiry warnings,
  learning-progress tracking, career paths with a skill radar, change password.
- **Managers:** team heatmap, staffing suggestions (best fit by match score and workload), CSV export.
- **HR:** organisation insights (coverage, bus factor, demand vs supply), CSV employee import.
- **Everyone:** in-app notifications, dark mode, ⌘K / Ctrl+K navigation, responsive layout.

## 🏗️ Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        React Frontend                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Employee │  │ Manager  │  │ HR Admin │  │   Auth   │   │
│  │   Pages  │  │  Pages   │  │  Pages   │  │  Pages   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │              │              │              │       │
│         └──────────────┴──────────────┴──────────────┘       │
│                          │                                    │
│                    Axios HTTP Client                          │
└──────────────────────────┼───────────────────────────────────┘
                           │
                    REST API (JSON)
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                   Spring Boot Backend                         │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Security Layer (JWT)                       │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Controllers (REST Endpoints)                    │  │
│  │  Auth │ Employee │ Skill │ Role │ Resource │ Analytics │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Service Layer (Business Logic)             │  │
│  │  - Gap Analysis  - Recommendations  - Validation       │  │
│  └────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         Repository Layer (Spring Data JPA)              │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┼───────────────────────────────────┘
                           │
                      JPA/Hibernate
                           │
┌──────────────────────────┼───────────────────────────────────┐
│                    PostgreSQL Database                        │
│  Tables: employees, skills, employee_skills,                 │
│          roles_projects, role_skill_requirements,            │
│          learning_resources                                  │
└───────────────────────────────────────────────────────────────┘
```

### Backend Layer Structure

- **Controller Layer**: REST API endpoints, request/response handling, validation
- **Service Layer**: Business logic, gap analysis, recommendations, orchestration
- **Repository Layer**: Data access using Spring Data JPA
- **Security Layer**: JWT authentication, role-based authorization
- **DTOs**: Data Transfer Objects for API contracts

### Frontend Structure

- **Pages**: Route-based page components
- **Components**: Reusable UI components (forms, tables, charts)
- **Services**: API client functions (Axios)
- **Context**: Authentication state, user context
- **Hooks**: Custom React hooks for data fetching

## 👥 User Roles

### EMPLOYEE
- Manage own skill profile
- View skill gaps for current role/projects
- See recommended learning resources

### MANAGER
- Define role/project skill requirements
- View team skill matrices and gaps
- Identify employees for roles/projects

### HR_ADMIN
- Manage global skill catalog
- View organization-wide analytics
- Manage learning resources

## 📊 Data Model

### Core Entities

#### Employee
```
- id (PK)
- name
- email (unique)
- password (hashed)
- role (EMPLOYEE/MANAGER/HR_ADMIN)
- jobTitle
- managerId (FK -> Employee)
- department
- location
- createdAt, updatedAt
```

#### Skill
```
- id (PK)
- name (unique)
- category (LANGUAGE/FRAMEWORK/CLOUD/DATABASE/SOFT_SKILL/OTHER)
- description
- active (boolean)
- createdAt, updatedAt
```

#### EmployeeSkill
```
- id (PK)
- employeeId (FK -> Employee)
- skillId (FK -> Skill)
- proficiencyLevel (0-3: None/Beginner/Intermediate/Advanced)
- interestLevel (0-3)
- yearsExperience
- lastUsedDate
- source (SELF_REPORTED/MANAGER_VALIDATED/CERTIFICATION)
- createdAt, updatedAt
- UNIQUE(employeeId, skillId)
```

#### RoleProject
```
- id (PK)
- name
- type (ROLE/PROJECT)
- description
- ownerId (FK -> Employee, must be MANAGER)
- status (ACTIVE/ARCHIVED)
- createdAt, updatedAt
```

#### RoleSkillRequirement
```
- id (PK)
- roleProjectId (FK -> RoleProject)
- skillId (FK -> Skill)
- requiredLevel (1-3)
- importance (MUST_HAVE/NICE_TO_HAVE)
- createdAt, updatedAt
- UNIQUE(roleProjectId, skillId)
```

#### LearningResource
```
- id (PK)
- title
- url
- type (INTERNAL/EXTERNAL)
- skillId (FK -> Skill)
- level (BEGINNER/INTERMEDIATE/ADVANCED)
- estimatedDuration (minutes)
- isFree (boolean)
- description
- createdAt, updatedAt
```

## 🚀 Features (MVP)

### 1. Employee Skill Profiles
- ✅ View and edit basic profile
- ✅ Add/update/remove skills from catalog
- ✅ Set proficiency and interest levels
- ✅ Track years of experience and last used date

### 2. Skill Catalog Management
- ✅ Central skill catalog with categories
- ✅ HR_ADMIN can CRUD skills
- ✅ All users can browse active skills

### 3. Role/Project Skill Requirements
- ✅ Managers define role/project requirements
- ✅ Set required proficiency per skill
- ✅ Mark importance (MUST_HAVE/NICE_TO_HAVE)

### 4. Skill Gap Analysis
- ✅ Individual gap analysis (employee vs role/project)
- ✅ Team gap analysis (team vs project)
- ✅ Match score calculation

### 5. Learning Resources & Recommendations
- ✅ Maintain learning resource library
- ✅ Recommend resources based on skill gaps
- ✅ Filter by skill, level, type

### 6. Dashboards
- ✅ Employee Dashboard: gaps, recommendations
- ✅ Manager Dashboard: team matrix, critical gaps
- ✅ HR Dashboard: org-wide gap analytics

## 🛠️ Tech Stack

### Backend
- **Java**: 17+
- **Framework**: Spring Boot 3.x
- **Database**: PostgreSQL 15+
- **ORM**: Spring Data JPA (Hibernate)
- **Security**: Spring Security + JWT
- **Build**: Maven
- **Validation**: Bean Validation (Hibernate Validator)

### Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Library**: Material-UI (MUI) v5
- **State Management**: React Context + Hooks
- **Charts**: Recharts or Chart.js

### Development Tools
- **API Documentation**: Swagger/OpenAPI
- **Database Migration**: Flyway or Liquibase (optional)
- **Testing**: JUnit 5, Mockito (backend), Jest (frontend)

## 📁 Project Structure

```
TeamProject/
├── backend/                    # Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/skillbridge/
│   │   │   │   ├── config/           # Security, CORS, etc.
│   │   │   │   ├── controller/       # REST controllers
│   │   │   │   ├── dto/              # Data Transfer Objects
│   │   │   │   ├── entity/           # JPA entities
│   │   │   │   ├── repository/       # Spring Data repositories
│   │   │   │   ├── service/          # Business logic
│   │   │   │   ├── security/         # JWT, UserDetails
│   │   │   │   ├── exception/        # Custom exceptions
│   │   │   │   └── SkillBridgeApplication.java
│   │   │   └── resources/
│   │   │       ├── application.properties
│   │   │       └── data.sql          # Seed data
│   │   └── test/                     # Unit & integration tests
│   └── pom.xml
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   ├── pages/              # Page components
│   │   ├── services/           # API client
│   │   ├── context/            # React Context
│   │   ├── hooks/              # Custom hooks
│   │   ├── utils/              # Utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                       # Documentation
│   ├── API.md                  # API documentation
│   ├── SETUP.md                # Setup instructions
│   └── ARCHITECTURE.md         # Detailed architecture
└── README.md
```

## 🚦 Getting Started

See [SETUP.md](./docs/SETUP.md) for detailed setup instructions.

### Quick Start

#### Prerequisites
- Java 17+
- Node.js 18+
- PostgreSQL 15+
- Maven 3.8+

#### Backend Setup
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs on `http://localhost:8080`

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`

## 📚 API Documentation

Once the backend is running, access Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

See [docs/API.md](./docs/API.md) for detailed API documentation.

## 🧪 Testing

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🗺️ Roadmap

### MVP (Phase 1) - Weeks 1-8
- ✅ Core authentication and authorization
- ✅ Employee skill profile management
- ✅ Skill catalog management
- ✅ Role/project requirements
- ✅ Basic gap analysis
- ✅ Learning resource recommendations
- ✅ Three main dashboards

### Phase 2 - Future Enhancements
- 🔄 Manager validation of employee skills
- 🔄 Skill endorsements (peer validation)
- 🔄 Advanced analytics (trends, predictions)
- 🔄 Integration with HR systems (HRIS)
- 🔄 Automated skill extraction from resumes
- 🔄 Gamification (badges, leaderboards)
- 🔄 Notification system
- 🔄 Export reports (PDF, Excel)
- 🔄 Advanced search and filtering
- 🔄 Skill path visualization

## 👨‍💻 Development Guidelines

### Code Style
- Follow Java naming conventions (PascalCase for classes, camelCase for methods)
- Use meaningful variable and method names
- Keep methods focused and small
- Write self-documenting code with comments for complex logic

### Git Workflow
- Use feature branches
- Write descriptive commit messages
- Review code before merging

### Security Best Practices
- Never commit secrets or credentials
- Use environment variables for configuration
- Validate all user inputs
- Implement proper error handling

## 📄 License

Internal use only - [Company Name]

## 🤝 Contributing

This is an internal project. For questions or contributions, contact the development team.

---

**Built with ❤️ for better skill management**
