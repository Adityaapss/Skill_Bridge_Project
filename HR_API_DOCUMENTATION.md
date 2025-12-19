# SkillBridge HR API Documentation

**Version:** 1.0  
**Base URL:** `/api`  
**Authentication:** JWT Bearer Token (Required for all endpoints except `/auth/login` and `/auth/health`)

---

## Table of Contents
1. [Authentication APIs](#1-authentication-apis)
2. [Employee Management APIs](#2-employee-management-apis)
3. [Skill Approval Workflow APIs](#3-skill-approval-workflow-apis)
4. [Project Management APIs](#4-project-management-apis)
5. [Analytics & Gap Analysis APIs](#5-analytics--gap-analysis-apis)

---

## 1. Authentication APIs

### 1.1 Login
**Endpoint:** `POST /api/auth/login`  
**Access:** Public  
**Description:** Authenticates a user with email and password, returns JWT token for subsequent API calls.

**How it works:**
1. User submits email and password
2. Backend validates credentials against encrypted password in database
3. If valid, generates JWT token containing user ID, email, and role
4. Returns token and user details

**Request Body:**
```json
{
  "email": "john.doe@company.com",
  "password": "securePassword123"
}
```

**Response Schema (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "id": 1,
  "email": "john.doe@company.com",
  "name": "John Doe",
  "role": "HR_ADMIN",
  "jobTitle": "HR Manager",
  "department": "Human Resources"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing email or password

---

### 1.2 Get Current User
**Endpoint:** `GET /api/auth/me`  
**Access:** All authenticated users  
**Description:** Retrieves the profile information of the currently logged-in user based on JWT token.

**How it works:**
1. Extracts email from JWT token in Authorization header
2. Fetches employee details from database
3. Removes password field before returning
4. Returns complete employee profile

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response Schema (200 OK):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@company.com",
  "password": null,
  "role": "HR_ADMIN",
  "jobTitle": "HR Manager",
  "department": "Human Resources",
  "location": "New York",
  "managerId": null,
  "createdAt": "2025-01-15T10:30:00",
  "updatedAt": "2025-01-15T10:30:00"
}
```

---

### 1.3 Health Check
**Endpoint:** `GET /api/auth/health`  
**Access:** Public  
**Description:** Simple endpoint to verify if the API server is running and responsive.

**Response Schema (200 OK):**
```json
"SkillBridge API is running"
```

---

## 2. Employee Management APIs

### 2.1 Get All Employees
**Endpoint:** `GET /api/employees`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Retrieves a complete list of all employees in the organization. Passwords are excluded from the response for security.

**How it works:**
1. Verifies user has HR_ADMIN or MANAGER role
2. Fetches all employee records from database
3. Iterates through list and sets password field to null
4. Returns sanitized employee list

**Response Schema (200 OK):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@company.com",
    "password": null,
    "role": "HR_ADMIN",
    "jobTitle": "HR Manager",
    "department": "Human Resources",
    "location": "New York",
    "managerId": null,
    "createdAt": "2025-01-15T10:30:00",
    "updatedAt": "2025-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": null,
    "role": "EMPLOYEE",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "location": "San Francisco",
    "managerId": 5,
    "createdAt": "2025-01-10T09:00:00",
    "updatedAt": "2025-01-10T09:00:00"
  }
]
```

**Error Responses:**
- `403 Forbidden` - User doesn't have required role

---

### 2.2 Get Employee by ID
**Endpoint:** `GET /api/employees/{id}`  
**Access:** All authenticated users  
**Description:** Retrieves detailed information about a specific employee by their unique ID.

**How it works:**
1. Accepts employee ID as path parameter
2. Queries database for employee with matching ID
3. Removes password from response
4. Returns employee details or 404 if not found

**Path Parameters:**
- `id` (Long) - Employee ID

**Response Schema (200 OK):**
```json
{
  "id": 2,
  "name": "Jane Smith",
  "email": "jane.smith@company.com",
  "password": null,
  "role": "EMPLOYEE",
  "jobTitle": "Software Engineer",
  "department": "Engineering",
  "location": "San Francisco",
  "managerId": 5,
  "createdAt": "2025-01-10T09:00:00",
  "updatedAt": "2025-01-10T09:00:00"
}
```

**Error Responses:**
- `404 Not Found` - Employee with given ID doesn't exist

---

### 2.3 Create Employee
**Endpoint:** `POST /api/employees`  
**Access:** HR_ADMIN only  
**Description:** Creates a new employee account in the system. This is typically used during onboarding.

**How it works:**
1. Validates that email doesn't already exist
2. Encrypts the password using BCrypt
3. Saves employee record to database
4. Returns created employee (without password)

**Request Body:**
```json
{
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "password": "initialPassword123",
  "role": "EMPLOYEE",
  "jobTitle": "Data Analyst",
  "department": "Analytics",
  "location": "Boston",
  "managerId": 3
}
```

**Response Schema (201 Created):**
```json
{
  "id": 15,
  "name": "Alice Johnson",
  "email": "alice.johnson@company.com",
  "password": null,
  "role": "EMPLOYEE",
  "jobTitle": "Data Analyst",
  "department": "Analytics",
  "location": "Boston",
  "managerId": 3,
  "createdAt": "2025-12-18T15:30:00",
  "updatedAt": "2025-12-18T15:30:00"
}
```

**Error Responses:**
- `400 Bad Request` - Email already exists or validation failed
- `403 Forbidden` - User is not HR_ADMIN

---

### 2.4 Update Employee
**Endpoint:** `PUT /api/employees/{id}`  
**Access:** HR_ADMIN only  
**Description:** Updates an existing employee's information. Can update name, email, role, department, and optionally password.

**How it works:**
1. Fetches existing employee by ID
2. Updates provided fields (name, email, role, department, location, managerId)
3. If password is provided, encrypts it before updating
4. Saves updated employee to database
5. Returns updated employee details

**Path Parameters:**
- `id` (Long) - Employee ID to update

**Request Body:**
```json
{
  "name": "Alice Johnson-Smith",
  "email": "alice.johnson@company.com",
  "role": "MANAGER",
  "jobTitle": "Senior Data Analyst",
  "department": "Analytics",
  "location": "Boston",
  "managerId": 3,
  "password": "newPassword456"
}
```

**Response Schema (200 OK):**
```json
{
  "id": 15,
  "name": "Alice Johnson-Smith",
  "email": "alice.johnson@company.com",
  "password": null,
  "role": "MANAGER",
  "jobTitle": "Senior Data Analyst",
  "department": "Analytics",
  "location": "Boston",
  "managerId": 3,
  "createdAt": "2025-12-18T15:30:00",
  "updatedAt": "2025-12-18T16:45:00"
}
```

**Error Responses:**
- `404 Not Found` - Employee doesn't exist
- `403 Forbidden` - User is not HR_ADMIN

---

### 2.5 Delete Employee
**Endpoint:** `DELETE /api/employees/{id}`  
**Access:** HR_ADMIN only  
**Description:** Permanently deletes an employee account from the system. Use with caution.

**How it works:**
1. Fetches employee by ID to verify existence
2. Deletes employee record from database
3. Returns 204 No Content on success

**Path Parameters:**
- `id` (Long) - Employee ID to delete

**Response Schema (204 No Content):**
```
(Empty response body)
```

**Error Responses:**
- `404 Not Found` - Employee doesn't exist
- `403 Forbidden` - User is not HR_ADMIN

---

### 2.6 Get Employees by Department
**Endpoint:** `GET /api/employees/department/{department}`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Retrieves all employees belonging to a specific department.

**How it works:**
1. Accepts department name as path parameter
2. Queries database for all employees in that department
3. Removes passwords from all employee records
4. Returns filtered list

**Path Parameters:**
- `department` (String) - Department name (e.g., "Engineering", "Sales")

**Response Schema (200 OK):**
```json
[
  {
    "id": 2,
    "name": "Jane Smith",
    "email": "jane.smith@company.com",
    "password": null,
    "role": "EMPLOYEE",
    "jobTitle": "Software Engineer",
    "department": "Engineering",
    "location": "San Francisco",
    "managerId": 5,
    "createdAt": "2025-01-10T09:00:00",
    "updatedAt": "2025-01-10T09:00:00"
  },
  {
    "id": 7,
    "name": "Bob Wilson",
    "email": "bob.wilson@company.com",
    "password": null,
    "role": "EMPLOYEE",
    "jobTitle": "DevOps Engineer",
    "department": "Engineering",
    "location": "Austin",
    "managerId": 5,
    "createdAt": "2025-01-12T11:00:00",
    "updatedAt": "2025-01-12T11:00:00"
  }
]
```

---

### 2.7 Get Employees by Role
**Endpoint:** `GET /api/employees/role/{role}`  
**Access:** HR_ADMIN only  
**Description:** Retrieves all employees with a specific role (EMPLOYEE, MANAGER, or HR_ADMIN).

**How it works:**
1. Accepts role enum value as path parameter
2. Queries database for employees with matching role
3. Sanitizes password fields
4. Returns filtered employee list

**Path Parameters:**
- `role` (Enum) - One of: `EMPLOYEE`, `MANAGER`, `HR_ADMIN`

**Response Schema (200 OK):**
```json
[
  {
    "id": 3,
    "name": "Sarah Manager",
    "email": "sarah.manager@company.com",
    "password": null,
    "role": "MANAGER",
    "jobTitle": "Engineering Manager",
    "department": "Engineering",
    "location": "Seattle",
    "managerId": null,
    "createdAt": "2025-01-08T08:00:00",
    "updatedAt": "2025-01-08T08:00:00"
  }
]
```

---

### 2.8 Get Employee Dashboard
**Endpoint:** `GET /api/employees/{id}/dashboard`  
**Access:** All authenticated users  
**Description:** Retrieves comprehensive dashboard data for an employee including approved skills count and assigned projects with team members.

**How it works:**
1. Fetches employee details by ID
2. Counts only APPROVED skills (excludes PENDING and REJECTED)
3. Retrieves all active project assignments
4. For each project, fetches project details and all team members
5. Assembles complete dashboard with nested data
6. Returns dashboard DTO

**Path Parameters:**
- `id` (Long) - Employee ID

**Response Schema (200 OK):**
```json
{
  "employeeId": 2,
  "employeeName": "Jane Smith",
  "approvedSkillsCount": 12,
  "assignedProjects": [
    {
      "projectId": 5,
      "projectName": "E-Commerce Platform Redesign",
      "description": "Complete overhaul of the customer-facing platform",
      "techStack": ["React", "Node.js", "PostgreSQL", "AWS"],
      "startDate": "2025-01-15",
      "status": "ONGOING",
      "teamMembers": [
        {
          "employeeId": 2,
          "name": "Jane Smith",
          "email": "jane.smith@company.com",
          "role": "EMPLOYEE",
          "department": "Engineering"
        },
        {
          "employeeId": 7,
          "name": "Bob Wilson",
          "email": "bob.wilson@company.com",
          "role": "EMPLOYEE",
          "department": "Engineering"
        }
      ]
    }
  ]
}
```

---

## 3. Skill Approval Workflow APIs

### 3.1 Get Employee Skills
**Endpoint:** `GET /api/employees/{employeeId}/skills`  
**Access:** All authenticated users  
**Description:** Retrieves all skills for a specific employee with their approval status, proficiency levels, and metadata.

**How it works:**
1. Fetches all employee skills from database
2. Joins with skill master data to get skill names and categories
3. Includes approval workflow fields (status, approver, rejection reason)
4. Returns complete skill list with all metadata

**Path Parameters:**
- `employeeId` (Long) - Employee ID

**Response Schema (200 OK):**
```json
[
  {
    "id": 45,
    "employeeId": 2,
    "skillId": 10,
    "skillName": "React",
    "skillCategory": "Frontend",
    "proficiencyLevel": 4,
    "interestLevel": 5,
    "yearsExperience": 3.5,
    "lastUsedDate": "2025-12-15",
    "source": "SELF_ASSESSMENT",
    "createdAt": "2025-12-01T10:00:00",
    "updatedAt": "2025-12-05T14:30:00",
    "approvalStatus": "APPROVED",
    "approvedBy": 5,
    "approvedByName": "Sarah Manager",
    "approvedAt": "2025-12-05T14:30:00",
    "rejectionReason": null
  },
  {
    "id": 46,
    "employeeId": 2,
    "skillId": 15,
    "skillName": "Kubernetes",
    "skillCategory": "DevOps",
    "proficiencyLevel": 2,
    "interestLevel": 4,
    "yearsExperience": 0.5,
    "lastUsedDate": "2025-12-10",
    "source": "SELF_ASSESSMENT",
    "createdAt": "2025-12-10T09:00:00",
    "updatedAt": "2025-12-10T09:00:00",
    "approvalStatus": "PENDING",
    "approvedBy": null,
    "approvedByName": null,
    "approvedAt": null,
    "rejectionReason": null
  },
  {
    "id": 47,
    "employeeId": 2,
    "skillId": 20,
    "skillName": "Machine Learning",
    "skillCategory": "AI/ML",
    "proficiencyLevel": 3,
    "interestLevel": 5,
    "yearsExperience": 1.0,
    "lastUsedDate": "2025-11-30",
    "source": "SELF_ASSESSMENT",
    "createdAt": "2025-11-28T11:00:00",
    "updatedAt": "2025-12-02T16:00:00",
    "approvalStatus": "REJECTED",
    "approvedBy": 5,
    "approvedByName": "Sarah Manager",
    "approvedAt": null,
    "rejectionReason": "Insufficient evidence of practical experience. Please complete ML certification first."
  }
]
```

**Field Descriptions:**
- `approvalStatus`: One of `PENDING`, `APPROVED`, `REJECTED`
- `proficiencyLevel`: 1-5 scale (1=Beginner, 5=Expert)
- `interestLevel`: 1-5 scale (1=Low interest, 5=High interest)
- `source`: How skill was added (`SELF_ASSESSMENT`, `MANAGER_ASSIGNED`, `HR_VERIFIED`)

---

### 3.2 Get All Employee Skills (Including Rejected)
**Endpoint:** `GET /api/employees/{employeeId}/skills/all`  
**Access:** All authenticated users  
**Description:** Same as 3.1 - retrieves all skills regardless of approval status.

**Response Schema:** Same as 3.1

---

### 3.3 Add Employee Skill
**Endpoint:** `POST /api/employees/{employeeId}/skills`  
**Access:** All authenticated users  
**Description:** Allows an employee to add a new skill to their profile. The skill is created with PENDING status and requires manager/HR approval.

**How it works:**
1. Validates skill exists in master skill catalog
2. Checks if employee already has this skill
3. Creates new EmployeeSkill record with status = PENDING
4. Saves to database
5. Returns created skill DTO

**Path Parameters:**
- `employeeId` (Long) - Employee ID

**Request Body:**
```json
{
  "skillId": 25,
  "proficiencyLevel": 3,
  "interestLevel": 4,
  "yearsExperience": 2.0,
  "lastUsedDate": "2025-12-15",
  "source": "SELF_ASSESSMENT"
}
```

**Response Schema (201 Created):**
```json
{
  "id": 48,
  "employeeId": 2,
  "skillId": 25,
  "skillName": "Docker",
  "skillCategory": "DevOps",
  "proficiencyLevel": 3,
  "interestLevel": 4,
  "yearsExperience": 2.0,
  "lastUsedDate": "2025-12-15",
  "source": "SELF_ASSESSMENT",
  "createdAt": "2025-12-18T15:30:00",
  "updatedAt": "2025-12-18T15:30:00",
  "approvalStatus": "PENDING",
  "approvedBy": null,
  "approvedByName": null,
  "approvedAt": null,
  "rejectionReason": null
}
```

---

### 3.4 Update Employee Skill
**Endpoint:** `PUT /api/employees/{employeeId}/skills/{skillId}`  
**Access:** All authenticated users  
**Description:** Updates an existing skill's proficiency, interest level, or experience. Updating may reset approval status to PENDING.

**How it works:**
1. Fetches existing employee skill record
2. Updates provided fields
3. May reset approval status based on business rules
4. Saves updated record
5. Returns updated skill DTO

**Path Parameters:**
- `employeeId` (Long) - Employee ID
- `skillId` (Long) - Skill ID to update

**Request Body:**
```json
{
  "proficiencyLevel": 4,
  "interestLevel": 5,
  "yearsExperience": 2.5,
  "lastUsedDate": "2025-12-18"
}
```

**Response Schema (200 OK):**
```json
{
  "id": 48,
  "employeeId": 2,
  "skillId": 25,
  "skillName": "Docker",
  "skillCategory": "DevOps",
  "proficiencyLevel": 4,
  "interestLevel": 5,
  "yearsExperience": 2.5,
  "lastUsedDate": "2025-12-18",
  "source": "SELF_ASSESSMENT",
  "createdAt": "2025-12-18T15:30:00",
  "updatedAt": "2025-12-18T16:00:00",
  "approvalStatus": "PENDING",
  "approvedBy": null,
  "approvedByName": null,
  "approvedAt": null,
  "rejectionReason": null
}
```

---

### 3.5 Delete Employee Skill
**Endpoint:** `DELETE /api/employees/{employeeId}/skills/{skillId}`  
**Access:** All authenticated users  
**Description:** Removes a skill from an employee's profile permanently.

**How it works:**
1. Validates employee skill exists
2. Deletes record from database
3. Returns 204 No Content

**Path Parameters:**
- `employeeId` (Long) - Employee ID
- `skillId` (Long) - Skill ID to delete

**Response Schema (204 No Content):**
```
(Empty response body)
```

---

### 3.6 Get Pending Skills for Manager
**Endpoint:** `GET /api/employees/{employeeId}/skills/pending/manager/{managerId}`  
**Access:** MANAGER, HR_ADMIN  
**Description:** Retrieves all pending skill approval requests for employees reporting to a specific manager. This is the primary endpoint for the skill approval dashboard.

**How it works:**
1. Fetches all employees who report to the given manager (managerId field)
2. For each employee, finds skills with PENDING approval status
3. Joins with employee and skill data
4. Returns comprehensive list with employee context

**Path Parameters:**
- `managerId` (Long) - Manager's employee ID

**Response Schema (200 OK):**
```json
[
  {
    "id": 48,
    "employeeId": 2,
    "employeeName": "Jane Smith",
    "employeeEmail": "jane.smith@company.com",
    "skillId": 25,
    "skillName": "Docker",
    "skillCategory": "DevOps",
    "proficiencyLevel": 3,
    "interestLevel": 4,
    "yearsExperience": 2.0,
    "lastUsedDate": "2025-12-15",
    "source": "SELF_ASSESSMENT",
    "submittedAt": "2025-12-18T15:30:00",
    "approvalStatus": "PENDING"
  },
  {
    "id": 49,
    "employeeId": 7,
    "employeeName": "Bob Wilson",
    "employeeEmail": "bob.wilson@company.com",
    "skillId": 30,
    "skillName": "GraphQL",
    "skillCategory": "Backend",
    "proficiencyLevel": 2,
    "interestLevel": 3,
    "yearsExperience": 0.5,
    "lastUsedDate": "2025-12-10",
    "source": "SELF_ASSESSMENT",
    "submittedAt": "2025-12-17T10:00:00",
    "approvalStatus": "PENDING"
  }
]
```

---

### 3.7 Approve Skill
**Endpoint:** `POST /api/employees/{employeeId}/skills/{skillId}/approve`  
**Access:** MANAGER, HR_ADMIN  
**Description:** Approves a pending skill request. Updates the skill status to APPROVED and records who approved it and when.

**How it works:**
1. Fetches employee skill record
2. Validates current status is PENDING
3. Updates status to APPROVED
4. Records approver ID and approval timestamp
5. Saves updated record
6. May trigger notifications to employee

**Path Parameters:**
- `employeeId` (Long) - Employee ID
- `skillId` (Long) - Skill ID to approve

**Request Body:**
```json
{
  "managerId": 5
}
```

**Response Schema (200 OK):**
```
(Empty response body)
```

**Side Effects:**
- Skill becomes visible in employee's approved skills
- Counts toward skill gap analysis
- May trigger skill-based project recommendations

---

### 3.8 Reject Skill
**Endpoint:** `POST /api/employees/{employeeId}/skills/{skillId}/reject`  
**Access:** MANAGER, HR_ADMIN  
**Description:** Rejects a pending skill request with a mandatory reason. The skill status is set to REJECTED and the employee can see the rejection reason.

**How it works:**
1. Fetches employee skill record
2. Validates current status is PENDING
3. Updates status to REJECTED
4. Records approver ID (as rejector)
5. Stores rejection reason
6. Saves updated record
7. May trigger notification to employee with reason

**Path Parameters:**
- `employeeId` (Long) - Employee ID
- `skillId` (Long) - Skill ID to reject

**Request Body:**
```json
{
  "managerId": 5,
  "rejectionReason": "Proficiency level seems inflated. Please provide certification or project evidence before resubmitting."
}
```

**Response Schema (200 OK):**
```
(Empty response body)
```

**Side Effects:**
- Employee can view rejection reason
- Skill does not count in approved skills
- Employee can update and resubmit

---

## 4. Project Management APIs

### 4.1 Get All Projects
**Endpoint:** `GET /api/projects`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Retrieves all active projects in the system with their details and assigned employees.

**How it works:**
1. Fetches all projects marked as active
2. For each project, loads assigned employees
3. Includes allocation type (BILLABLE, NON_BILLABLE, INVESTMENT)
4. Returns complete project list with team information

**Response Schema (200 OK):**
```json
[
  {
    "id": 5,
    "name": "E-Commerce Platform Redesign",
    "description": "Complete overhaul of the customer-facing platform",
    "techStack": ["React", "Node.js", "PostgreSQL", "AWS"],
    "startDate": "2025-01-15",
    "expectedStartDate": null,
    "endDate": "2025-06-30",
    "status": "ONGOING",
    "active": true,
    "ownerId": 3,
    "assignedEmployees": [
      {
        "id": 12,
        "employeeId": 2,
        "name": "Jane Smith",
        "email": "jane.smith@company.com",
        "role": "EMPLOYEE",
        "startDate": "2025-01-15",
        "endDate": "2025-06-30",
        "allocationType": "BILLABLE"
      },
      {
        "id": 13,
        "employeeId": 7,
        "name": "Bob Wilson",
        "email": "bob.wilson@company.com",
        "role": "EMPLOYEE",
        "startDate": "2025-01-15",
        "endDate": "2025-06-30",
        "allocationType": "BILLABLE"
      }
    ]
  }
]
```

**Field Descriptions:**
- `status`: One of `UPCOMING`, `ONGOING`, `COMPLETED`, `ON_HOLD`
- `allocationType`: `BILLABLE` (client-paid), `NON_BILLABLE` (internal), `INVESTMENT` (R&D)

---

### 4.2 Get Ongoing Projects
**Endpoint:** `GET /api/projects/ongoing`  
**Access:** All authenticated users  
**Description:** Retrieves only projects with status ONGOING.

**How it works:**
1. Filters projects by status = ONGOING
2. Returns project list with same structure as 4.1

**Response Schema:** Same as 4.1, but filtered to ONGOING projects only

---

### 4.3 Get Upcoming Projects
**Endpoint:** `GET /api/projects/upcoming`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Retrieves projects that are planned but not yet started (status = UPCOMING).

**How it works:**
1. Filters projects by status = UPCOMING
2. Useful for resource planning and allocation
3. Returns project list

**Response Schema:** Same as 4.1, but filtered to UPCOMING projects

---

### 4.4 Get Project by ID
**Endpoint:** `GET /api/projects/{id}`  
**Access:** All authenticated users  
**Description:** Retrieves detailed information about a specific project including all team members and their allocation types.

**Path Parameters:**
- `id` (Long) - Project ID

**Response Schema (200 OK):**
```json
{
  "id": 5,
  "name": "E-Commerce Platform Redesign",
  "description": "Complete overhaul of the customer-facing platform with modern tech stack",
  "techStack": ["React", "Node.js", "PostgreSQL", "AWS", "Docker"],
  "startDate": "2025-01-15",
  "expectedStartDate": null,
  "endDate": "2025-06-30",
  "status": "ONGOING",
  "active": true,
  "ownerId": 3,
  "assignedEmployees": [
    {
      "id": 12,
      "employeeId": 2,
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "role": "EMPLOYEE",
      "startDate": "2025-01-15",
      "endDate": "2025-06-30",
      "allocationType": "BILLABLE"
    }
  ]
}
```

---

### 4.5 Create Project
**Endpoint:** `POST /api/projects`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Creates a new project in the system. Project starts with UPCOMING status.

**How it works:**
1. Validates project data
2. Sets status to UPCOMING
3. Sets active = true
4. Records project owner (creator)
5. Saves project to database
6. Returns created project

**Request Body:**
```json
{
  "name": "Mobile App Development",
  "description": "Native iOS and Android apps for customer engagement",
  "techStack": ["React Native", "Firebase", "TypeScript"],
  "expectedStartDate": "2025-02-01",
  "endDate": "2025-08-31"
}
```

**Response Schema (201 Created):**
```json
{
  "id": 8,
  "name": "Mobile App Development",
  "description": "Native iOS and Android apps for customer engagement",
  "techStack": ["React Native", "Firebase", "TypeScript"],
  "startDate": null,
  "expectedStartDate": "2025-02-01",
  "endDate": "2025-08-31",
  "status": "UPCOMING",
  "active": true,
  "ownerId": 1,
  "assignedEmployees": []
}
```

---

### 4.6 Update Project
**Endpoint:** `PUT /api/projects/{id}`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Updates an existing project's details including name, description, tech stack, and dates.

**How it works:**
1. Fetches existing project
2. Updates provided fields
3. Preserves employee assignments
4. Saves updated project
5. Returns updated project DTO

**Path Parameters:**
- `id` (Long) - Project ID to update

**Request Body:**
```json
{
  "name": "Mobile App Development - Phase 1",
  "description": "Native iOS and Android apps - MVP release",
  "techStack": ["React Native", "Firebase", "TypeScript", "Redux"],
  "expectedStartDate": "2025-02-15",
  "endDate": "2025-09-30"
}
```

**Response Schema (200 OK):**
```json
{
  "id": 8,
  "name": "Mobile App Development - Phase 1",
  "description": "Native iOS and Android apps - MVP release",
  "techStack": ["React Native", "Firebase", "TypeScript", "Redux"],
  "startDate": null,
  "expectedStartDate": "2025-02-15",
  "endDate": "2025-09-30",
  "status": "UPCOMING",
  "active": true,
  "ownerId": 1,
  "assignedEmployees": []
}
```

---

### 4.7 Delete Project
**Endpoint:** `DELETE /api/projects/{id}`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Soft deletes a project by setting active = false. Project data is retained for historical purposes.

**How it works:**
1. Fetches project by ID
2. Sets active = false
3. Saves updated project
4. Returns 204 No Content

**Path Parameters:**
- `id` (Long) - Project ID to delete

**Response Schema (204 No Content):**
```
(Empty response body)
```

---

### 4.8 Start Project
**Endpoint:** `POST /api/projects/{id}/start`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Transitions a project from UPCOMING to ONGOING status and assigns initial team members with their allocation types.

**How it works:**
1. Validates project status is UPCOMING
2. Updates status to ONGOING
3. Sets actual startDate to current date
4. Creates ProjectAssignment records for each employee
5. Records allocation type for each assignment
6. Returns updated project with team

**Path Parameters:**
- `id` (Long) - Project ID to start

**Request Body:**
```json
{
  "employeeIds": [2, 7, 10],
  "allocationType": "BILLABLE"
}
```

**Response Schema (200 OK):**
```json
{
  "id": 8,
  "name": "Mobile App Development - Phase 1",
  "description": "Native iOS and Android apps - MVP release",
  "techStack": ["React Native", "Firebase", "TypeScript", "Redux"],
  "startDate": "2025-12-18",
  "expectedStartDate": "2025-02-15",
  "endDate": "2025-09-30",
  "status": "ONGOING",
  "active": true,
  "ownerId": 1,
  "assignedEmployees": [
    {
      "id": 25,
      "employeeId": 2,
      "name": "Jane Smith",
      "email": "jane.smith@company.com",
      "role": "EMPLOYEE",
      "startDate": "2025-12-18",
      "endDate": "2025-09-30",
      "allocationType": "BILLABLE"
    },
    {
      "id": 26,
      "employeeId": 7,
      "name": "Bob Wilson",
      "email": "bob.wilson@company.com",
      "role": "EMPLOYEE",
      "startDate": "2025-12-18",
      "endDate": "2025-09-30",
      "allocationType": "BILLABLE"
    }
  ]
}
```

---

### 4.9 Assign Employee to Project
**Endpoint:** `POST /api/projects/{id}/assign`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Assigns an employee to an existing project with a specific allocation type.

**How it works:**
1. Validates project and employee exist
2. Checks employee isn't already assigned
3. Creates ProjectAssignment record
4. Sets allocation type (BILLABLE, NON_BILLABLE, or INVESTMENT)
5. Sets assignment dates based on project dates
6. Saves assignment

**Path Parameters:**
- `id` (Long) - Project ID

**Request Body:**
```json
{
  "employeeId": 15,
  "allocationType": "NON_BILLABLE"
}
```

**Response Schema (200 OK):**
```
(Empty response body)
```

**Side Effects:**
- Employee sees project in their dashboard
- Project team count increases
- Resource allocation tracking updated

---

### 4.10 Unassign Employee from Project
**Endpoint:** `POST /api/projects/{id}/unassign`  
**Access:** HR_ADMIN, MANAGER  
**Description:** Removes an employee from a project by setting their assignment to inactive.

**How it works:**
1. Finds ProjectAssignment record
2. Sets active = false
3. Sets endDate to current date
4. Saves updated assignment
5. Employee no longer sees project in dashboard

**Path Parameters:**
- `id` (Long) - Project ID

**Request Body:**
```json
{
  "employeeId": 15
}
```

**Response Schema (200 OK):**
```
(Empty response body)
```

---

## 5. Analytics & Gap Analysis APIs

### 5.1 Get Employee Gap Analysis
**Endpoint:** `GET /api/analytics/employee/{employeeId}/gap`  
**Access:** All authenticated users  
**Description:** Analyzes skill gaps between an employee's current skills and the requirements of a specific role or project. Returns detailed breakdown of matching skills, skill gaps, and missing skills.

**How it works:**
1. Fetches employee's APPROVED skills
2. Fetches required skills for the target role/project
3. Compares employee skills vs requirements
4. Categorizes into:
   - **Matches**: Employee meets or exceeds requirement
   - **Gaps**: Employee has skill but below required level
   - **Missing**: Employee doesn't have required skill
5. Calculates overall match score (percentage)
6. Returns comprehensive analysis

**Path Parameters:**
- `employeeId` (Long) - Employee ID

**Query Parameters:**
- `roleProjectId` (Long, required) - ID of role or project to analyze against

**Example Request:**
```
GET /api/analytics/employee/2/gap?roleProjectId=5
```

**Response Schema (200 OK):**
```json
{
  "employeeId": 2,
  "employeeName": "Jane Smith",
  "roleProjectId": 5,
  "roleProjectName": "Senior Full Stack Developer",
  "matchScore": 75.5,
  "matches": [
    {
      "skillId": 10,
      "skillName": "React",
      "requiredLevel": 4,
      "currentLevel": 5,
      "importance": "MUST_HAVE"
    },
    {
      "skillId": 12,
      "skillName": "Node.js",
      "requiredLevel": 3,
      "currentLevel": 4,
      "importance": "MUST_HAVE"
    }
  ],
  "gaps": [
    {
      "skillId": 15,
      "skillName": "Kubernetes",
      "skillCategory": "DevOps",
      "requiredLevel": 4,
      "currentLevel": 2,
      "gap": 2,
      "importance": "SHOULD_HAVE"
    },
    {
      "skillId": 18,
      "skillName": "System Design",
      "skillCategory": "Architecture",
      "requiredLevel": 4,
      "currentLevel": 3,
      "gap": 1,
      "importance": "MUST_HAVE"
    }
  ],
  "missing": [
    {
      "skillId": 25,
      "skillName": "Microservices Architecture",
      "skillCategory": "Architecture",
      "requiredLevel": 4,
      "currentLevel": 0,
      "gap": 4,
      "importance": "MUST_HAVE"
    }
  ]
}
```

**Field Descriptions:**
- `matchScore`: Percentage (0-100) indicating overall skill match
- `importance`: `MUST_HAVE`, `SHOULD_HAVE`, or `NICE_TO_HAVE`
- `gap`: Difference between required and current level
- `currentLevel`: 0 means skill not present

**Use Cases:**
- HR assessing employee readiness for promotion
- Manager evaluating fit for project assignment
- Employee self-assessment for career planning

---

### 5.2 Get Learning Recommendations
**Endpoint:** `GET /api/analytics/employee/{employeeId}/recommendations`  
**Access:** All authenticated users  
**Description:** Provides personalized learning resource recommendations based on skill gaps identified for a specific role or project. Prioritizes gaps by importance and returns curated learning materials.

**How it works:**
1. Performs gap analysis (same as 5.1)
2. Identifies skills with gaps or missing entirely
3. Prioritizes by importance (MUST_HAVE first)
4. For each gap skill, fetches relevant learning resources from database
5. Filters resources by skill level appropriateness
6. Limits results to requested number
7. Returns recommendations with learning paths

**Path Parameters:**
- `employeeId` (Long) - Employee ID

**Query Parameters:**
- `roleProjectId` (Long, required) - Target role/project ID
- `limit` (Integer, optional, default=10) - Maximum recommendations to return

**Example Request:**
```
GET /api/analytics/employee/2/recommendations?roleProjectId=5&limit=5
```

**Response Schema (200 OK):**
```json
[
  {
    "skillId": 25,
    "skillName": "Microservices Architecture",
    "skillCategory": "Architecture",
    "currentLevel": 0,
    "targetLevel": 4,
    "gap": 4,
    "resources": [
      {
        "id": 101,
        "title": "Microservices Patterns and Best Practices",
        "description": "Comprehensive guide to designing and implementing microservices",
        "type": "COURSE",
        "url": "https://learning.company.com/microservices-101",
        "provider": "Udemy",
        "duration": "12 hours",
        "difficulty": "INTERMEDIATE",
        "skillId": 25,
        "skillName": "Microservices Architecture",
        "rating": 4.7,
        "enrollmentCount": 1250
      },
      {
        "id": 102,
        "title": "Building Microservices - Sam Newman",
        "description": "Industry-standard book on microservices architecture",
        "type": "BOOK",
        "url": "https://www.oreilly.com/library/view/building-microservices/",
        "provider": "O'Reilly",
        "duration": null,
        "difficulty": "ADVANCED",
        "skillId": 25,
        "skillName": "Microservices Architecture",
        "rating": 4.8,
        "enrollmentCount": 3400
      }
    ]
  },
  {
    "skillId": 15,
    "skillName": "Kubernetes",
    "skillCategory": "DevOps",
    "currentLevel": 2,
    "targetLevel": 4,
    "gap": 2,
    "resources": [
      {
        "id": 85,
        "title": "Kubernetes for Developers",
        "description": "Hands-on Kubernetes training for application developers",
        "type": "COURSE",
        "url": "https://learning.company.com/k8s-dev",
        "provider": "Pluralsight",
        "duration": "8 hours",
        "difficulty": "INTERMEDIATE",
        "skillId": 15,
        "skillName": "Kubernetes",
        "rating": 4.6,
        "enrollmentCount": 890
      },
      {
        "id": 86,
        "title": "Certified Kubernetes Application Developer (CKAD)",
        "description": "Official certification prep course",
        "type": "CERTIFICATION",
        "url": "https://training.linuxfoundation.org/certification/ckad/",
        "provider": "Linux Foundation",
        "duration": "40 hours",
        "difficulty": "ADVANCED",
        "skillId": 15,
        "skillName": "Kubernetes",
        "rating": 4.9,
        "enrollmentCount": 5600
      }
    ]
  }
]
```

**Field Descriptions:**
- `type`: `COURSE`, `BOOK`, `VIDEO`, `CERTIFICATION`, `TUTORIAL`, `DOCUMENTATION`
- `difficulty`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- `duration`: Estimated time to complete (null for books)
- `rating`: User rating out of 5
- `enrollmentCount`: Number of employees who have used this resource

**Use Cases:**
- Employee creating personal development plan
- Manager assigning training for skill development
- HR planning learning & development budgets
- Automated skill gap closure tracking

---

## Common Response Codes

All endpoints may return these standard HTTP status codes:

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Request successful, no response body
- **400 Bad Request** - Invalid request data or validation error
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User doesn't have required role/permission
- **404 Not Found** - Requested resource doesn't exist
- **500 Internal Server Error** - Server-side error

---

## Authentication Flow

1. **Login**: POST to `/api/auth/login` with credentials
2. **Receive Token**: Get JWT token in response
3. **Use Token**: Include in all subsequent requests:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. **Token Expiry**: Token expires after configured duration (typically 24 hours)
5. **Re-login**: Login again when token expires

---

## Role-Based Access Summary

| Endpoint Category | EMPLOYEE | MANAGER | HR_ADMIN |
|------------------|----------|---------|----------|
| View own data | ✅ | ✅ | ✅ |
| View all employees | ❌ | ✅ | ✅ |
| Create/Update/Delete employees | ❌ | ❌ | ✅ |
| Add own skills | ✅ | ✅ | ✅ |
| Approve/Reject skills | ❌ | ✅ | ✅ |
| View all projects | ❌ | ✅ | ✅ |
| Create/Manage projects | ❌ | ✅ | ✅ |
| Assign employees to projects | ❌ | ✅ | ✅ |
| View analytics | ✅ | ✅ | ✅ |

---

## Data Models Reference

### Employee Roles
- `EMPLOYEE` - Regular employee
- `MANAGER` - Team manager with approval rights
- `HR_ADMIN` - HR administrator with full access

### Approval Status
- `PENDING` - Awaiting manager/HR approval
- `APPROVED` - Verified and approved
- `REJECTED` - Rejected with reason

### Project Status
- `UPCOMING` - Planned, not started
- `ONGOING` - Currently active
- `COMPLETED` - Finished
- `ON_HOLD` - Temporarily paused

### Allocation Types
- `BILLABLE` - Client-paid project work
- `NON_BILLABLE` - Internal projects
- `INVESTMENT` - R&D or innovation projects

### Skill Importance
- `MUST_HAVE` - Critical requirement
- `SHOULD_HAVE` - Important but not critical
- `NICE_TO_HAVE` - Beneficial but optional

---

## Best Practices

1. **Always validate user permissions** before making HR-restricted API calls
2. **Handle token expiry gracefully** by implementing refresh logic
3. **Use pagination** for large employee/project lists (future enhancement)
4. **Cache frequently accessed data** like skill catalogs
5. **Provide meaningful rejection reasons** when rejecting skills
6. **Track allocation types** for accurate resource utilization reporting
7. **Regularly review pending approvals** to avoid bottlenecks
8. **Use gap analysis** before project assignments for better matching

---

## Support & Contact

For API issues or questions:
- **Technical Support**: dev-support@skillbridge.com
- **HR System Admin**: hr-admin@skillbridge.com
- **Documentation**: https://docs.skillbridge.com/api

---

**Last Updated:** December 18, 2025  
**API Version:** 1.0  
**Document Version:** 1.0
