# How to Generate ER Diagram using SQLFlow

## 📊 Tool: SQLFlow by Gudu Software
**Website**: https://sqlflow.gudusoft.com

---

## 🚀 Quick Steps

### Step 1: Open SQLFlow
Go to: **https://sqlflow.gudusoft.com**

### Step 2: Upload SQL File
1. Click on **"Upload SQL"** or **"Paste SQL"**
2. Use the file: `database/skillbridge_schema_for_er_diagram.sql`
3. Or copy-paste the entire SQL script

### Step 3: Select Database Type
- Choose: **PostgreSQL**

### Step 4: Generate Diagram
- Click **"Visualize"** or **"Generate ER Diagram"**
- Wait for processing (5-10 seconds)

### Step 5: Customize (Optional)
- **Layout**: Choose layout style (Hierarchical, Circular, etc.)
- **Zoom**: Adjust zoom level
- **Colors**: Customize table colors
- **Export**: Download as PNG, SVG, or PDF

---

## 📋 What You'll See in the Diagram

### 8 Tables (Entities):
1. **employees** - Blue/Primary color
2. **skills** - Green
3. **employee_skills** - Junction table
4. **projects** - Orange
5. **project_assignments** - Junction table
6. **role_projects** - Purple
7. **role_skill_requirements** - Junction table
8. **learning_resources** - Yellow

### Relationships (Lines):
- **Solid lines** = Foreign Key relationships
- **Arrows** = Direction of relationship (1:N)
- **Diamond** = Junction tables (many-to-many)

---

## 🔍 Key Relationships to Look For

### 1. Employee Hierarchy
```
employees (manager_id) → employees (id)
```
Self-referencing: Employees report to managers

### 2. Skill Management
```
employees → employee_skills ← skills
```
Many-to-many: Employees have many skills

### 3. Skill Approval Workflow
```
employees (approved_by) → employee_skills
```
Managers approve employee skills

### 4. Project Assignments
```
projects → project_assignments ← employees
```
Many-to-many: Projects have many employees

### 5. Gap Analysis
```
role_projects → role_skill_requirements ← skills
```
Roles/Projects require specific skills

### 6. Learning Path
```
skills → learning_resources
```
Each skill has learning materials

---

## 🎨 Alternative Tools (If SQLFlow doesn't work)

### Option 1: dbdiagram.io
**Website**: https://dbdiagram.io

**Steps**:
1. Go to dbdiagram.io
2. Click "Go to App"
3. Paste the SQL (it auto-converts)
4. Export as PNG/PDF

### Option 2: DrawSQL
**Website**: https://drawsql.app

**Steps**:
1. Sign up (free)
2. Create new diagram
3. Import SQL file
4. Customize and export

### Option 3: DBeaver (Desktop Tool)
**Download**: https://dbeaver.io

**Steps**:
1. Install DBeaver
2. Connect to your PostgreSQL database
3. Right-click database → "View Diagram"
4. Export as image

### Option 4: pgAdmin (If you have PostgreSQL)
**Steps**:
1. Open pgAdmin
2. Connect to SkillBridge database
3. Right-click schema → "Generate ERD"
4. Export diagram

---

## 📸 Expected Output

Your ER diagram will show:

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  employees  │────────▶│employee_    │◀────────│   skills    │
│             │ 1     * │skills       │ *     1 │             │
│ - id (PK)   │         │             │         │ - id (PK)   │
│ - name      │         │- employee_id│         │ - name      │
│ - email     │         │- skill_id   │         │ - category  │
│ - role      │         │- proficiency│         │             │
│ - manager_id│◀──┐     │- approval   │         │             │
└─────────────┘   │     └─────────────┘         └─────────────┘
      │           │                                    │
      │ 1         │                                  1 │
      │           │                                    │
      │ *         └─── Self-reference                * │
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│  project_   │────────▶│  projects   │◀────────│role_skill_  │
│assignments  │ *     1 │             │ 1     * │requirements │
│             │         │ - id (PK)   │         │             │
│- project_id │         │ - name      │         │- skill_id   │
│- employee_id│         │ - status    │         │- required_  │
│- allocation │         │ - owner_id  │         │  level      │
└─────────────┘         └─────────────┘         └─────────────┘
      ▲                                                │
      │                                                │
      │ *                                            * │
      │                                                │
      │                                                │ 1
┌─────────────┐                                 ┌─────────────┐
│  employees  │                                 │role_projects│
│  (again)    │                                 │             │
└─────────────┘                                 │ - id (PK)   │
                                                │ - name      │
                                                │ - type      │
                                                └─────────────┘
```

---

## 💡 Tips for Best Results

### 1. **Use SQLFlow's Features**:
- Enable "Show Columns" to see all fields
- Enable "Show Data Types" for detailed view
- Use "Compact Mode" for cleaner diagram

### 2. **Color Coding**:
- **Blue**: Core employee data
- **Green**: Skills and learning
- **Orange**: Projects
- **Purple**: Gap analysis

### 3. **Focus Areas**:
- **Skill Workflow**: employees → employee_skills → skills
- **Project Allocation**: projects → project_assignments → employees
- **Gap Analysis**: role_projects → role_skill_requirements → skills

### 4. **Export Options**:
- **PNG**: For presentations (high resolution)
- **SVG**: For documentation (scalable)
- **PDF**: For printing

---

## 🔧 Troubleshooting

### Issue 1: "SQL Syntax Error"
**Solution**: Make sure you selected **PostgreSQL** as database type

### Issue 2: "Too Complex"
**Solution**: 
- Generate diagram in sections
- Focus on 3-4 tables at a time
- Use "Simplify" option

### Issue 3: "Relationships Not Showing"
**Solution**: 
- Check that FOREIGN KEY constraints are included
- Enable "Show Relationships" option
- Refresh the diagram

---

## 📚 Understanding the Diagram

### Legend:

| Symbol | Meaning |
|--------|---------|
| **PK** | Primary Key |
| **FK** | Foreign Key |
| **1** | One (cardinality) |
| **N** or **\*** | Many (cardinality) |
| **Solid line** | Required relationship |
| **Dashed line** | Optional relationship |
| **Crow's foot** | Many side of relationship |

### Relationship Types:

1. **One-to-Many (1:N)**:
   - One employee has many skills
   - One project has many assignments

2. **Many-to-Many (M:N)**:
   - Employees ↔ Skills (via employee_skills)
   - Employees ↔ Projects (via project_assignments)

3. **Self-Referencing**:
   - Employee → Manager (same table)

---

## 🎯 What to Look For

### Data Flow Analysis:

1. **Employee Onboarding**:
   ```
   employees → employee_skills → skills
   ```

2. **Skill Approval**:
   ```
   employee_skills.approval_status: PENDING → APPROVED
   employee_skills.approved_by → employees (manager)
   ```

3. **Project Allocation**:
   ```
   projects → project_assignments → employees
   allocation_type: BILLABLE/NON_BILLABLE/INVESTMENT
   ```

4. **Gap Analysis**:
   ```
   employees → employee_skills → skills
   role_projects → role_skill_requirements → skills
   Compare to find gaps
   ```

5. **Learning Path**:
   ```
   Gap identified → skills → learning_resources
   ```

---

## 📥 Files Provided

1. **`skillbridge_schema_for_er_diagram.sql`**
   - Complete schema with all tables
   - All foreign keys and constraints
   - Detailed comments
   - Ready for SQLFlow

2. **This Guide**
   - How to use SQLFlow
   - Alternative tools
   - Troubleshooting tips

---

## ✅ Checklist

Before generating diagram:

- [ ] SQL file is ready
- [ ] SQLFlow website is open
- [ ] PostgreSQL is selected as database type
- [ ] SQL is pasted/uploaded
- [ ] "Visualize" button clicked

After generating diagram:

- [ ] All 8 tables are visible
- [ ] Relationships are shown with arrows
- [ ] Foreign keys are indicated
- [ ] Layout is readable
- [ ] Exported as PNG/PDF

---

## 🎓 Learning Resources

**SQLFlow Documentation**:
- https://sqlflow.gudusoft.com/docs

**ER Diagram Basics**:
- https://www.lucidchart.com/pages/er-diagrams

**Database Design**:
- https://www.guru99.com/database-design.html

---

**Created**: 2025-12-18  
**Tool**: SQLFlow (gudu.io)  
**Database**: SkillBridge PostgreSQL  
**Tables**: 8  
**Relationships**: 10+
