# TWO TYPES OF PROJECTS - EXPLANATION

**Date**: 2025-12-18 01:18 IST  
**Status**: 📋 **CLARIFICATION**

---

## 🤔 THE CONFUSION

**User Question**: "In the skill gap there are different upcoming and ongoing projects while in roles and project there are different why?"

---

## ✅ ANSWER: TWO SEPARATE SYSTEMS

Your application has **TWO different types of "projects"**:

### **1. Roles & Projects (Skill Gap Analysis)** 📊
**Table**: `roles_projects`  
**Purpose**: Define skill requirements for roles and hypothetical projects  
**Used For**: Skill gap analysis, learning recommendations

**Example Data**:
```
ID | Name                      | Type    | Purpose
---+---------------------------+---------+---------------------------
1  | Backend Engineer L2       | ROLE    | Define skills for this role
2  | Frontend Engineer L1      | ROLE    | Define skills for this role
3  | Cloud Migration Project   | PROJECT | Define skills needed
```

**Features**:
- ✅ Define required skills
- ✅ Set proficiency levels
- ✅ Used for gap analysis
- ❌ NOT actual work assignments
- ❌ NO employee allocations
- ❌ NO start/end dates

---

### **2. Real Projects (Project Management)** 🏢
**Table**: `projects`  
**Purpose**: Manage actual work projects with employee assignments  
**Used For**: Resource allocation, project tracking

**Example Data**:
```
ID | Name | Status   | Purpose
---+------+----------+---------------------------
1  | mhe  | ONGOING  | Real project with employees
```

**Features**:
- ✅ Actual work projects
- ✅ Employee assignments
- ✅ Start/end dates
- ✅ Status tracking (UPCOMING/ONGOING/COMPLETED)
- ✅ Resource allocation
- ✅ Allocation types (Billable/Non-Billable/Investment)

---

## 📊 COMPARISON

| Feature | Roles/Projects (Skill Gap) | Real Projects (Management) |
|---------|---------------------------|---------------------------|
| **Table** | `roles_projects` | `projects` |
| **Purpose** | Skill requirements | Actual work |
| **Employee Assignment** | ❌ No | ✅ Yes |
| **Skill Requirements** | ✅ Yes | ✅ Yes (tech stack) |
| **Start/End Dates** | ❌ No | ✅ Yes |
| **Status** | Active/Inactive | UPCOMING/ONGOING/COMPLETED |
| **Used In** | Skill Gaps page | Roles & Projects page |
| **Allocation Type** | ❌ No | ✅ Yes (Billable/etc) |

---

## 🔍 WHERE THEY'RE USED

### **Skill Gaps Page** (Employee View):
```
Uses: roles_projects table

Shows:
- "Backend Engineer L2" (ROLE)
- "Cloud Migration Project" (PROJECT)

Purpose:
- Compare employee's skills vs. required skills
- Show skill gaps
- Recommend learning resources
```

### **Roles & Projects Page** (HR View):
```
Uses BOTH tables:

Tab 1: "Roles & Projects" → roles_projects table
  - Manage skill requirements
  - Define roles and hypothetical projects

Tab 2: "Ongoing Projects" → projects table
  - Real ongoing work
  - Employee assignments
  - Resource allocation

Tab 3: "Upcoming Projects" → projects table
  - Future work
  - Ready to start

Tab 4: "Resource Allocation" → projects table
  - Start upcoming projects
  - Assign employees
```

---

## 🎯 WHY TWO SYSTEMS?

### **Reason 1: Different Purposes**
- **Roles/Projects**: "What skills do we need?"
- **Real Projects**: "Who's working on what?"

### **Reason 2: Different Lifecycles**
- **Roles/Projects**: Permanent definitions (roles don't change often)
- **Real Projects**: Temporary work (start, run, complete)

### **Reason 3: Different Users**
- **Roles/Projects**: HR defines skill requirements
- **Real Projects**: HR manages actual work assignments

---

## 💡 EXAMPLE SCENARIO

### **Scenario**: Company needs a "Backend Engineer L2"

#### **Step 1: Define Role (roles_projects)**
```
HR creates:
  Name: "Backend Engineer L2"
  Type: ROLE
  Required Skills:
    - Java (Advanced)
    - Spring Boot (Advanced)
    - PostgreSQL (Intermediate)
```

#### **Step 2: Employee Checks Gap (Skill Gaps page)**
```
Employee sees:
  Role: "Backend Engineer L2"
  My Skills: Java (Advanced), Spring Boot (Intermediate)
  Gaps: Spring Boot (need Advanced), PostgreSQL (need Intermediate)
  Recommendations: [Spring Boot courses]
```

#### **Step 3: Real Project Starts (projects)**
```
HR creates:
  Name: "Mobile App Backend"
  Type: UPCOMING
  Tech Stack: [Java, Spring Boot, PostgreSQL]
  
HR allocates:
  Employee: John Doe
  Allocation: BILLABLE
  Status: ONGOING
```

---

## 🗄️ DATABASE VERIFICATION

### **Check Roles/Projects**:
```sql
SELECT id, name, type FROM roles_projects;
```

**Current Data**:
```
1 | Backend Engineer L2     | ROLE
2 | Frontend Engineer L1    | ROLE
3 | Cloud Migration Project | PROJECT
```

### **Check Real Projects**:
```sql
SELECT id, name, status FROM projects;
```

**Current Data**:
```
1 | mhe | ONGOING
```

---

## ✅ THEY'RE BOTH CORRECT!

**It's NOT a bug** - it's by design:

1. **Skill Gaps page** shows `roles_projects` (skill requirements)
2. **Roles & Projects page** shows BOTH:
   - Tab 1: `roles_projects` (skill requirements)
   - Tabs 2-4: `projects` (actual work)

---

## 🎯 RECOMMENDATION

To avoid confusion, consider:

### **Option 1: Rename Tabs** (Clearer Labels)
```
Current:
  - "Roles & Projects" (confusing - which projects?)

Better:
  - "Skill Requirements" (for roles_projects)
  - "Work Projects" (for real projects)
```

### **Option 2: Separate Pages**
```
Page 1: "Skill Requirements"
  - Manage roles
  - Manage skill requirement templates

Page 2: "Project Management"
  - Ongoing projects
  - Upcoming projects
  - Resource allocation
```

### **Option 3: Keep As Is** (Document It)
Just make it clear in the UI:
```
Tab 1: "Roles & Skill Templates"
Tab 2: "Ongoing Work Projects"
Tab 3: "Upcoming Work Projects"
Tab 4: "Resource Allocation"
```

---

## 📝 SUMMARY

**Question**: Why different projects in Skill Gap vs. Roles & Projects?

**Answer**: 
- **Skill Gap** shows `roles_projects` (skill requirement templates)
- **Roles & Projects** shows BOTH:
  - `roles_projects` (skill templates) in Tab 1
  - `projects` (real work) in Tabs 2-4

**It's working correctly!** They serve different purposes.

---

*Generated: 2025-12-18 01:18 IST*  
*Status: Two Systems Working As Designed*
