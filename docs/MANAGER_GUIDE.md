# SkillBridge - Manager's Technical Guide

**Purpose**: Comprehensive guide to understand and explain the SkillBridge application  
**Audience**: Managers, Stakeholders, Technical Leads  
**Last Updated**: 2025-12-18

---

## Table of Contents

1. [Application Overview](#1-application-overview)
2. [Backend Architecture](#2-backend-architecture)
3. [Database Design](#3-database-design)
4. [Frontend Architecture](#4-frontend-architecture)
5. [Key Features Explained](#5-key-features-explained)
6. [API Documentation](#6-api-documentation)
7. [Security & Authentication](#7-security--authentication)
8. [Deployment Guide](#8-deployment-guide)

---

## 1. APPLICATION OVERVIEW

### What is SkillBridge?

SkillBridge is an **Employee Skill Management and Resource Allocation System** designed to:
- Track employee skills and proficiencies
- Manage project resource allocation
- Identify skill gaps
- Recommend learning paths
- Optimize team composition

### Business Value

| Problem | SkillBridge Solution |
|---------|---------------------|
| "We don't know what skills our employees have" | **Skill Catalog** with approval workflow |
| "Hard to find the right person for a project" | **Team Matrix** with advanced filtering |
| "Employees don't know what to learn next" | **Gap Analysis** + **Learning Recommendations** |
| "Can't track billable vs non-billable work" | **Allocation Type Tracking** (Billable/Non-Billable/Investment) |
| "Resource allocation is manual and time-consuming" | **Smart Filtering** + **One-click allocation** |

### User Roles

1. **EMPLOYEE**: Manage own skills, view gaps, access learning resources
2. **MANAGER**: Approve skills, view team matrix, allocate resources
3. **HR_ADMIN**: Full access - manage employees, projects, skills, resources

---

## 2. BACKEND ARCHITECTURE

### 2.1 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | Spring Boot | 3.x | Java web application framework |
| **Language** | Java | 17+ | Programming language |
| **Database** | PostgreSQL | Latest | Relational database |
| **ORM** | Hibernate/JPA | - | Object-Relational Mapping |
| **Security** | Spring Security + JWT | - | Authentication & Authorization |
| **Build Tool** | Maven | - | Dependency management |
| **API Documentation** | Swagger/OpenAPI | - | API documentation |

**Why Spring Boot?**
- Industry standard for enterprise Java applications
- Built-in security, database connectivity, REST API support
- Large ecosystem and community support
- Easy to scale and maintain

### 2.2 Project Structure

```
backend/
├── src/main/java/com/skillbridge/
│   ├── controller/          # REST API endpoints (8 controllers)
│   ├── service/             # Business logic layer
│   ├── repository/          # Database access layer
│   ├── entity/              # Database table models
│   ├── dto/                 # Data Transfer Objects
│   ├── security/            # JWT authentication
│   └── SkillBridgeApplication.java  # Main entry point
├── src/main/resources/
│   ├── application.properties  # Configuration
│   └── data.sql               # Initial data
└── pom.xml                    # Maven dependencies
```

### 2.3 Architecture Layers (MVC Pattern)

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Frontend)                     │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTP/REST
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (REST APIs)                │
│  - Handles HTTP requests                                 │
│  - Validates input                                       │
│  - Returns JSON responses                                │
│  Example: EmployeeController, ProjectController          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              SERVICE LAYER (Business Logic)              │
│  - Core business rules                                   │
│  - Data processing                                       │
│  - Calculations (gap analysis, recommendations)          │
│  Example: EmployeeService, ProjectService                │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          REPOSITORY LAYER (Database Access)              │
│  - CRUD operations                                       │
│  - Custom queries                                        │
│  - JPA/Hibernate                                         │
│  Example: EmployeeRepository, ProjectRepository          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   DATABASE (PostgreSQL)                  │
│  - Stores all application data                          │
│  - 8 main tables                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Q&A Section (To be filled as we discuss)

### Backend Questions & Answers

---

## 📚 TOPIC 1: What Does the Backend Do?

### Q1: What is the backend and what does it do?

**A1**: Think of the backend as the **"brain and engine"** of SkillBridge. While users interact with the frontend (the website they see), the backend handles all the **heavy lifting behind the scenes**.

**The backend is responsible for:**

#### 1. **Data Management** 🗄️
- **Stores** all application data in the database (employees, skills, projects)
- **Retrieves** data when the frontend requests it
- **Updates** data when users make changes
- **Deletes** data when needed

**Example**: When an employee adds a new skill, the backend saves it to the database.

#### 2. **Business Logic** 🧠
- **Enforces business rules** (e.g., new skills must be approved by managers)
- **Performs calculations** (e.g., gap analysis comparing employee skills vs project requirements)
- **Validates data** (e.g., ensuring email addresses are unique)
- **Processes workflows** (e.g., skill approval: PENDING → APPROVED/REJECTED)

**Example**: When calculating skill gaps, the backend compares an employee's skills against a role's requirements and identifies what's missing.

#### 3. **Security & Authentication** 🔒
- **Verifies user identity** (login with email/password)
- **Issues JWT tokens** (like a digital ID card)
- **Controls access** (ensures employees can't access HR-only features)
- **Protects sensitive data** (passwords are encrypted)

**Example**: When you log in, the backend checks your credentials and gives you a token that proves who you are for future requests.

#### 4. **API Endpoints** 🔌
- **Provides 49 REST API endpoints** that the frontend can call
- **Receives requests** from the frontend (e.g., "get all employees")
- **Sends responses** back to the frontend (e.g., list of employees as JSON)

**Example**: When you open the Team Matrix page, the frontend calls `GET /api/employees` and the backend responds with all employee data.

#### 5. **Data Transformation** 🔄
- **Converts database data** into formats the frontend can use (DTOs)
- **Enriches data** (e.g., adding skill names to employee skill records)
- **Filters and sorts** data based on requests

**Example**: The database stores skill IDs, but the backend looks up the skill names and sends both to the frontend.

---

### Q2: Why do we need a separate backend? Why not just use the database directly?

**A2**: Great question! Here's why having a backend is essential:

#### **Security** 🛡️
- **Direct database access is dangerous**: If the frontend connected directly to the database, anyone could inspect the browser code and get database credentials
- **Backend acts as a gatekeeper**: It validates every request and ensures users can only access data they're authorized to see
- **Passwords never reach the frontend**: The backend handles password hashing and verification

#### **Business Logic Centralization** 🎯
- **One source of truth**: All business rules live in one place (the backend)
- **Consistency**: Whether accessed from web, mobile, or API, the same rules apply
- **Easier to maintain**: Change a rule once in the backend, not in multiple places

**Example**: The rule "new skills need manager approval" is enforced by the backend. If we change this rule, we only update the backend code.

#### **Performance** ⚡
- **Complex calculations on the server**: Gap analysis and recommendations run on the powerful server, not the user's browser
- **Efficient database queries**: The backend can optimize queries and cache results
- **Reduces data transfer**: Backend can filter and aggregate data before sending to frontend

**Example**: Instead of sending 1000 employee records to the browser and filtering there, the backend filters first and sends only the 10 relevant records.

#### **Data Integrity** ✅
- **Validates all data**: Ensures emails are valid, required fields are filled, etc.
- **Prevents duplicate data**: Checks if an email already exists before creating a new employee
- **Maintains relationships**: Ensures you can't delete a skill that's being used by employees

---

### Q3: What happens when a user performs an action (e.g., adds a skill)?

**A3**: Let's trace the complete journey of a request through the system:

#### **Step-by-Step Flow: Adding a New Skill**

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: User Action (Frontend)                              │
├─────────────────────────────────────────────────────────────┤
│ Employee clicks "Add Skill" button                          │
│ Fills in: Skill = "React", Proficiency = 3, Experience = 2  │
│ Clicks "Submit"                                              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: Frontend Sends HTTP Request                         │
├─────────────────────────────────────────────────────────────┤
│ POST http://localhost:8080/api/employees/5/skills           │
│ Headers: Authorization: Bearer eyJhbGc...  (JWT token)      │
│ Body: {                                                      │
│   "skillId": 18,                                             │
│   "proficiencyLevel": 3,                                     │
│   "yearsExperience": 2.0                                     │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: Backend Receives Request (Spring Boot)              │
├─────────────────────────────────────────────────────────────┤
│ 1. Security Filter checks JWT token → Valid ✓               │
│ 2. Routes to EmployeeSkillController.addEmployeeSkill()     │
│ 3. Validates request body → All required fields present ✓   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: Controller Layer (EmployeeSkillController)          │
├─────────────────────────────────────────────────────────────┤
│ @PostMapping                                                 │
│ public ResponseEntity<EmployeeSkillDTO> addEmployeeSkill(   │
│     @PathVariable Long employeeId,                           │
│     @RequestBody AddEmployeeSkillRequest request            │
│ ) {                                                          │
│     // Calls the service layer                              │
│     EmployeeSkillDTO skill = employeeSkillService           │
│         .addEmployeeSkill(employeeId, request);             │
│     return ResponseEntity.status(201).body(skill);          │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: Service Layer (EmployeeSkillService)                │
├─────────────────────────────────────────────────────────────┤
│ Business Logic:                                              │
│ 1. Check if employee exists → Yes ✓                         │
│ 2. Check if skill exists → Yes ✓                            │
│ 3. Check if employee already has this skill → No ✓          │
│ 4. Create EmployeeSkill object                              │
│ 5. Set approval_status = PENDING (business rule!)           │
│ 6. Set source = SELF_REPORTED                               │
│ 7. Call repository to save                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: Repository Layer (EmployeeSkillRepository)          │
├─────────────────────────────────────────────────────────────┤
│ JPA/Hibernate generates SQL:                                │
│                                                              │
│ INSERT INTO employee_skills (                               │
│   employee_id, skill_id, proficiency_level,                 │
│   years_experience, approval_status, source                 │
│ ) VALUES (5, 18, 3, 2.0, 'PENDING', 'SELF_REPORTED');      │
│                                                              │
│ Executes query → Returns saved record with ID               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 7: Database (PostgreSQL)                               │
├─────────────────────────────────────────────────────────────┤
│ Stores the new record in employee_skills table              │
│ Assigns auto-generated ID (e.g., 42)                        │
│ Sets created_at timestamp                                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 8: Response Flows Back Up                              │
├─────────────────────────────────────────────────────────────┤
│ Repository → Service → Controller                           │
│ Controller converts to DTO (adds skill name, etc.)          │
│ Returns HTTP 201 Created with JSON:                         │
│ {                                                            │
│   "id": 42,                                                  │
│   "employeeId": 5,                                           │
│   "skillId": 18,                                             │
│   "skillName": "React",                                      │
│   "proficiencyLevel": 3,                                     │
│   "approvalStatus": "PENDING"                                │
│ }                                                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ STEP 9: Frontend Receives Response                          │
├─────────────────────────────────────────────────────────────┤
│ 1. Shows success message: "Skill added successfully!"       │
│ 2. Updates the UI to show new skill with PENDING badge      │
│ 3. User sees their new skill in the list                    │
└─────────────────────────────────────────────────────────────┘
```

**Total Time**: ~100-300 milliseconds from click to display!

---

### Key Takeaways:

✅ **Backend is the brain**: Handles all logic, security, and data management  
✅ **Layered architecture**: Request flows through Controller → Service → Repository → Database  
✅ **Security first**: Every request is authenticated and authorized  
✅ **Business rules enforced**: New skills automatically go to PENDING status  
✅ **Fast and efficient**: Complex operations happen on the server, not the browser

---

## 📚 TOPIC 2: How is the Code Organized?

### Q4: How is the backend code structured? Where do I find different components?

**A4**: The backend follows a **well-organized folder structure** where each folder has a specific purpose. Think of it like organizing a library - each section contains related books.

#### **Backend Project Structure**

```
backend/
├── src/main/java/com/skillbridge/
│   ├── SkillBridgeApplication.java    # 🚀 Main entry point (starts the app)
│   │
│   ├── controller/                     # 🎮 REST API Endpoints (8 files)
│   │   ├── AuthController.java        #    Login, authentication
│   │   ├── EmployeeController.java    #    Employee CRUD operations
│   │   ├── EmployeeSkillController.java #  Skill management + approvals
│   │   ├── SkillController.java       #    Skill catalog
│   │   ├── ProjectController.java     #    Project management
│   │   ├── RoleProjectController.java #    Roles & gap analysis
│   │   ├── AnalyticsController.java   #    Gap analysis & recommendations
│   │   └── LearningResourceController.java # Learning resources
│   │
│   ├── service/                        # 🧠 Business Logic (9 files)
│   │   ├── AuthService.java           #    Login logic, JWT generation
│   │   ├── EmployeeService.java       #    Employee business rules
│   │   ├── EmployeeSkillService.java  #    Skill approval workflow
│   │   ├── SkillService.java          #    Skill validation
│   │   ├── ProjectService.java        #    Project allocation logic
│   │   ├── RoleProjectService.java    #    Role requirements
│   │   ├── AnalyticsService.java      #    Gap calculations
│   │   ├── LearningResourceService.java # Resource recommendations
│   │   └── SmartAllocationService.java #   Smart resource matching
│   │
│   ├── repository/                     # 🗄️ Database Access (8 files)
│   │   ├── EmployeeRepository.java    #    Employee table queries
│   │   ├── EmployeeSkillRepository.java #  Employee skills queries
│   │   ├── SkillRepository.java       #    Skills table queries
│   │   ├── ProjectRepository.java     #    Projects table queries
│   │   ├── ProjectAssignmentRepository.java # Assignments queries
│   │   ├── RoleProjectRepository.java #    Roles table queries
│   │   ├── RoleProjectRequirementRepository.java # Requirements queries
│   │   └── LearningResourceRepository.java # Resources queries
│   │
│   ├── entity/                         # 📊 Database Table Models (8 files)
│   │   ├── Employee.java              #    employees table
│   │   ├── EmployeeSkill.java         #    employee_skills table
│   │   ├── Skill.java                 #    skills table
│   │   ├── Project.java               #    projects table
│   │   ├── ProjectAssignment.java     #    project_assignments table
│   │   ├── RoleProject.java           #    role_projects table
│   │   ├── RoleProjectRequirement.java #   role_project_requirements table
│   │   └── LearningResource.java      #    learning_resources table
│   │
│   ├── dto/                            # 📦 Data Transfer Objects (22 files)
│   │   ├── EmployeeDTO.java           #    Employee data for API responses
│   │   ├── EmployeeSkillDTO.java      #    Skill data with extra info
│   │   ├── ProjectDTO.java            #    Project data with assignments
│   │   ├── AddEmployeeSkillRequest.java # Request format for adding skills
│   │   └── ... (18 more DTOs)
│   │
│   ├── security/                       # 🔒 Authentication & Security (3 files)
│   │   ├── JwtAuthenticationFilter.java #  Checks JWT tokens on requests
│   │   ├── JwtTokenProvider.java      #    Generates & validates JWT tokens
│   │   └── SecurityConfig.java        #    Security rules & permissions
│   │
│   ├── config/                         # ⚙️ Configuration (2 files)
│   │   ├── WebConfig.java             #    CORS, web settings
│   │   └── OpenAPIConfig.java         #    Swagger API documentation
│   │
│   └── exception/                      # ⚠️ Error Handling (3 files)
│       ├── ResourceNotFoundException.java # 404 errors
│       ├── GlobalExceptionHandler.java #   Centralized error handling
│       └── ValidationException.java   #    Validation errors
│
├── src/main/resources/
│   ├── application.properties         # 🔧 App configuration (DB, port, etc.)
│   └── data.sql                       # 📝 Initial data (test users, skills)
│
└── pom.xml                            # 📚 Dependencies (libraries used)
```

**Total Files**: ~60 Java files organized into 9 folders

---

### Q5: What are the 3 main layers and what does each do?

**A5**: The backend uses a **3-layer architecture** (also called MVC pattern). Each layer has a specific job and talks only to the layers next to it.

#### **The 3 Layers Explained**

```
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 1: CONTROLLER                       │
│                  (The "Receptionist")                        │
├─────────────────────────────────────────────────────────────┤
│ Job: Handle HTTP requests and responses                     │
│                                                              │
│ Responsibilities:                                            │
│ • Receive HTTP requests from frontend                       │
│ • Validate request format (is JSON valid?)                  │
│ • Extract data from request (body, parameters, headers)     │
│ • Call the appropriate Service method                       │
│ • Convert Service response to HTTP response                 │
│ • Return JSON to frontend                                   │
│                                                              │
│ Example: EmployeeSkillController                            │
│ • Endpoint: POST /api/employees/{id}/skills                 │
│ • Receives: JSON with skill data                            │
│ • Calls: employeeSkillService.addEmployeeSkill()            │
│ • Returns: HTTP 201 Created with skill data                 │
└─────────────────────────────────────────────────────────────┘
                          ↓ Calls
┌─────────────────────────────────────────────────────────────┐
│                    LAYER 2: SERVICE                          │
│                  (The "Manager")                             │
├─────────────────────────────────────────────────────────────┤
│ Job: Implement business logic and rules                     │
│                                                              │
│ Responsibilities:                                            │
│ • Enforce business rules (e.g., skills need approval)       │
│ • Perform calculations (e.g., gap analysis)                 │
│ • Validate business logic (e.g., can't delete used skill)   │
│ • Coordinate multiple repository calls if needed            │
│ • Transform data between Entity and DTO                     │
│ • Handle transactions (ensure data consistency)             │
│                                                              │
│ Example: EmployeeSkillService                               │
│ • Checks if employee exists                                 │
│ • Checks if skill exists                                    │
│ • Sets approval_status = PENDING (business rule!)           │
│ • Calls repository to save                                  │
│ • Converts Entity to DTO for response                       │
└─────────────────────────────────────────────────────────────┘
                          ↓ Calls
┌─────────────────────────────────────────────────────────────┐
│                   LAYER 3: REPOSITORY                        │
│                  (The "Librarian")                           │
├─────────────────────────────────────────────────────────────┤
│ Job: Talk to the database                                   │
│                                                              │
│ Responsibilities:                                            │
│ • Execute SQL queries (SELECT, INSERT, UPDATE, DELETE)      │
│ • Convert database rows to Java objects (Entities)          │
│ • Convert Java objects to database rows                     │
│ • Provide simple query methods (findById, findAll, etc.)    │
│ • Custom queries for complex searches                       │
│                                                              │
│ Example: EmployeeSkillRepository                            │
│ • save(employeeSkill) → INSERT INTO employee_skills...      │
│ • findById(id) → SELECT * FROM employee_skills WHERE id=?   │
│ • findByEmployeeId(empId) → SELECT * WHERE employee_id=?    │
│ • Uses JPA/Hibernate (no manual SQL needed!)                │
└─────────────────────────────────────────────────────────────┘
                          ↓ Talks to
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE                                │
│                    (PostgreSQL)                              │
└─────────────────────────────────────────────────────────────┘
```

---

### Q6: Can you show me a real example of how these 3 layers work together?

**A6**: Absolutely! Let's use **"Approving a skill"** as an example and see the actual code from each layer.

#### **Example: Manager Approves an Employee's Skill**

**Scenario**: Manager clicks "Approve" button on a pending skill request.

---

#### **LAYER 1: Controller** (EmployeeSkillController.java)

```java
@RestController
@RequestMapping("/employees/{employeeId}/skills")
public class EmployeeSkillController {
    
    private final EmployeeSkillService employeeSkillService;
    
    // Endpoint: POST /api/employees/0/skills/42/approve
    @PostMapping("/{skillId}/approve")
    public ResponseEntity<Void> approveSkill(
            @PathVariable Long employeeId,
            @PathVariable Long skillId,
            @RequestBody SkillApprovalRequest request) {
        
        // 1. Extract data from request
        Long managerId = request.getManagerId();
        
        // 2. Call service layer
        employeeSkillService.approveSkill(skillId, managerId);
        
        // 3. Return success response
        return ResponseEntity.ok().build();
    }
}
```

**What the Controller does:**
- ✅ Defines the API endpoint (`POST /employees/0/skills/42/approve`)
- ✅ Extracts skillId (42) from URL path
- ✅ Extracts managerId from request body
- ✅ Calls the service layer to do the work
- ✅ Returns HTTP 200 OK

---

#### **LAYER 2: Service** (EmployeeSkillService.java)

```java
@Service
public class EmployeeSkillService {
    
    private final EmployeeSkillRepository employeeSkillRepository;
    private final EmployeeRepository employeeRepository;
    
    public void approveSkill(Long skillId, Long managerId) {
        // 1. Get the skill from database
        EmployeeSkill skill = employeeSkillRepository.findById(skillId)
            .orElseThrow(() -> new ResourceNotFoundException("Skill not found"));
        
        // 2. Business rule: Check if skill is PENDING
        if (skill.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new ValidationException("Only PENDING skills can be approved");
        }
        
        // 3. Business rule: Verify manager exists
        Employee manager = employeeRepository.findById(managerId)
            .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
        
        // 4. Business rule: Check if user is actually a manager
        if (manager.getRole() != Employee.Role.MANAGER && 
            manager.getRole() != Employee.Role.HR_ADMIN) {
            throw new ValidationException("Only managers can approve skills");
        }
        
        // 5. Update the skill (business logic)
        skill.setApprovalStatus(ApprovalStatus.APPROVED);
        skill.setApprovedBy(managerId);
        skill.setApprovedAt(LocalDateTime.now());
        
        // 6. Save to database via repository
        employeeSkillRepository.save(skill);
        
        // 7. Could send notification email here (future enhancement)
        // emailService.sendApprovalNotification(skill.getEmployeeId());
    }
}
```

**What the Service does:**
- ✅ Fetches the skill from database (via repository)
- ✅ Validates business rules (is it PENDING? is user a manager?)
- ✅ Updates the skill status to APPROVED
- ✅ Records who approved it and when
- ✅ Saves changes back to database
- ✅ Could trigger other actions (emails, notifications)

---

#### **LAYER 3: Repository** (EmployeeSkillRepository.java)

```java
@Repository
public interface EmployeeSkillRepository extends JpaRepository<EmployeeSkill, Long> {
    
    // JpaRepository provides these methods automatically:
    // - findById(Long id)
    // - save(EmployeeSkill skill)
    // - findAll()
    // - deleteById(Long id)
    
    // Custom query methods we added:
    List<EmployeeSkill> findByEmployeeId(Long employeeId);
    
    List<EmployeeSkill> findByApprovalStatus(ApprovalStatus status);
    
    @Query("SELECT es FROM EmployeeSkill es WHERE es.employeeId IN " +
           "(SELECT e.id FROM Employee e WHERE e.managerId = :managerId) " +
           "AND es.approvalStatus = 'PENDING'")
    List<EmployeeSkill> findPendingSkillsForManager(@Param("managerId") Long managerId);
}
```

**What the Repository does:**
- ✅ Provides `findById(skillId)` to fetch the skill
- ✅ Provides `save(skill)` to update the skill
- ✅ Automatically generates SQL queries (we don't write SQL!)
- ✅ Converts database rows ↔ Java objects
- ✅ Custom queries for complex searches (like finding pending skills for a manager)

**Generated SQL** (by Hibernate):
```sql
-- For findById(42)
SELECT * FROM employee_skills WHERE id = 42;

-- For save(skill) - UPDATE because skill already exists
UPDATE employee_skills 
SET approval_status = 'APPROVED',
    approved_by = 7,
    approved_at = '2025-12-18 12:25:00',
    updated_at = '2025-12-18 12:25:00'
WHERE id = 42;
```

---

### Q7: Why separate into 3 layers? Why not put everything in one file?

**A7**: Great question! Separating into layers provides huge benefits:

#### **1. Separation of Concerns** 🎯
Each layer has ONE job:
- Controller: Handle HTTP
- Service: Business logic
- Repository: Database access

**Benefit**: Easier to understand and maintain. If you need to change business logic, you only touch the Service layer.

#### **2. Reusability** ♻️
Services can be called from multiple controllers:

```java
// EmployeeSkillService.approveSkill() can be called from:
// 1. EmployeeSkillController (API endpoint)
// 2. Batch job (approve multiple skills at once)
// 3. Admin panel (different UI)
// 4. Mobile app (different frontend)
```

#### **3. Testability** 🧪
Each layer can be tested independently:
- Test Controller: Does it handle HTTP correctly?
- Test Service: Does business logic work?
- Test Repository: Do queries work?

#### **4. Flexibility** 🔄
Easy to swap implementations:
- Change database from PostgreSQL to MySQL? → Only change Repository
- Change business rule? → Only change Service
- Change API format? → Only change Controller

#### **5. Team Collaboration** 👥
Different developers can work on different layers simultaneously:
- Developer A: Works on new API endpoints (Controller)
- Developer B: Implements business logic (Service)
- Developer C: Optimizes database queries (Repository)

---

### Key Takeaways:

✅ **Organized structure**: 9 folders, ~60 files, each with a purpose  
✅ **3-layer architecture**: Controller (HTTP) → Service (Logic) → Repository (Database)  
✅ **Clear responsibilities**: Each layer has ONE job  
✅ **Real example**: Skill approval flows through all 3 layers  
✅ **Benefits**: Maintainable, testable, reusable, flexible

---

_[More Q&A will be added as we discuss]_

---

## 3. DATABASE DESIGN

_[To be filled based on your questions]_

---

## 4. FRONTEND ARCHITECTURE

_[To be filled based on your questions]_

---

## 5. KEY FEATURES EXPLAINED

_[To be filled based on your questions]_

---

## 6. API DOCUMENTATION

_[To be filled based on your questions]_

---

## 7. SECURITY & AUTHENTICATION

_[To be filled based on your questions]_

---

## 8. DEPLOYMENT GUIDE

_[To be filled based on your questions]_

---

**Document Status**: 🟡 In Progress  
**Next Update**: As questions are answered  
**Maintained By**: Development Team
