# SKILL APPROVAL WORKFLOW - IMPLEMENTATION PLAN

**Date**: 2025-12-18 01:50 IST  
**Feature**: Manager Approval for Employee Skills  
**Status**: 🚧 **IN PROGRESS**

---

## 🎯 REQUIREMENT

> "When anyone adds a skill, it stays in PENDING state until their manager approves it. Add a section of skill approval requests in manager. Any employee adds a skill, request goes to their respective manager. If he approves, then only the skill is added to DB. If rejected by manager, will not appear in your skill section."

---

## 📋 WORKFLOW

```
1. Employee adds skill
   ↓
2. Skill saved with status: PENDING
   ↓
3. Manager sees pending approval request
   ↓
4. Manager approves → Status: APPROVED (shows in employee skills)
   OR
   Manager rejects → Status: REJECTED (hidden from employee)
```

---

## 🗄️ DATABASE CHANGES

### **EmployeeSkill Entity** ✅ DONE

Added fields:
```java
@Enumerated(EnumType.STRING)
@Column(name = "approval_status", nullable = false)
private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;

@Column(name = "approved_by")
private Long approvedBy; // Manager ID

@Column(name = "approved_at")
private LocalDateTime approvedAt;

@Column(name = "rejection_reason")
private String rejectionReason;

public enum ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED
}
```

---

## 🔧 BACKEND IMPLEMENTATION

### **1. Repository** (EmployeeSkillRepository)
Add methods:
```java
List<EmployeeSkill> findByApprovalStatus(ApprovalStatus status);
List<EmployeeSkill> findByEmployeeIdAndApprovalStatus(Long employeeId, ApprovalStatus status);
List<EmployeeSkill> findPendingSkillsForManager(Long managerId);
```

### **2. DTOs**
Create:
- `SkillApprovalRequestDTO` - For approval/rejection
- `PendingSkillDTO` - For displaying pending skills to manager

### **3. Service** (EmployeeSkillService)
Add methods:
```java
List<PendingSkillDTO> getPendingSkillsForManager(Long managerId);
void approveSkill(Long skillId, Long managerId);
void rejectSkill(Long skillId, Long managerId, String reason);
```

### **4. Controller** (EmployeeSkillController)
Add endpoints:
```java
GET  /api/employee-skills/pending/manager/{managerId}
POST /api/employee-skills/{id}/approve
POST /api/employee-skills/{id}/reject
```

### **5. Update Existing Logic**
- When employee adds skill → Set `approvalStatus = PENDING`
- When fetching employee skills → Only show `APPROVED` skills
- When manager/HR adds skill → Set `approvalStatus = APPROVED` (auto-approve)

---

## 🎨 FRONTEND IMPLEMENTATION

### **1. Manager Dashboard**
Add new section:
```
📋 Skill Approval Requests (5)
┌─────────────────────────────────────┐
│ John Doe wants to add:              │
│ ☕ Java - Advanced (5 years)        │
│ [Approve] [Reject]                  │
├─────────────────────────────────────┤
│ Jane Smith wants to add:            │
│ ⚛️ React - Intermediate (2 years)   │
│ [Approve] [Reject]                  │
└─────────────────────────────────────┘
```

### **2. Employee My Skills Page**
Show status:
```
My Skills
┌─────────────────────────────────────┐
│ ✅ Java - Advanced (Approved)       │
│ ⏳ Python - Intermediate (Pending)  │
│ ❌ React - Beginner (Rejected)      │
│    Reason: Needs certification      │
└─────────────────────────────────────┘
```

### **3. Add Skill Flow**
```
1. Employee clicks "Add Skill"
2. Fills form
3. Clicks "Submit for Approval"
4. Shows: "Skill submitted! Waiting for manager approval"
5. Skill appears in "Pending" section
```

---

## 📊 UI MOCKUPS

### **Manager View - Skill Approvals Tab**
```
┌─────────────────────────────────────────────────────┐
│ 📋 Skill Approval Requests                          │
├─────────────────────────────────────────────────────┤
│ Filter: [All] [Pending] [Approved] [Rejected]      │
├─────────────────────────────────────────────────────┤
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 👤 John Doe                                 │   │
│ │ 📧 employee@skillbridge.com                 │   │
│ │                                             │   │
│ │ Wants to add:                               │   │
│ │ ☕ Java                                      │   │
│ │ Level: Advanced (3)                         │   │
│ │ Experience: 5 years                         │   │
│ │ Last Used: 2024-12-15                       │   │
│ │                                             │   │
│ │ Submitted: 2 hours ago                      │   │
│ │                                             │   │
│ │ [✅ Approve]  [❌ Reject]                    │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ ┌─────────────────────────────────────────────┐   │
│ │ 👤 Jane Smith                               │   │
│ │ 📧 jane@skillbridge.com                     │   │
│ │                                             │   │
│ │ Wants to add:                               │   │
│ │ ⚛️ React                                     │   │
│ │ Level: Intermediate (2)                     │   │
│ │ Experience: 2 years                         │   │
│ │                                             │   │
│ │ [✅ Approve]  [❌ Reject]                    │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### **Employee View - My Skills**
```
┌─────────────────────────────────────────────────────┐
│ 💼 My Skills                                        │
├─────────────────────────────────────────────────────┤
│ Tabs: [Approved] [Pending] [Rejected]              │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Approved Skills (3)                                 │
│ ┌─────────────────────────────────────────────┐   │
│ │ ✅ Java - Advanced                          │   │
│ │    Approved by: Alice Manager               │   │
│ │    Approved on: Dec 15, 2024                │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Pending Approval (1)                                │
│ ┌─────────────────────────────────────────────┐   │
│ │ ⏳ Python - Intermediate                    │   │
│ │    Waiting for manager approval...          │   │
│ │    Submitted: 2 hours ago                   │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ Rejected (1)                                        │
│ ┌─────────────────────────────────────────────┐   │
│ │ ❌ React - Beginner                         │   │
│ │    Rejected by: Alice Manager               │   │
│ │    Reason: Please get certification first   │   │
│ │    [Resubmit]                               │   │
│ └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW

### **Adding a Skill**:
```
Employee → Add Skill Form
  ↓
Frontend → POST /api/employee-skills
  ↓
Backend → Save with status=PENDING
  ↓
Database → employee_skills table
  ↓
Manager → Sees in pending requests
```

### **Approving a Skill**:
```
Manager → Click Approve
  ↓
Frontend → POST /api/employee-skills/{id}/approve
  ↓
Backend → Update:
  - approval_status = APPROVED
  - approved_by = manager_id
  - approved_at = now()
  ↓
Database → Updated
  ↓
Employee → Sees in approved skills
```

### **Rejecting a Skill**:
```
Manager → Click Reject → Enter reason
  ↓
Frontend → POST /api/employee-skills/{id}/reject
  ↓
Backend → Update:
  - approval_status = REJECTED
  - approved_by = manager_id
  - approved_at = now()
  - rejection_reason = reason
  ↓
Database → Updated
  ↓
Employee → Sees in rejected skills with reason
```

---

## ✅ IMPLEMENTATION CHECKLIST

### **Backend**:
- [x] Update EmployeeSkill entity with approval fields
- [ ] Add repository methods for pending skills
- [ ] Create DTOs (SkillApprovalRequestDTO, PendingSkillDTO)
- [ ] Update EmployeeSkillService
- [ ] Add approval endpoints to controller
- [ ] Update existing add skill logic
- [ ] Update get skills logic (filter by approval status)

### **Frontend**:
- [ ] Create SkillApprovals component for managers
- [ ] Update MySkills to show approval status
- [ ] Add approval status badges
- [ ] Add reject dialog with reason input
- [ ] Update add skill flow
- [ ] Add API calls for approve/reject
- [ ] Add notifications for approval/rejection

### **Testing**:
- [ ] Test employee adds skill → shows pending
- [ ] Test manager sees pending request
- [ ] Test manager approves → shows in employee skills
- [ ] Test manager rejects → doesn't show
- [ ] Test HR auto-approval
- [ ] Test rejection reason display

---

## 🎯 SUCCESS CRITERIA

✅ Employee adds skill → Status: PENDING  
✅ Manager sees pending requests for their team  
✅ Manager can approve → Skill shows in employee's list  
✅ Manager can reject → Skill hidden from employee  
✅ Rejection reason is displayed to employee  
✅ HR/Admin can add skills directly (auto-approved)  
✅ Only approved skills count for gap analysis  

---

*Generated: 2025-12-18 01:50 IST*  
*Status: Implementation Started - Entity Updated*
