# API Documentation

## Base URL

```
http://localhost:8080/api
```

## Authentication

SkillBridge uses JWT (JSON Web Token) for authentication.

### Authentication Flow

1. **Login**: POST `/auth/login` with credentials
2. **Receive JWT**: Get token in response
3. **Use Token**: Include in `Authorization` header for all subsequent requests

### Header Format

```
Authorization: Bearer <your-jwt-token>
```

---

## API Endpoints

### 🔐 Authentication

#### Login

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "employee@skillbridge.com",
  "password": "employee123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "employee@skillbridge.com",
  "name": "John Doe",
  "role": "EMPLOYEE"
}
```

#### Get Current User

```http
GET /api/auth/me
```

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "employee@skillbridge.com",
  "role": "EMPLOYEE",
  "jobTitle": "Software Engineer",
  "department": "Engineering"
}
```

#### Register (Admin Only)

```http
POST /api/auth/register
```

**Headers:** `Authorization: Bearer <admin-token>`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@skillbridge.com",
  "password": "password123",
  "role": "EMPLOYEE",
  "jobTitle": "Junior Developer",
  "department": "Engineering",
  "managerId": 2
}
```

---

### 👤 Employees

#### Get All Employees

```http
GET /api/employees
```

**Query Parameters:**
- `department` (optional): Filter by department
- `managerId` (optional): Filter by manager

**Response:**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@skillbridge.com",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "location": "New York",
    "managerId": 2,
    "managerName": "Alice Manager"
  }
]
```

#### Get Employee by ID

```http
GET /api/employees/{id}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@skillbridge.com",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "location": "New York",
  "managerId": 2,
  "managerName": "Alice Manager",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

#### Update Employee Profile

```http
PUT /api/employees/{id}
```

**Authorization:** Employee can update own profile, Manager can update team members, HR_ADMIN can update anyone

**Request Body:**
```json
{
  "name": "John Doe",
  "jobTitle": "Senior Software Engineer",
  "department": "Engineering",
  "location": "San Francisco"
}
```

---

### 🎯 Skills

#### Get All Skills

```http
GET /api/skills
```

**Query Parameters:**
- `category` (optional): Filter by category
- `active` (optional): Filter by active status (default: true)

**Response:**
```json
[
  {
    "id": 1,
    "name": "Java",
    "category": "LANGUAGE",
    "description": "Java programming language",
    "active": true
  },
  {
    "id": 2,
    "name": "Spring Boot",
    "category": "FRAMEWORK",
    "description": "Spring Boot framework for Java",
    "active": true
  }
]
```

#### Get Skill by ID

```http
GET /api/skills/{id}
```

#### Create Skill (HR_ADMIN only)

```http
POST /api/skills
```

**Request Body:**
```json
{
  "name": "React",
  "category": "FRAMEWORK",
  "description": "React JavaScript library for building UIs",
  "active": true
}
```

#### Update Skill (HR_ADMIN only)

```http
PUT /api/skills/{id}
```

#### Deactivate Skill (HR_ADMIN only)

```http
DELETE /api/skills/{id}
```

**Note:** This sets `active = false` rather than deleting the record.

---

### 💼 Employee Skills

#### Get Employee Skills

```http
GET /api/employees/{employeeId}/skills
```

**Response:**
```json
[
  {
    "id": 1,
    "employeeId": 1,
    "skillId": 1,
    "skillName": "Java",
    "skillCategory": "LANGUAGE",
    "proficiencyLevel": 3,
    "interestLevel": 3,
    "yearsExperience": 5.0,
    "lastUsedDate": "2024-12-01",
    "source": "SELF_REPORTED"
  }
]
```

#### Add Employee Skill

```http
POST /api/employees/{employeeId}/skills
```

**Authorization:** Employee can add own skills, Manager can add for team members

**Request Body:**
```json
{
  "skillId": 1,
  "proficiencyLevel": 2,
  "interestLevel": 3,
  "yearsExperience": 2.5,
  "lastUsedDate": "2024-11-15",
  "source": "SELF_REPORTED"
}
```

**Proficiency Levels:**
- `0`: None
- `1`: Beginner
- `2`: Intermediate
- `3`: Advanced

#### Update Employee Skill

```http
PUT /api/employees/{employeeId}/skills/{skillId}
```

**Request Body:**
```json
{
  "proficiencyLevel": 3,
  "interestLevel": 3,
  "yearsExperience": 3.0,
  "lastUsedDate": "2024-12-01"
}
```

#### Delete Employee Skill

```http
DELETE /api/employees/{employeeId}/skills/{skillId}
```

---

### 📋 Roles & Projects

#### Get All Roles/Projects

```http
GET /api/roles-projects
```

**Query Parameters:**
- `type` (optional): ROLE or PROJECT
- `ownerId` (optional): Filter by owner (manager)
- `status` (optional): ACTIVE or ARCHIVED

**Response:**
```json
[
  {
    "id": 1,
    "name": "Backend Engineer L2",
    "type": "ROLE",
    "description": "Mid-level backend engineer position",
    "ownerId": 2,
    "ownerName": "Alice Manager",
    "status": "ACTIVE",
    "createdAt": "2024-01-10T09:00:00Z"
  }
]
```

#### Get Role/Project by ID

```http
GET /api/roles-projects/{id}
```

#### Create Role/Project (MANAGER only)

```http
POST /api/roles-projects
```

**Request Body:**
```json
{
  "name": "Frontend Engineer L1",
  "type": "ROLE",
  "description": "Entry-level frontend engineer position",
  "status": "ACTIVE"
}
```

#### Update Role/Project (Owner or HR_ADMIN)

```http
PUT /api/roles-projects/{id}
```

#### Delete Role/Project (Owner or HR_ADMIN)

```http
DELETE /api/roles-projects/{id}
```

---

### 🎯 Role Skill Requirements

#### Get Requirements for Role/Project

```http
GET /api/roles-projects/{roleProjectId}/requirements
```

**Response:**
```json
[
  {
    "id": 1,
    "roleProjectId": 1,
    "skillId": 1,
    "skillName": "Java",
    "skillCategory": "LANGUAGE",
    "requiredLevel": 2,
    "importance": "MUST_HAVE"
  },
  {
    "id": 2,
    "roleProjectId": 1,
    "skillId": 2,
    "skillName": "Spring Boot",
    "skillCategory": "FRAMEWORK",
    "requiredLevel": 2,
    "importance": "MUST_HAVE"
  }
]
```

#### Add Skill Requirement

```http
POST /api/roles-projects/{roleProjectId}/requirements
```

**Request Body:**
```json
{
  "skillId": 3,
  "requiredLevel": 2,
  "importance": "NICE_TO_HAVE"
}
```

**Importance Levels:**
- `MUST_HAVE`: Critical skill
- `NICE_TO_HAVE`: Beneficial but not required

#### Update Skill Requirement

```http
PUT /api/roles-projects/{roleProjectId}/requirements/{skillId}
```

#### Delete Skill Requirement

```http
DELETE /api/roles-projects/{roleProjectId}/requirements/{skillId}
```

---

### 📚 Learning Resources

#### Get All Learning Resources

```http
GET /api/learning-resources
```

**Query Parameters:**
- `skillId` (optional): Filter by skill
- `level` (optional): BEGINNER, INTERMEDIATE, ADVANCED
- `type` (optional): INTERNAL, EXTERNAL
- `isFree` (optional): true/false

**Response:**
```json
[
  {
    "id": 1,
    "title": "Java Fundamentals Course",
    "url": "https://learning.company.com/java-101",
    "type": "INTERNAL",
    "skillId": 1,
    "skillName": "Java",
    "level": "BEGINNER",
    "estimatedDuration": 480,
    "isFree": true,
    "description": "Comprehensive introduction to Java programming"
  }
]
```

#### Get Learning Resource by ID

```http
GET /api/learning-resources/{id}
```

#### Create Learning Resource (HR_ADMIN only)

```http
POST /api/learning-resources
```

**Request Body:**
```json
{
  "title": "Advanced React Patterns",
  "url": "https://egghead.io/courses/advanced-react",
  "type": "EXTERNAL",
  "skillId": 5,
  "level": "ADVANCED",
  "estimatedDuration": 360,
  "isFree": false,
  "description": "Learn advanced React patterns and best practices"
}
```

#### Update Learning Resource (HR_ADMIN only)

```http
PUT /api/learning-resources/{id}
```

#### Delete Learning Resource (HR_ADMIN only)

```http
DELETE /api/learning-resources/{id}
```

---

### 📊 Analytics & Gap Analysis

#### Get Employee Gap Analysis

```http
GET /api/analytics/employee/{employeeId}/gap
```

**Query Parameters:**
- `roleProjectId` (required): Target role or project ID

**Response:**
```json
{
  "employeeId": 1,
  "employeeName": "John Doe",
  "roleProjectId": 1,
  "roleProjectName": "Backend Engineer L2",
  "matchScore": 75.0,
  "gaps": [
    {
      "skillId": 3,
      "skillName": "PostgreSQL",
      "skillCategory": "DATABASE",
      "requiredLevel": 2,
      "currentLevel": 1,
      "gap": 1,
      "importance": "MUST_HAVE"
    }
  ],
  "matches": [
    {
      "skillId": 1,
      "skillName": "Java",
      "requiredLevel": 2,
      "currentLevel": 3,
      "importance": "MUST_HAVE"
    }
  ],
  "missing": [
    {
      "skillId": 4,
      "skillName": "Docker",
      "requiredLevel": 2,
      "importance": "NICE_TO_HAVE"
    }
  ]
}
```

#### Get Recommended Learning Resources for Employee

```http
GET /api/analytics/employee/{employeeId}/recommendations
```

**Query Parameters:**
- `roleProjectId` (optional): Target role/project
- `limit` (optional): Number of recommendations (default: 10)

**Response:**
```json
[
  {
    "skillId": 3,
    "skillName": "PostgreSQL",
    "currentLevel": 1,
    "targetLevel": 2,
    "gap": 1,
    "resources": [
      {
        "id": 5,
        "title": "PostgreSQL for Developers",
        "url": "https://learning.company.com/postgres",
        "type": "INTERNAL",
        "level": "INTERMEDIATE",
        "estimatedDuration": 300,
        "isFree": true
      }
    ]
  }
]
```

#### Get Team Skill Matrix

```http
GET /api/analytics/team/matrix
```

**Query Parameters:**
- `managerId` (optional): Filter by manager (defaults to current user if MANAGER)
- `roleProjectId` (optional): Compare against specific role/project
- `department` (optional): Filter by department

**Response:**
```json
{
  "teamName": "Engineering Team",
  "managerId": 2,
  "managerName": "Alice Manager",
  "roleProjectId": 1,
  "roleProjectName": "Backend Engineer L2",
  "employees": [
    {
      "employeeId": 1,
      "employeeName": "John Doe",
      "skills": [
        {
          "skillId": 1,
          "skillName": "Java",
          "proficiencyLevel": 3,
          "requiredLevel": 2,
          "status": "EXCEEDS"
        },
        {
          "skillId": 3,
          "skillName": "PostgreSQL",
          "proficiencyLevel": 1,
          "requiredLevel": 2,
          "status": "GAP"
        }
      ],
      "matchScore": 75.0
    }
  ],
  "skillCoverage": [
    {
      "skillId": 1,
      "skillName": "Java",
      "requiredLevel": 2,
      "employeesAtLevel": 3,
      "totalEmployees": 5,
      "coveragePercent": 60.0,
      "status": "ADEQUATE"
    },
    {
      "skillId": 3,
      "skillName": "PostgreSQL",
      "requiredLevel": 2,
      "employeesAtLevel": 1,
      "totalEmployees": 5,
      "coveragePercent": 20.0,
      "status": "CRITICAL_GAP"
    }
  ]
}
```

#### Get Organization Gap Analytics (HR_ADMIN only)

```http
GET /api/analytics/organization/gaps
```

**Query Parameters:**
- `department` (optional): Filter by department
- `limit` (optional): Number of top gaps to return (default: 20)

**Response:**
```json
{
  "totalEmployees": 50,
  "totalSkills": 30,
  "topGapSkills": [
    {
      "skillId": 10,
      "skillName": "Kubernetes",
      "category": "CLOUD",
      "requiredCount": 15,
      "proficientCount": 3,
      "gapCount": 12,
      "gapPercent": 80.0
    }
  ],
  "skillDemand": [
    {
      "skillId": 1,
      "skillName": "Java",
      "rolesRequiring": 8,
      "projectsRequiring": 5,
      "totalDemand": 13
    }
  ],
  "departmentGaps": [
    {
      "department": "Engineering",
      "employeeCount": 30,
      "avgMatchScore": 72.5,
      "criticalGaps": 5
    }
  ]
}
```

---

## Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful deletion) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate entry) |
| 500 | Internal Server Error |

---

## Error Response Format

```json
{
  "timestamp": "2024-12-06T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Proficiency level must be between 0 and 3",
  "path": "/api/employees/1/skills"
}
```

---

## Data Enums

### Role
- `EMPLOYEE`
- `MANAGER`
- `HR_ADMIN`

### Skill Category
- `LANGUAGE`
- `FRAMEWORK`
- `CLOUD`
- `DATABASE`
- `SOFT_SKILL`
- `OTHER`

### Proficiency Level
- `0`: None
- `1`: Beginner
- `2`: Intermediate
- `3`: Advanced

### Interest Level
- `0`: Not Interested
- `1`: Slightly Interested
- `2`: Interested
- `3`: Very Interested

### Role/Project Type
- `ROLE`
- `PROJECT`

### Importance
- `MUST_HAVE`
- `NICE_TO_HAVE`

### Resource Type
- `INTERNAL`
- `EXTERNAL`

### Resource Level
- `BEGINNER`
- `INTERMEDIATE`
- `ADVANCED`

### Skill Source
- `SELF_REPORTED`
- `MANAGER_VALIDATED`
- `CERTIFICATION`

---

## Pagination

For endpoints returning lists, pagination is supported:

**Query Parameters:**
- `page`: Page number (0-indexed, default: 0)
- `size`: Page size (default: 20, max: 100)
- `sort`: Sort field and direction (e.g., `name,asc`)

**Response:**
```json
{
  "content": [...],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20
  },
  "totalElements": 100,
  "totalPages": 5,
  "last": false
}
```

---

## Rate Limiting

Currently not implemented in MVP. Consider adding in Phase 2.

---

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:5173` (Vite dev server)
- `http://localhost:3000` (Alternative React dev server)

For production, update CORS configuration in `SecurityConfig.java`.

---

## Testing with Postman

1. Import the Postman collection (if provided)
2. Set environment variable `baseUrl` to `http://localhost:8080/api`
3. Login to get JWT token
4. Set environment variable `token` to the received token
5. Use `{{token}}` in Authorization headers

---

## Swagger/OpenAPI

Interactive API documentation is available at:

```
http://localhost:8080/swagger-ui.html
```

You can test all endpoints directly from the Swagger UI after authenticating.

---

**For implementation details, see the backend source code in `/backend/src/main/java/com/skillbridge/`**
