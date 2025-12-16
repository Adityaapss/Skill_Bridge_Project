const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock data
const users = [
    { id: 1, email: 'admin@skillbridge.com', password: 'admin123', name: 'Admin User', role: 'HR_ADMIN', department: 'HR' },
    { id: 2, email: 'manager@skillbridge.com', password: 'manager123', name: 'Alice Manager', role: 'MANAGER', department: 'Engineering' },
    { id: 3, email: 'employee@skillbridge.com', password: 'employee123', name: 'John Doe', role: 'EMPLOYEE', department: 'Engineering' },
    { id: 4, email: 'jane@skillbridge.com', password: 'employee123', name: 'Jane Smith', role: 'EMPLOYEE', department: 'Engineering' }
];

const skills = [
    { id: 1, name: 'Java', category: 'LANGUAGE', description: 'Java programming', active: true },
    { id: 2, name: 'Spring Boot', category: 'FRAMEWORK', description: 'Spring Boot framework', active: true },
    { id: 3, name: 'React', category: 'FRAMEWORK', description: 'React library', active: true },
    { id: 4, name: 'PostgreSQL', category: 'DATABASE', description: 'PostgreSQL database', active: true },
    { id: 5, name: 'Docker', category: 'CLOUD', description: 'Docker containers', active: true }
];

let employeeSkills = [
    { id: 1, employeeId: 3, skillId: 1, skillName: 'Java', skillCategory: 'LANGUAGE', proficiencyLevel: 3, interestLevel: 3, yearsExperience: 5 },
    { id: 2, employeeId: 3, skillId: 2, skillName: 'Spring Boot', skillCategory: 'FRAMEWORK', proficiencyLevel: 3, interestLevel: 3, yearsExperience: 4 },
    { id: 3, employeeId: 3, skillId: 4, skillName: 'PostgreSQL', skillCategory: 'DATABASE', proficiencyLevel: 2, interestLevel: 2, yearsExperience: 3 }
];

const rolesProjects = [
    { id: 1, name: 'Backend Engineer L2', type: 'ROLE', description: 'Senior backend developer', ownerId: 2, ownerName: 'Alice Manager', status: 'ACTIVE' },
    { id: 2, name: 'Frontend Engineer L1', type: 'ROLE', description: 'Junior frontend developer', ownerId: 2, ownerName: 'Alice Manager', status: 'ACTIVE' }
];

const requirements = [
    { id: 1, roleProjectId: 1, skillId: 1, skillName: 'Java', skillCategory: 'LANGUAGE', requiredLevel: 2, importance: 'MUST_HAVE' },
    { id: 2, roleProjectId: 1, skillId: 2, skillName: 'Spring Boot', skillCategory: 'FRAMEWORK', requiredLevel: 2, importance: 'MUST_HAVE' },
    { id: 3, roleProjectId: 1, skillId: 4, skillName: 'PostgreSQL', skillCategory: 'DATABASE', requiredLevel: 2, importance: 'MUST_HAVE' },
    { id: 4, roleProjectId: 1, skillId: 5, skillName: 'Docker', skillCategory: 'CLOUD', requiredLevel: 2, importance: 'NICE_TO_HAVE' }
];

const learningResources = [
    { id: 1, title: 'Docker Fundamentals', url: 'https://docker.com/learn', type: 'COURSE', skillId: 5, skillName: 'Docker', level: 'BEGINNER', estimatedDuration: 10, isFree: true }
];

// Auth endpoints
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        res.json({
            token: 'mock-jwt-token-' + user.id,
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.get('/api/auth/me', (req, res) => {
    res.json(users[2]); // Return employee user
});

app.get('/api/health', (req, res) => {
    res.send('SkillBridge API is running (Mock)');
});

// Skills endpoints
app.get('/api/skills', (req, res) => {
    res.json(skills);
});

// Employee Skills endpoints
app.get('/api/employees/:id/skills', (req, res) => {
    const empSkills = employeeSkills.filter(es => es.employeeId == req.params.id);
    res.json(empSkills);
});

app.post('/api/employees/:id/skills', (req, res) => {
    const skill = skills.find(s => s.id == req.body.skillId);
    const newSkill = {
        id: employeeSkills.length + 1,
        employeeId: parseInt(req.params.id),
        skillId: req.body.skillId,
        skillName: skill.name,
        skillCategory: skill.category,
        proficiencyLevel: req.body.proficiencyLevel,
        interestLevel: req.body.interestLevel,
        yearsExperience: req.body.yearsExperience || 0
    };
    employeeSkills.push(newSkill);
    res.status(201).json(newSkill);
});

app.put('/api/employees/:empId/skills/:skillId', (req, res) => {
    const skill = employeeSkills.find(es => es.employeeId == req.params.empId && es.skillId == req.params.skillId);
    if (skill) {
        skill.proficiencyLevel = req.body.proficiencyLevel;
        skill.interestLevel = req.body.interestLevel;
        skill.yearsExperience = req.body.yearsExperience;
        res.json(skill);
    } else {
        res.status(404).json({ message: 'Skill not found' });
    }
});

app.delete('/api/employees/:empId/skills/:skillId', (req, res) => {
    employeeSkills = employeeSkills.filter(es => !(es.employeeId == req.params.empId && es.skillId == req.params.skillId));
    res.status(204).send();
});

// Roles & Projects endpoints
app.get('/api/roles-projects', (req, res) => {
    res.json(rolesProjects);
});

// Analytics endpoints
app.get('/api/analytics/employee/:id/gap', (req, res) => {
    const roleProjectId = parseInt(req.query.roleProjectId);
    const empSkills = employeeSkills.filter(es => es.employeeId == req.params.id);
    const roleReqs = requirements.filter(r => r.roleProjectId == roleProjectId);

    const skillMap = {};
    empSkills.forEach(es => {
        skillMap[es.skillId] = es.proficiencyLevel;
    });

    const gaps = [];
    const matches = [];
    const missing = [];
    let totalMet = 0;

    roleReqs.forEach(req => {
        const currentLevel = skillMap[req.skillId] || 0;
        if (currentLevel === 0) {
            missing.push({
                skillId: req.skillId,
                skillName: req.skillName,
                skillCategory: req.skillCategory,
                requiredLevel: req.requiredLevel,
                currentLevel: 0,
                gap: req.requiredLevel,
                importance: req.importance
            });
        } else if (currentLevel < req.requiredLevel) {
            gaps.push({
                skillId: req.skillId,
                skillName: req.skillName,
                skillCategory: req.skillCategory,
                requiredLevel: req.requiredLevel,
                currentLevel,
                gap: req.requiredLevel - currentLevel,
                importance: req.importance
            });
        } else {
            matches.push({
                skillId: req.skillId,
                skillName: req.skillName,
                requiredLevel: req.requiredLevel,
                currentLevel,
                importance: req.importance
            });
            totalMet++;
        }
    });

    const matchScore = roleReqs.length > 0 ? (totalMet / roleReqs.length) * 100 : 0;

    res.json({
        employeeId: parseInt(req.params.id),
        employeeName: 'John Doe',
        roleProjectId,
        roleProjectName: rolesProjects.find(rp => rp.id == roleProjectId)?.name || 'Unknown',
        matchScore: Math.round(matchScore * 100) / 100,
        gaps,
        matches,
        missing
    });
});

app.get('/api/analytics/employee/:id/recommendations', (req, res) => {
    const recommendations = [
        {
            skillId: 5,
            skillName: 'Docker',
            skillCategory: 'CLOUD',
            currentLevel: 0,
            targetLevel: 2,
            gap: 2,
            resources: learningResources
        }
    ];
    res.json(recommendations);
});

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`\n🚀 Mock SkillBridge Backend running on http://localhost:${PORT}/api`);
    console.log(`\n✅ Test login with: employee@skillbridge.com / employee123\n`);
});
