# SkillBridge ER Diagram - Quick Start

## 🎯 **3-Step Process**

### Step 1: Go to SQLFlow
**URL**: https://sqlflow.gudusoft.com

### Step 2: Upload SQL
**File**: `database/skillbridge_schema_for_er_diagram.sql`

### Step 3: Generate
- Select: **PostgreSQL**
- Click: **Visualize**
- Done! 🎉

---

## 📊 **What You'll Get**

### 8 Tables (Actual Database):
1. ✅ **employees** - Employee master data (with manager hierarchy)
2. ✅ **skills** - Skill catalog  
3. ✅ **employee_skills** - Employee-Skill mapping (with approval workflow)
4. ✅ **projects** - Project master data
5. ✅ **project_tech_stack** - Technologies required for each project
6. ✅ **project_assignments** - Employee-Project assignments (with allocation type)
7. ✅ **learning_resources** - Learning materials
8. ✅ **users** - Authentication table (separate from employees)

### 8+ Relationships:
- Employee → Manager (self-reference)
- Employee → Skills (many-to-many via employee_skills)
- Employee → Projects (many-to-many via project_assignments)
- Manager → Skill Approvals
- Project → Technologies (1:N via project_tech_stack)
- Project → Assignments
- Skill → Learning Resources

---

## 🔍 **Key Data Flows**

### Flow 1: Skill Management
```
Employee adds skill → PENDING
    ↓
Manager reviews
    ↓
APPROVED or REJECTED
```

### Flow 2: Project Allocation
```
HR creates project
    ↓
HR allocates employees
    ↓
Sets allocation type (Billable/Non-Billable/Investment)
    ↓
Employees assigned to project
```

### Flow 3: Gap Analysis
```
Employee skills ← Compare → Role requirements
    ↓
Identify gaps
    ↓
Recommend learning resources
```

---

## 📁 **Files Created**

1. **`skillbridge_schema_for_er_diagram.sql`**
   - Complete SQL schema
   - All tables, relationships, constraints
   - Ready for SQLFlow

2. **`ER_DIAGRAM_GUIDE.md`**
   - Detailed instructions
   - Alternative tools
   - Troubleshooting

3. **This file** - Quick reference

---

## 🎨 **Alternative Tools**

If SQLFlow doesn't work:

1. **dbdiagram.io** - Free, online, easy
2. **DrawSQL** - Professional, requires signup
3. **DBeaver** - Desktop tool (if you have PostgreSQL)
4. **pgAdmin** - Built-in ERD tool

---

## ✅ **Quick Checklist**

- [ ] Open https://sqlflow.gudusoft.com
- [ ] Upload `skillbridge_schema_for_er_diagram.sql`
- [ ] Select PostgreSQL
- [ ] Click Visualize
- [ ] Export as PNG/PDF

---

**That's it!** Your ER diagram will be ready in seconds. 🚀
