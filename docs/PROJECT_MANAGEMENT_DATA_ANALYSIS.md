# PROJECT MANAGEMENT DATA STORAGE ANALYSIS

**Date**: 2025-12-17  
**Status**: ⚠️ **PARTIAL - USING MOCK DATA**

---

## 🔍 CURRENT SITUATION

### **Database Tables Available:**

✅ **1. `roles_projects` Table** - EXISTS
```sql
Columns:
- id (bigint, primary key)
- name (varchar 255)
- type (varchar 255) - CHECK: 'ROLE' or 'PROJECT'
- status (varchar 255) - CHECK: 'ACTIVE' or 'ARCHIVED'
- description (varchar 2000)
- owner_id (bigint)
- created_at (timestamp)
- updated_at (timestamp)
```

**Current Data:**
```
 id |          name           |  type   | status 
----+-------------------------+---------+--------
  1 | Backend Engineer L2     | ROLE    | ACTIVE
  2 | Frontend Engineer L1    | ROLE    | ACTIVE
  3 | Cloud Migration Project | PROJECT | ACTIVE
```

✅ **2. `projects` Table** - EXISTS (EMPTY)
```sql
Columns:
- id (bigint, primary key)
- name (varchar 255)
- description (varchar 1000)
- active (boolean)
- owner_id (bigint, foreign key to users)
- created_at (timestamp)
```

**Current Data:** ❌ **EMPTY (0 rows)**

✅ **3. `project_assignments` Table** - EXISTS (EMPTY)
```sql
Columns:
- id (bigint, primary key)
- project_id (bigint, foreign key to projects)
- employee_id (bigint)
- start_date (date)
- end_date (date)
- assigned_at (timestamp)
- active (boolean)
```

**Current Data:** ❌ **EMPTY (0 rows)**

---

## ⚠️ PROBLEM: FRONTEND USING MOCK DATA

### **Current Frontend Implementation:**

The `RolesProjects.jsx` page is using **hardcoded mock data** instead of database:

```javascript
// Line 78-102: Mock ongoing projects
const mockOngoingProjects = [
    {
        id: 1,
        name: 'Cloud Migration',
        description: 'Migrate legacy systems to cloud infrastructure',
        startDate: '2024-01-15',
        techStack: ['AWS', 'Docker', 'Kubernetes', 'Python'],
        assignedEmployees: [
            { id: 3, name: 'John Doe', role: 'Senior Software Engineer' },
            { id: 2, name: 'Alice Manager', role: 'Engineering Manager' },
        ],
        status: 'In Progress'
    },
    // ...
];

// Line 105-122: Mock upcoming projects
const mockUpcomingProjects = [
    {
        id: 3,
        name: 'Mobile App Development',
        description: 'Build native mobile applications',
        expectedStartDate: '2024-04-01',
        techStack: ['React Native', 'TypeScript', 'Firebase'],
        status: 'Planning'
    },
    // ...
];

// Line 152-154: Setting mock data instead of API data
setOngoingProjects(mockOngoingProjects);
setUpcomingProjects(mockUpcomingProjects);
```

---

## 📋 WHAT'S MISSING

### **1. Backend APIs for Project Management** ❌

**Missing Endpoints:**

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/projects` | GET | Get all projects | ❌ Missing |
| `/api/projects` | POST | Create project | ❌ Missing |
| `/api/projects/{id}` | PUT | Update project | ❌ Missing |
| `/api/projects/{id}` | DELETE | Delete project | ❌ Missing |
| `/api/projects/{id}/assign` | POST | Assign employee | ❌ Missing |
| `/api/projects/{id}/unassign` | POST | Remove employee | ❌ Missing |
| `/api/projects/ongoing` | GET | Get ongoing projects | ❌ Missing |
| `/api/projects/upcoming` | GET | Get upcoming projects | ❌ Missing |

**Note:** `RoleProjectController` exists but handles "roles" and "projects" in the `roles_projects` table, which is different from the `projects` table.

### **2. Backend Service Layer** ❌

**Missing:**
- `ProjectService.java` - Business logic for project management
- Methods for CRUD operations
- Methods for employee assignment/unassignment
- Methods for transitioning upcoming → ongoing

### **3. Backend Entities** ⚠️ Partial

**Exists:**
- `Project.java` entity (likely exists since table exists)
- `ProjectAssignment.java` entity (likely exists since table exists)

**Missing Fields in Project Entity:**
- `techStack` (array/list of technologies)
- `startDate` vs `expectedStartDate`
- `status` field (ongoing vs upcoming)

### **4. Frontend API Integration** ❌

**Missing:**
- `projectsAPI` in `api.js`
- API calls to fetch projects
- API calls to create/update/delete projects
- API calls to assign/unassign employees

---

## 🎯 WHERE DATA SHOULD BE STORED

### **Ongoing Projects:**

**Table:** `projects`  
**Fields:**
```sql
- id
- name
- description
- tech_stack (JSON or separate table)
- start_date
- status ('ONGOING')
- active (true)
- owner_id
```

**Employee Assignments:**  
**Table:** `project_assignments`  
**Fields:**
```sql
- id
- project_id (foreign key to projects)
- employee_id (foreign key to employees)
- start_date
- end_date (nullable)
- active (true)
```

### **Upcoming Projects:**

**Table:** `projects`  
**Fields:**
```sql
- id
- name
- description
- tech_stack (JSON or separate table)
- expected_start_date
- status ('UPCOMING')
- active (true)
- owner_id
```

**No assignments yet** (until project starts)

### **Resource Allocation:**

When HR allocates resources and starts a project:
1. Update project: `status = 'ONGOING'`, `start_date = today`
2. Create entries in `project_assignments` for each allocated employee

---

## 🔧 WHAT NEEDS TO BE BUILT

### **Backend (High Priority):**

1. **Create ProjectController.java** ✅ Structure exists, needs enhancement
   ```java
   @RestController
   @RequestMapping("/projects")
   public class ProjectController {
       // GET /projects - all projects
       // GET /projects/ongoing - ongoing projects
       // GET /projects/upcoming - upcoming projects
       // POST /projects - create project
       // PUT /projects/{id} - update project
       // DELETE /projects/{id} - delete project
       // POST /projects/{id}/assign - assign employee
       // POST /projects/{id}/unassign - remove employee
       // POST /projects/{id}/start - start upcoming project
   }
   ```

2. **Create ProjectService.java**
   - CRUD operations
   - Employee assignment logic
   - Status transitions (upcoming → ongoing)
   - Tech stack management

3. **Update Project Entity**
   - Add `techStack` field (JSON or @ElementCollection)
   - Add `status` field (UPCOMING, ONGOING, COMPLETED)
   - Add `expectedStartDate` field
   - Add `startDate` field

4. **Create ProjectAssignmentService.java**
   - Assign employees to projects
   - Remove employees from projects
   - Track assignment dates

### **Frontend (Medium Priority):**

1. **Update api.js**
   ```javascript
   export const projectsAPI = {
       getAll: () => api.get('/projects'),
       getOngoing: () => api.get('/projects/ongoing'),
       getUpcoming: () => api.get('/projects/upcoming'),
       create: (data) => api.post('/projects', data),
       update: (id, data) => api.put(`/projects/${id}`, data),
       delete: (id) => api.delete(`/projects/${id}`),
       assignEmployee: (id, employeeId) => api.post(`/projects/${id}/assign`, { employeeId }),
       unassignEmployee: (id, employeeId) => api.post(`/projects/${id}/unassign`, { employeeId }),
       startProject: (id, employees) => api.post(`/projects/${id}/start`, { employees }),
   };
   ```

2. **Update RolesProjects.jsx**
   - Replace mock data with API calls
   - Fetch ongoing projects from `/api/projects/ongoing`
   - Fetch upcoming projects from `/api/projects/upcoming`
   - Save new projects to database
   - Save employee assignments to database

---

## 📊 CURRENT DATA FLOW (MOCK)

```
Frontend (RolesProjects.jsx)
    ↓
Mock Data (hardcoded arrays)
    ↓
State Management (useState)
    ↓
UI Display
    ↓
Changes lost on page refresh ❌
```

## 📊 DESIRED DATA FLOW (DATABASE)

```
Frontend (RolesProjects.jsx)
    ↓
API Call (GET /api/projects/ongoing)
    ↓
ProjectController
    ↓
ProjectService
    ↓
ProjectRepository
    ↓
PostgreSQL Database (projects table) ✅
    ↓
Response to Frontend
    ↓
UI Display
    ↓
Changes persist permanently ✅
```

---

## ✅ WHAT'S WORKING

1. ✅ Database tables exist (`projects`, `project_assignments`)
2. ✅ Frontend UI is complete and functional
3. ✅ `roles_projects` table has some data
4. ✅ Employee allocation dialogs work (UI only)

## ❌ WHAT'S NOT WORKING

1. ❌ No backend API for project management
2. ❌ Projects not saving to database
3. ❌ Employee assignments not saving to database
4. ❌ Data lost on page refresh
5. ❌ Upcoming projects not persisted
6. ❌ Ongoing projects not persisted
7. ❌ Tech stacks not stored

---

## 🚨 IMPACT

**Current State:**
- HR can add/edit projects in UI ✅
- HR can allocate employees in UI ✅
- HR can start upcoming projects in UI ✅
- **BUT:** All data is lost on page refresh ❌
- **BUT:** Data not saved to database ❌
- **BUT:** Other users can't see the changes ❌

**Risk Level:** 🔴 **HIGH**  
**Production Ready:** ❌ **NO**

---

## 🎯 RECOMMENDATION

### **Immediate Action Required:**

1. **Create ProjectController** with full CRUD endpoints
2. **Create ProjectService** with business logic
3. **Update Project Entity** to include all required fields
4. **Create projectsAPI** in frontend
5. **Replace mock data** with real API calls in RolesProjects.jsx

### **Priority:** 🔴 **CRITICAL**

Project management is a core HR feature and currently **NOT SAVING ANY DATA**.

---

## 📝 SUMMARY

**Question:** Where is project management data storing?  
**Answer:** ⚠️ **NOWHERE - It's using mock data that disappears on refresh**

**Question:** Where is upcoming project data storing?  
**Answer:** ⚠️ **NOWHERE - It's using mock data that disappears on refresh**

**Question:** Where is employee allocation data storing?  
**Answer:** ⚠️ **NOWHERE - It's using mock data that disappears on refresh**

**Question:** Are the related tables there?  
**Answer:** ✅ **YES - Tables exist but are EMPTY**

**Tables:**
- ✅ `projects` - EXISTS (empty)
- ✅ `project_assignments` - EXISTS (empty)
- ✅ `roles_projects` - EXISTS (has 3 rows, but different purpose)

**Backend APIs:** ❌ **MISSING**  
**Data Persistence:** ❌ **NOT WORKING**  
**Production Ready:** ❌ **NO**

---

*Generated: 2025-12-17 23:08 IST*  
*Status: CRITICAL - Backend APIs Required*
