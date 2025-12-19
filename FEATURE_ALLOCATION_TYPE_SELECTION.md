# Feature: Allocation Type Selection for Ongoing Projects

## Overview
Added the ability for HR to specify allocation type (Billable/Non-Billable/Investment) when allocating resources to **ongoing projects**, matching the functionality already available when starting upcoming projects.

## Problem Statement
Previously, when HR allocated employees to ongoing projects through the "Allocate Resource" dialog, the system would default all assignments to "BILLABLE" without giving HR the option to specify the allocation type. This was inconsistent with the "Start Project" flow where HR could select allocation types for each employee.

## Solution Implemented

### Database Schema ✅
The `project_assignments` table already had the required column:
```sql
allocation_type VARCHAR(50) NOT NULL DEFAULT 'BILLABLE'
```

**Enum Values**:
- `BILLABLE` - Client work (revenue generating)
- `NON_BILLABLE` - Internal work
- `INVESTMENT` - Training, R&D, learning

### Backend Changes

#### 1. Updated ProjectController.java
**File**: `/backend/src/main/java/com/skillbridge/controller/ProjectController.java`

**Changes**:
- Added import for `ProjectAssignment` entity
- Modified `assignEmployee` endpoint to accept `allocationType` parameter

**Before**:
```java
@PostMapping("/{id}/assign")
public ResponseEntity<Void> assignEmployee(
        @PathVariable Long id,
        @RequestBody Map<String, Long> request) {
    Long employeeId = request.get("employeeId");
    projectService.assignEmployee(id, employeeId);
    return ResponseEntity.ok().build();
}
```

**After**:
```java
@PostMapping("/{id}/assign")
public ResponseEntity<Void> assignEmployee(
        @PathVariable Long id,
        @RequestBody Map<String, Object> request) {
    Long employeeId = ((Number) request.get("employeeId")).longValue();
    String allocationTypeStr = (String) request.get("allocationType");
    
    if (allocationTypeStr != null && !allocationTypeStr.isEmpty()) {
        ProjectAssignment.AllocationType allocationType = 
            ProjectAssignment.AllocationType.valueOf(allocationTypeStr);
        projectService.assignEmployee(id, employeeId, allocationType);
    } else {
        projectService.assignEmployee(id, employeeId); // Defaults to BILLABLE
    }
    
    return ResponseEntity.ok().build();
}
```

**Note**: The service layer already had the overloaded method `assignEmployee(Long projectId, Long employeeId, AllocationType allocationType)` - no changes needed there.

### Frontend Changes

#### 1. Updated API Service
**File**: `/frontend/src/services/api.js`

**Before**:
```javascript
assignEmployee: (id, employeeId) => api.post(`/projects/${id}/assign`, { employeeId }),
```

**After**:
```javascript
assignEmployee: (id, employeeId, allocationType) => 
    api.post(`/projects/${id}/assign`, { employeeId, allocationType }),
```

#### 2. Updated RolesProjects.jsx

**File**: `/frontend/src/pages/RolesProjects.jsx`

**Changes Made**:

##### a) Updated handleAllocateResource Function
Now sends allocation type for each employee:
```javascript
const handleAllocateResource = async () => {
    // ... validation ...
    
    for (const employee of allocationData.selectedEmployees) {
        const allocationType = allocationData.allocationTypes[employee.id] || 'BILLABLE';
        await projectsAPI.assignEmployee(selectedProject.id, employee.id, allocationType);
    }
    
    // ... success handling ...
};
```

##### b) Updated onChange Handler
Initializes allocation types for newly selected employees:
```javascript
onChange={(event, newValue) => {
    const newAllocationTypes = { ...allocationData.allocationTypes };
    newValue.forEach(emp => {
        if (!newAllocationTypes[emp.id]) {
            newAllocationTypes[emp.id] = 'BILLABLE';
        }
    });
    setAllocationData({ 
        selectedEmployees: newValue,
        allocationTypes: newAllocationTypes
    });
}}
```

##### c) Added Allocation Type Selection UI
Added a section after employee selection where HR can specify allocation type for each employee:

```jsx
{/* Allocation Type Selection for Each Employee */}
{allocationData.selectedEmployees.length > 0 && (
    <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Set Allocation Type for Each Employee:
        </Typography>
        {allocationData.selectedEmployees.map((employee) => (
            <Box key={employee.id} sx={{ mt: 2, p: 2, border: '1px solid #e0e0e0', ... }}>
                <Typography variant="body2" fontWeight="bold">
                    {employee.name}
                </Typography>
                <TextField
                    select
                    fullWidth
                    size="small"
                    label="Allocation Type"
                    value={allocationData.allocationTypes[employee.id] || 'BILLABLE'}
                    onChange={(e) => { /* Update allocation type */ }}
                >
                    <MenuItem value="BILLABLE">💰 Billable (Client Work)</MenuItem>
                    <MenuItem value="NON_BILLABLE">📋 Non-Billable (Internal)</MenuItem>
                    <MenuItem value="INVESTMENT">🎓 Investment (Training/R&D)</MenuItem>
                </TextField>
            </Box>
        ))}
    </Box>
)}
```

## User Interface

### Updated Dialog Flow

```
┌────────────────────────────────────────────────────────────┐
│  Allocate Resources to [Project Name]   [Clear Filters]   │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  [Filter Section - Search, Skills, Dept, etc.]            │
│                                                             │
│  Select employees to allocate:                             │
│  [Employee Dropdown with Filters]                          │
│                                                             │
│  ┌─ Set Allocation Type for Each Employee ──────────────┐ │
│  │                                                        │ │
│  │  ┌─ John Doe ────────────────────────────────────┐   │ │
│  │  │ Allocation Type: [💰 Billable (Client Work) ▼]│   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  │                                                        │ │
│  │  ┌─ Jane Smith ──────────────────────────────────┐   │ │
│  │  │ Allocation Type: [📋 Non-Billable (Internal)▼]│   │ │
│  │  └────────────────────────────────────────────────┘   │ │
│  │                                                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ✓ 2 employee(s) selected for allocation                  │
│                                                             │
│  [Cancel]                          [Allocate Selected]     │
└────────────────────────────────────────────────────────────┘
```

## Allocation Type Descriptions

| Type | Icon | Description | Use Case |
|------|------|-------------|----------|
| **BILLABLE** | 💰 | Client Work | Revenue-generating projects, client deliverables |
| **NON_BILLABLE** | 📋 | Internal | Internal tools, infrastructure, support work |
| **INVESTMENT** | 🎓 | Training/R&D | Learning, research, skill development |

## Benefits

1. **Accurate Resource Tracking**: HR can now properly categorize all resource allocations
2. **Better Financial Reporting**: Clear distinction between billable and non-billable work
3. **Consistent UX**: Same allocation type selection for both ongoing and upcoming projects
4. **Flexibility**: Can change allocation type when adding resources to existing projects
5. **Default Safety**: Defaults to BILLABLE if not specified (backward compatible)

## Testing Scenarios

### Test Case 1: Allocate with Default (Billable)
1. Go to Ongoing Projects
2. Click "Allocate Resource" on a project
3. Select employees
4. Don't change allocation type (defaults to BILLABLE)
5. Click "Allocate Selected"
6. ✅ Employees assigned as BILLABLE

### Test Case 2: Allocate with Mixed Types
1. Go to Ongoing Projects
2. Click "Allocate Resource" on a project
3. Select 3 employees
4. Set Employee 1: BILLABLE
5. Set Employee 2: NON_BILLABLE
6. Set Employee 3: INVESTMENT
7. Click "Allocate Selected"
8. ✅ Each employee assigned with correct allocation type

### Test Case 3: Verify in Team Matrix
1. After allocation, go to Team Matrix
2. Search for allocated employees
3. ✅ Allocation type chips show correct values

### Test Case 4: Backend Validation
1. Check database after allocation
2. Query: `SELECT * FROM project_assignments WHERE project_id = ?`
3. ✅ `allocation_type` column has correct values

## API Request/Response

### Request to Assign Employee
```http
POST /api/projects/123/assign
Content-Type: application/json
Authorization: Bearer <token>

{
  "employeeId": 456,
  "allocationType": "BILLABLE"
}
```

### Response
```http
HTTP/1.1 200 OK
```

### Request without Allocation Type (Backward Compatible)
```http
POST /api/projects/123/assign
Content-Type: application/json

{
  "employeeId": 456
}
```
**Result**: Defaults to `BILLABLE`

## Database Impact

### Before
```sql
INSERT INTO project_assignments 
(project_id, employee_id, start_date, allocation_type, active)
VALUES (123, 456, '2025-12-18', 'BILLABLE', true);  -- Always BILLABLE
```

### After
```sql
INSERT INTO project_assignments 
(project_id, employee_id, start_date, allocation_type, active)
VALUES (123, 456, '2025-12-18', 'NON_BILLABLE', true);  -- HR's choice
```

## Files Modified

### Backend
1. `/backend/src/main/java/com/skillbridge/controller/ProjectController.java`
   - Added `ProjectAssignment` import
   - Updated `assignEmployee` endpoint to accept `allocationType`

### Frontend
1. `/frontend/src/services/api.js`
   - Updated `assignEmployee` API call signature

2. `/frontend/src/pages/RolesProjects.jsx`
   - Updated `handleAllocateResource` to send allocation types
   - Updated `onChange` handler to initialize allocation types
   - Added allocation type selection UI

## Backward Compatibility

✅ **Fully Backward Compatible**

- If `allocationType` is not provided, defaults to `BILLABLE`
- Existing allocations remain unchanged
- No database migration required
- No breaking changes to API

## Performance Impact

- **Minimal**: One additional field in API request
- **No additional queries**: Uses existing assignment logic
- **Client-side**: Allocation type selection is instant

## Future Enhancements

1. **Bulk Allocation Type Update**: Allow changing allocation type for existing assignments
2. **Allocation Type Analytics**: Dashboard showing billable vs non-billable distribution
3. **Allocation Type History**: Track changes to allocation types over time
4. **Validation Rules**: Enforce allocation type based on project type
5. **Time Tracking Integration**: Link allocation type to time tracking for billing

---

**Implementation Date**: 2025-12-18  
**Feature Status**: ✅ Implemented and Tested  
**Breaking Changes**: None  
**Migration Required**: No
