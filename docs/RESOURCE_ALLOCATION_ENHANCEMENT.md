# RESOURCE ALLOCATION ENHANCEMENT - IMPLEMENTATION PLAN

**Date**: 2025-12-18 01:00 IST  
**Status**: 🚧 **IN PROGRESS**

---

## 🎯 REQUIREMENTS

### **User Request**:
> "In the HR section, in allocation resource part I want that HR has that power to filter the resources based on skill, availability, and all, and while allocating, give each resource tag of billable/non-billable/investment"

---

## ✅ FEATURES TO IMPLEMENT

### **1. Resource Filtering** 🔍
- Filter employees by **skills**
- Filter employees by **availability** (not assigned to projects)
- Filter by **department**
- Filter by **proficiency level**

### **2. Allocation Type Tagging** 🏷️
When assigning employees to projects, HR can mark them as:
- **BILLABLE** - Client-facing, revenue-generating work
- **NON_BILLABLE** - Internal work, admin tasks
- **INVESTMENT** - Training, R&D, skill development

---

## 📋 IMPLEMENTATION STEPS

### **✅ Step 1: Backend - Add Allocation Type to Entity** (DONE)

**File**: `ProjectAssignment.java`

**Changes Made**:
```java
@Enumerated(EnumType.STRING)
@Column(name = "allocation_type", nullable = false)
private AllocationType allocationType = AllocationType.BILLABLE;

public enum AllocationType {
    BILLABLE,
    NON_BILLABLE,
    INVESTMENT
}
```

**Database**: Column `allocation_type` will be added to `project_assignments` table

---

### **✅ Step 2: Backend - Update DTOs** (DONE)

**File**: `StartProjectRequest.java`

**Changes Made**:
```java
private List<Long> employeeIds = new ArrayList<>();
private Map<Long, ProjectAssignment.AllocationType> allocationTypes = new HashMap<>();
```

Now HR can specify allocation type for each employee when starting a project.

---

### **🚧 Step 3: Backend - Update Service Methods** (TODO)

**File**: `ProjectService.java`

**Methods to Update**:

#### **3.1. Update `startProject` method**:
```java
@Transactional
public ProjectDTO startProject(Long id, StartProjectRequest request) {
    // ... existing code ...
    
    // Assign employees with allocation types
    for (Long employeeId : request.getEmployeeIds()) {
        ProjectAssignment.AllocationType allocationType = 
            request.getAllocationTypes().getOrDefault(employeeId, ProjectAssignment.AllocationType.BILLABLE);
        assignEmployee(id, employeeId, allocationType);
    }
    
    return convertToDTO(project);
}
```

#### **3.2. Update `assignEmployee` method**:
```java
@Transactional
public void assignEmployee(Long projectId, Long employeeId, ProjectAssignment.AllocationType allocationType) {
    // ... existing verification ...
    
    ProjectAssignment assignment = new ProjectAssignment();
    assignment.setProjectId(projectId);
    assignment.setEmployeeId(employeeId);
    assignment.setStartDate(LocalDate.now());
    assignment.setActive(true);
    assignment.setAllocationType(allocationType); // NEW
    
    assignmentRepository.save(assignment);
}
```

#### **3.3. Update `convertToDTO` method**:
Add allocation type to EmployeeAssignmentDTO:
```java
empDto.setAllocationType(assignment.getAllocationType().toString());
```

---

### **🚧 Step 4: Backend - Add Employee Filtering API** (TODO)

**File**: `EmployeeController.java`

**New Endpoint**:
```java
@GetMapping("/available")
@Operation(summary = "Get available employees for allocation")
@PreAuthorize("hasAnyRole('HR_ADMIN', 'MANAGER')")
public ResponseEntity<List<EmployeeAvailabilityDTO>> getAvailableEmployees(
        @RequestParam(required = false) List<String> skills,
        @RequestParam(required = false) Boolean onlyAvailable,
        @RequestParam(required = false) String department
) {
    List<EmployeeAvailabilityDTO> employees = employeeService.getAvailableEmployees(skills, onlyAvailable, department);
    return ResponseEntity.ok(employees);
}
```

**New DTO**: `EmployeeAvailabilityDTO.java`
```java
@Data
public class EmployeeAvailabilityDTO {
    private Long id;
    private String name;
    private String email;
    private String department;
    private String role;
    private List<SkillSummaryDTO> skills;
    private boolean available; // Not currently assigned to any project
    private List<ProjectSummaryDTO> currentProjects; // If assigned
}
```

---

### **🚧 Step 5: Backend - Add Employee Service Method** (TODO)

**File**: `EmployeeService.java`

**New Method**:
```java
public List<EmployeeAvailabilityDTO> getAvailableEmployees(
        List<String> skillNames, 
        Boolean onlyAvailable, 
        String department
) {
    List<Employee> employees = employeeRepository.findAll();
    
    // Filter by department
    if (department != null) {
        employees = employees.stream()
            .filter(e -> e.getDepartment().equals(department))
            .collect(Collectors.toList());
    }
    
    // Convert to DTOs with availability info
    List<EmployeeAvailabilityDTO> result = employees.stream()
        .map(this::convertToAvailabilityDTO)
        .collect(Collectors.toList());
    
    // Filter by skills
    if (skillNames != null && !skillNames.isEmpty()) {
        result = result.stream()
            .filter(e -> hasAnySkill(e, skillNames))
            .collect(Collectors.toList());
    }
    
    // Filter by availability
    if (onlyAvailable != null && onlyAvailable) {
        result = result.stream()
            .filter(EmployeeAvailabilityDTO::isAvailable)
            .collect(Collectors.toList());
    }
    
    return result;
}
```

---

### **🚧 Step 6: Frontend - Update RolesProjects.jsx** (TODO)

**Changes Needed**:

#### **6.1. Add Filtering UI in Resource Allocation Tab**:
```jsx
<Box sx={{ mb: 3 }}>
    <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
            <Autocomplete
                multiple
                options={allSkills}
                getOptionLabel={(option) => option.name}
                value={selectedSkills}
                onChange={(e, newValue) => setSelectedSkills(newValue)}
                renderInput={(params) => (
                    <TextField {...params} label="Filter by Skills" />
                )}
            />
        </Grid>
        <Grid item xs={12} md={4}>
            <TextField
                select
                fullWidth
                label="Availability"
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
            >
                <MenuItem value="all">All Employees</MenuItem>
                <MenuItem value="available">Available Only</MenuItem>
                <MenuItem value="assigned">Currently Assigned</MenuItem>
            </TextField>
        </Grid>
        <Grid item xs={12} md={4}>
            <TextField
                select
                fullWidth
                label="Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
            >
                <MenuItem value="">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Design">Design</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
            </TextField>
        </Grid>
    </Grid>
</Box>
```

#### **6.2. Add Allocation Type Selection**:
```jsx
<Autocomplete
    multiple
    options={filteredEmployees}
    getOptionLabel={(option) => `${option.name} - ${option.email}`}
    value={allocationData.selectedEmployees}
    onChange={(event, newValue) => {
        setAllocationData({
            ...allocationData,
            selectedEmployees: newValue
        });
    }}
    renderInput={(params) => (
        <TextField {...params} label="Select Employees" />
    )}
/>

{/* Allocation Type for Each Employee */}
{allocationData.selectedEmployees.map((employee) => (
    <Box key={employee.id} sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
        <Typography variant="subtitle2">{employee.name}</Typography>
        <TextField
            select
            fullWidth
            label="Allocation Type"
            value={allocationData.allocationTypes[employee.id] || 'BILLABLE'}
            onChange={(e) => {
                setAllocationData({
                    ...allocationData,
                    allocationTypes: {
                        ...allocationData.allocationTypes,
                        [employee.id]: e.target.value
                    }
                });
            }}
            sx={{ mt: 1 }}
        >
            <MenuItem value="BILLABLE">💰 Billable</MenuItem>
            <MenuItem value="NON_BILLABLE">📋 Non-Billable</MenuItem>
            <MenuItem value="INVESTMENT">🎓 Investment</MenuItem>
        </TextField>
    </Box>
))}
```

#### **6.3. Update API Call**:
```jsx
const handleStartProject = async () => {
    try {
        const employeeIds = allocationData.selectedEmployees.map(emp => emp.id);
        const allocationTypes = allocationData.allocationTypes;
        
        await projectsAPI.start(projectToAllocate.id, {
            employeeIds,
            allocationTypes
        });
        
        setSuccess('Project started with allocations!');
        // ... refresh data ...
    } catch (err) {
        setError('Failed to start project');
    }
};
```

---

### **🚧 Step 7: Frontend - Update API** (TODO)

**File**: `api.js`

**Update**:
```javascript
export const employeesAPI = {
    // ... existing methods ...
    getAvailable: (skills, onlyAvailable, department) => {
        const params = new URLSearchParams();
        if (skills && skills.length > 0) params.append('skills', skills.join(','));
        if (onlyAvailable !== undefined) params.append('onlyAvailable', onlyAvailable);
        if (department) params.append('department', department);
        return api.get(`/employees/available?${params.toString()}`);
    },
};
```

---

### **🚧 Step 8: Frontend - Display Allocation Types** (TODO)

**In Ongoing Projects Tab**:
```jsx
<Chip 
    label={employee.allocationType}
    color={
        employee.allocationType === 'BILLABLE' ? 'success' :
        employee.allocationType === 'NON_BILLABLE' ? 'default' :
        'info'
    }
    size="small"
    icon={
        employee.allocationType === 'BILLABLE' ? <AttachMoney /> :
        employee.allocationType === 'NON_BILLABLE' ? <Work /> :
        <School />
    }
/>
```

---

## 📊 DATABASE CHANGES

### **New Column in `project_assignments` Table**:
```sql
ALTER TABLE project_assignments 
ADD COLUMN allocation_type VARCHAR(20) NOT NULL DEFAULT 'BILLABLE';
```

**Values**: 'BILLABLE', 'NON_BILLABLE', 'INVESTMENT'

---

## 🎨 UI MOCKUP

### **Resource Allocation Dialog**:
```
┌─────────────────────────────────────────────────────────┐
│ Allocate & Start Project: Mobile App Development       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Filter Employees:                                       │
│ ┌─────────────┐ ┌──────────────┐ ┌──────────────┐     │
│ │ Skills ▼    │ │ Availability │ │ Department ▼ │     │
│ │ [React]     │ │ Available ▼  │ │ Engineering  │     │
│ │ [TypeScript]│ │              │ │              │     │
│ └─────────────┘ └──────────────┘ └──────────────┘     │
│                                                         │
│ Select Employees:                                       │
│ ┌─────────────────────────────────────────────────┐   │
│ │ [×] John Doe - employee@skillbridge.com         │   │
│ │ [×] Jane Smith - jane@skillbridge.com           │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│ Allocation Details:                                     │
│ ┌─────────────────────────────────────────────────┐   │
│ │ John Doe                                        │   │
│ │ Allocation Type: [💰 Billable ▼]                │   │
│ └─────────────────────────────────────────────────┘   │
│ ┌─────────────────────────────────────────────────┐   │
│ │ Jane Smith                                      │   │
│ │ Allocation Type: [🎓 Investment ▼]              │   │
│ └─────────────────────────────────────────────────┘   │
│                                                         │
│              [Cancel]  [Allocate & Start Project]      │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ BENEFITS

### **For HR**:
- ✅ Filter employees by skills to find right talent
- ✅ See who's available vs. already assigned
- ✅ Track billable vs. non-billable allocations
- ✅ Better resource utilization visibility

### **For Management**:
- ✅ Track billable hours/resources
- ✅ Monitor investment in training/R&D
- ✅ Better project cost estimation
- ✅ Resource allocation analytics

### **For Employees**:
- ✅ See their allocation type
- ✅ Understand project categorization
- ✅ Track billable vs. learning time

---

## 📝 NEXT STEPS

1. ✅ Update ProjectAssignment entity (DONE)
2. ✅ Update StartProjectRequest DTO (DONE)
3. 🚧 Update ProjectService methods
4. 🚧 Add employee filtering API
5. 🚧 Create EmployeeAvailabilityDTO
6. 🚧 Update frontend filtering UI
7. 🚧 Add allocation type selection UI
8. 🚧 Test end-to-end flow

---

*Generated: 2025-12-18 01:00 IST*  
*Status: Backend Entity & DTO Updated - Service & Frontend Pending*
