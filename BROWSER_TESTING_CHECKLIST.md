# SkillBridge - Browser Testing Checklist

**Purpose**: Verify all features work end-to-end in the browser  
**Date**: 2025-12-18  
**Servers**: Frontend (http://localhost:5173/) + Backend (http://localhost:8080/api)

---

## PRE-TESTING SETUP

### ✅ Servers Running
- [ ] Frontend running on http://localhost:5173/
- [ ] Backend running on http://localhost:8080/api
- [ ] Database connected and accessible
- [ ] No console errors on startup

### Test Users
You should have these test users in your database:

| Email | Password | Role | Purpose |
|-------|----------|------|---------|
| hr@skillbridge.com | password | HR_ADMIN | Full access testing |
| manager@skillbridge.com | password | MANAGER | Manager features |
| employee@skillbridge.com | password | EMPLOYEE | Employee features |

---

## 1. AUTHENTICATION FLOW

### Test Steps
- [ ] 1.1. Navigate to http://localhost:5173/
- [ ] 1.2. Should redirect to /login if not authenticated
- [ ] 1.3. Enter invalid credentials → See error message
- [ ] 1.4. Enter valid credentials (hr@skillbridge.com) → Login successful
- [ ] 1.5. Check localStorage has 'token' and 'user'
- [ ] 1.6. Should redirect to /dashboard
- [ ] 1.7. Refresh page → Should stay logged in
- [ ] 1.8. Logout → Should clear token and redirect to /login

**Expected**: ✅ No errors, smooth authentication flow

---

## 2. EMPLOYEE DASHBOARD (AS EMPLOYEE)

### Login as: employee@skillbridge.com

### Test Steps
- [ ] 2.1. See welcome message with employee name
- [ ] 2.2. See "My Skills" section with actual skills from database
- [ ] 2.3. See "Current Projects" section (if assigned to any)
- [ ] 2.4. See "Skill Gaps" section with calculated gaps
- [ ] 2.5. See "Learning Recommendations" section
- [ ] 2.6. Click on each section → Navigate to respective pages
- [ ] 2.7. No console errors

**Expected**: ✅ All data loaded from database, no mock data

---

## 3. MY SKILLS (AS EMPLOYEE)

### Test Steps
- [ ] 3.1. Navigate to "My Skills" page
- [ ] 3.2. See list of skills with status chips (PENDING/APPROVED/REJECTED)
- [ ] 3.3. Click "Add New Skill" button
- [ ] 3.4. Select a skill from dropdown (real skills from database)
- [ ] 3.5. Set proficiency level, years of experience
- [ ] 3.6. Submit → Skill added with PENDING status
- [ ] 3.7. See new skill in the list
- [ ] 3.8. Edit a skill → Changes saved
- [ ] 3.9. Delete a skill → Skill removed
- [ ] 3.10. If any REJECTED skills, see rejection reason

**Expected**: ✅ CRUD operations work, approval status visible

---

## 4. SKILL APPROVALS (AS MANAGER/HR)

### Login as: manager@skillbridge.com or hr@skillbridge.com

### Test Steps
- [ ] 4.1. Dashboard shows "Skill Approvals" section
- [ ] 4.2. See pending skill requests (from step 3.6)
- [ ] 4.3. Click "Approve" on a skill → Status changes to APPROVED
- [ ] 4.4. Click "Reject" on a skill → Modal opens
- [ ] 4.5. Enter rejection reason → Submit
- [ ] 4.6. Skill status changes to REJECTED
- [ ] 4.7. Login as employee → See approved/rejected skills
- [ ] 4.8. Rejected skill shows rejection reason

**Expected**: ✅ Approval workflow works end-to-end

---

## 5. TEAM MATRIX (AS HR/MANAGER)

### Test Steps
- [ ] 5.1. Navigate to "Team Matrix"
- [ ] 5.2. See all employees with their skills
- [ ] 5.3. **Test Search Filter**: Type employee name → List filters
- [ ] 5.4. **Test Skills Filter**: Select skills → Only employees with those skills shown
- [ ] 5.5. **Test Department Filter**: Select department → Filtered correctly
- [ ] 5.6. **Test Availability Filter**: Select "Available" → Only available employees shown
- [ ] 5.7. **Test Billable Status Filter**: Select "BILLABLE" → Filtered correctly
- [ ] 5.8. **Test Project Filter**: Select a project → Only assigned employees shown
- [ ] 5.9. Clear all filters → All employees shown again
- [ ] 5.10. See availability chips (Available/Busy) based on project assignments
- [ ] 5.11. See allocation type chips (Billable/Non-Billable/Investment)
- [ ] 5.12. See current project names for busy employees

**Expected**: ✅ All filters work with real data, no mock data

---

## 6. PROJECT MANAGEMENT - ONGOING PROJECTS (AS HR/MANAGER)

### Test Steps
- [ ] 6.1. Navigate to "Project Management" → "Ongoing Projects" tab
- [ ] 6.2. See list of ongoing projects from database
- [ ] 6.3. Click "Allocate Resource" on a project
- [ ] 6.4. **NEW FEATURE**: See filter section (Search, Skills, Department, Availability, Allocation)
- [ ] 6.5. Test search filter → Employees filtered
- [ ] 6.6. Test skills filter → Only employees with selected skills shown
- [ ] 6.7. See resource count update as filters change
- [ ] 6.8. Select an employee from filtered list
- [ ] 6.9. **NEW FEATURE**: See "Set Allocation Type for Each Employee" section
- [ ] 6.10. For each selected employee, choose allocation type:
  - [ ] 💰 Billable (Client Work)
  - [ ] 📋 Non-Billable (Internal)
  - [ ] 🎓 Investment (Training/R&D)
- [ ] 6.11. Click "Allocate Selected"
- [ ] 6.12. Success message shown
- [ ] 6.13. Employee appears in project's assigned employees list
- [ ] 6.14. **Verify**: Go to Team Matrix → Employee shows as "Busy" with correct allocation type
- [ ] 6.15. Click "Unassign" on an employee → Employee removed from project

**Expected**: ✅ Allocation with filters and allocation type selection works

---

## 7. PROJECT MANAGEMENT - RESOURCE ALLOCATION (AS HR/MANAGER)

### Test Steps
- [ ] 7.1. Navigate to "Resource Allocation" tab
- [ ] 7.2. See list of upcoming projects
- [ ] 7.3. Click "Add Upcoming Project"
- [ ] 7.4. Fill in project details (name, description, expected start date)
- [ ] 7.5. Select tech stack skills
- [ ] 7.6. Submit → Project created
- [ ] 7.7. Click "Allocate & Start Project" on an upcoming project
- [ ] 7.8. **NEW FEATURE**: See filter section
- [ ] 7.9. Use filters to find suitable employees
- [ ] 7.10. Select multiple employees
- [ ] 7.11. **NEW FEATURE**: For each employee, set allocation type
- [ ] 7.12. Click "Allocate & Start Project"
- [ ] 7.13. Project moves to "Ongoing Projects" tab
- [ ] 7.14. Employees are assigned with correct allocation types
- [ ] 7.15. **Verify**: Team Matrix shows employees as "Busy"

**Expected**: ✅ Start project with allocation types works

---

## 8. EMPLOYEE MANAGEMENT (AS HR)

### Login as: hr@skillbridge.com

### Test Steps
- [ ] 8.1. Navigate to "Employee Management"
- [ ] 8.2. See all employees from database
- [ ] 8.3. Click "Add Employee"
- [ ] 8.4. Fill in employee details (name, email, password, role, department, job title)
- [ ] 8.5. Submit → Employee created
- [ ] 8.6. See new employee in list
- [ ] 8.7. Click "Edit" on an employee
- [ ] 8.8. Modify details → Save → Changes reflected
- [ ] 8.9. Search for employee by name → Filtered correctly
- [ ] 8.10. Filter by department → Filtered correctly
- [ ] 8.11. Click "Delete" on an employee → Confirmation → Employee removed

**Expected**: ✅ Full CRUD operations work

---

## 9. SKILL CATALOG (AS HR)

### Test Steps
- [ ] 9.1. Navigate to "Skill Catalog"
- [ ] 9.2. See all skills from database
- [ ] 9.3. Filter by category → Filtered correctly
- [ ] 9.4. Search for skill → Filtered correctly
- [ ] 9.5. Click "Add Skill"
- [ ] 9.6. Fill in skill details (name, category, description)
- [ ] 9.7. Submit → Skill created
- [ ] 9.8. Edit a skill → Changes saved
- [ ] 9.9. Deactivate a skill → Skill marked inactive
- [ ] 9.10. Inactive skills don't appear in employee skill selection

**Expected**: ✅ Skill management works

---

## 10. GAP ANALYSIS (AS EMPLOYEE)

### Login as: employee@skillbridge.com

### Test Steps
- [ ] 10.1. Navigate to "My Gaps"
- [ ] 10.2. Select a role/project from dropdown (real data from database)
- [ ] 10.3. See gap analysis results:
  - [ ] Missing skills (required but not in employee's profile)
  - [ ] Skills needing improvement (proficiency below required)
  - [ ] Matching skills (proficiency meets or exceeds required)
- [ ] 10.4. See proficiency level comparisons
- [ ] 10.5. See visual indicators (red for missing, yellow for needs improvement, green for matching)
- [ ] 10.6. No mock data, all calculated from database

**Expected**: ✅ Gap analysis calculated correctly

---

## 11. LEARNING RECOMMENDATIONS (AS EMPLOYEE)

### Test Steps
- [ ] 11.1. Navigate to "Recommendations"
- [ ] 11.2. See personalized learning resources based on skill gaps
- [ ] 11.3. Resources are from database (not mock data)
- [ ] 11.4. Filter by proficiency level → Filtered correctly
- [ ] 11.5. Filter by resource type → Filtered correctly
- [ ] 11.6. Click on resource link → Opens external resource
- [ ] 11.7. See resource details (title, description, duration, free/paid)

**Expected**: ✅ Recommendations based on real gap analysis

---

## 12. LEARNING RESOURCES MANAGEMENT (AS HR)

### Login as: hr@skillbridge.com

### Test Steps
- [ ] 12.1. Navigate to "Learning Resources"
- [ ] 12.2. See all learning resources from database
- [ ] 12.3. Click "Add Resource"
- [ ] 12.4. Fill in resource details (title, description, URL, skill, level, type, duration, free/paid)
- [ ] 12.5. Submit → Resource created
- [ ] 12.6. Edit a resource → Changes saved
- [ ] 12.7. Delete a resource → Resource removed
- [ ] 12.8. Filter by skill → Filtered correctly
- [ ] 12.9. Filter by level → Filtered correctly
- [ ] 12.10. Filter by type → Filtered correctly

**Expected**: ✅ Learning resource management works

---

## 13. ROLES & PROJECTS (GAP ANALYSIS SETUP)

### Login as: hr@skillbridge.com

### Test Steps
- [ ] 13.1. Navigate to "Project Management" → "Roles & Projects" tab
- [ ] 13.2. See list of roles/projects for gap analysis
- [ ] 13.3. Click "Add Role/Project"
- [ ] 13.4. Fill in details (name, type, description)
- [ ] 13.5. Submit → Role/Project created
- [ ] 13.6. Click "Manage Requirements" on a role/project
- [ ] 13.7. Add skill requirements with proficiency levels
- [ ] 13.8. Edit requirement → Changes saved
- [ ] 13.9. Delete requirement → Requirement removed
- [ ] 13.10. **Verify**: Login as employee → Gap analysis uses these requirements

**Expected**: ✅ Requirements management works

---

## 14. CROSS-FEATURE VERIFICATION

### Test Data Flow
- [ ] 14.1. **Skill Approval Flow**:
  - Employee adds skill (PENDING) → Manager approves → Employee sees APPROVED
  
- [ ] 14.2. **Project Allocation Flow**:
  - HR creates project → Allocates employees with allocation types → Team Matrix shows correct status
  
- [ ] 14.3. **Gap Analysis Flow**:
  - HR sets role requirements → Employee views gaps → Gets recommendations → Adds skills → Manager approves → Gap closes
  
- [ ] 14.4. **Resource Tracking Flow**:
  - Employee allocated to project (BILLABLE) → Shows as Busy in Team Matrix → Unassigned → Shows as Available

**Expected**: ✅ Data flows correctly across features

---

## 15. ERROR HANDLING

### Test Error Scenarios
- [ ] 15.1. Logout → Try to access protected page → Redirects to login
- [ ] 15.2. Login as EMPLOYEE → Try to access HR-only page → Access denied or hidden
- [ ] 15.3. Submit form with missing required fields → Validation errors shown
- [ ] 15.4. Try to add duplicate skill → Error message shown
- [ ] 15.5. Try to delete skill in use → Appropriate error handling
- [ ] 15.6. Network error simulation → Error message shown

**Expected**: ✅ Graceful error handling

---

## 16. BROWSER CONSOLE CHECK

### Throughout Testing
- [ ] 16.1. Open browser DevTools → Console tab
- [ ] 16.2. No red errors (except expected validation errors)
- [ ] 16.3. All API calls return 200/201 (check Network tab)
- [ ] 16.4. No 404 errors for missing endpoints
- [ ] 16.5. No 500 errors from backend
- [ ] 16.6. JWT token sent in Authorization header
- [ ] 16.7. Responses contain real data (not mock)

**Expected**: ✅ Clean console, successful API calls

---

## 17. DATABASE VERIFICATION

### After Testing
- [ ] 17.1. Check `employee_skills` table → New skills added with correct approval_status
- [ ] 17.2. Check `project_assignments` table → Assignments have correct allocation_type
- [ ] 17.3. Check `projects` table → Projects created/updated correctly
- [ ] 17.4. Check `employees` table → Employees created/updated correctly
- [ ] 17.5. Check `skills` table → Skills created/updated correctly
- [ ] 17.6. Check `learning_resources` table → Resources created correctly

**Expected**: ✅ All data persisted correctly in database

---

## FINAL CHECKLIST

### Overall Verification
- [ ] ✅ All 10 frontend pages load without errors
- [ ] ✅ All 49 backend API endpoints working
- [ ] ✅ No mock data anywhere - everything from database
- [ ] ✅ Authentication and authorization working
- [ ] ✅ CRUD operations work on all entities
- [ ] ✅ Filters work with real data
- [ ] ✅ **NEW**: Resource allocation filtering works
- [ ] ✅ **NEW**: Allocation type selection works
- [ ] ✅ Skill approval workflow complete
- [ ] ✅ Gap analysis calculations correct
- [ ] ✅ Recommendations personalized
- [ ] ✅ Data flows across features correctly
- [ ] ✅ Error handling graceful
- [ ] ✅ Database persistence verified

---

## TESTING SUMMARY

**Total Test Cases**: ~150  
**Estimated Time**: 45-60 minutes  
**Critical Features**: All core features + recent enhancements  
**Data Source**: 100% real database (0% mock data)

### Priority Testing Order
1. **High Priority**: Authentication, Skill Approval, Project Allocation (with new features)
2. **Medium Priority**: Team Matrix, Gap Analysis, Employee Management
3. **Low Priority**: Learning Resources, Skill Catalog

---

**Testing Date**: _____________  
**Tester**: _____________  
**Result**: ☐ PASS  ☐ FAIL  
**Issues Found**: _____________

---

## QUICK SMOKE TEST (5 minutes)

If short on time, test these critical flows:

1. ✅ Login → Dashboard loads
2. ✅ Add a skill → Goes to PENDING
3. ✅ Approve skill (as manager) → Status changes
4. ✅ Allocate resource with filters → Employee assigned
5. ✅ Set allocation type → Persists in database
6. ✅ Team Matrix shows correct data
7. ✅ No console errors

**If all pass**: ✅ Application is working end-to-end!
