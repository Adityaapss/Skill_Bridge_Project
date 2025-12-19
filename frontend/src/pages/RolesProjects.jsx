import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Card,
    CardContent,
    CardActions,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Autocomplete,
    MenuItem,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Person,
    PersonAdd,
    PersonRemove,
    PlayArrow,
    Schedule,
    Assignment,
    Code,
    Search,
    FilterList,
    ExpandMore,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { projectsAPI, skillsAPI, employeesAPI, employeeSkillsAPI } from '../services/api';

const RolesProjects = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [allSkills, setAllSkills] = useState([]);
    const [allEmployees, setAllEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Ongoing Projects State
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [expandedTeams, setExpandedTeams] = useState({}); // Track which project teams are expanded
    const [openAllocateDialog, setOpenAllocateDialog] = useState(false);

    // Upcoming Projects State
    const [upcomingProjects, setUpcomingProjects] = useState([]);
    const [openUpcomingDialog, setOpenUpcomingDialog] = useState(false);
    const [editingUpcoming, setEditingUpcoming] = useState(null);

    // Resource Allocation State
    const [openAllocationDialog, setOpenAllocationDialog] = useState(false);
    const [projectToAllocate, setProjectToAllocate] = useState(null);

    const [upcomingFormData, setUpcomingFormData] = useState({
        name: '',
        description: '',
        expectedStartDate: '',
        techStack: [],
    });

    const [allocationData, setAllocationData] = useState({
        selectedEmployees: [],
        allocationTypes: {}, // Map of employeeId to allocation type
    });

    // Filter states for resource allocation dialogs
    const [filterSearch, setFilterSearch] = useState('');
    const [filterSkills, setFilterSkills] = useState([]);
    const [filterDepartment, setFilterDepartment] = useState('ALL');
    const [filterAvailability, setFilterAvailability] = useState('ALL');
    const [filterAllocationType, setFilterAllocationType] = useState('ALL');

    // Enriched employees with skills and availability data
    const [enrichedEmployees, setEnrichedEmployees] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch skills
            const skillsResponse = await skillsAPI.getAll(true);
            setAllSkills(skillsResponse.data);

            // Fetch employees
            let employeesData = [];
            try {
                const employeesResponse = await employeesAPI.getAll();
                employeesData = employeesResponse.data;
                setAllEmployees(employeesData);
            } catch (err) {
                console.error('Failed to load employees:', err);
                setAllEmployees([]);
            }

            // Fetch ongoing projects
            let ongoingData = [];
            try {
                const ongoingResponse = await projectsAPI.getOngoing();
                ongoingData = ongoingResponse.data;
                setOngoingProjects(ongoingData);
            } catch (err) {
                console.error('Failed to load ongoing projects:', err);
                setOngoingProjects([]);
            }

            // Fetch upcoming projects
            try {
                const upcomingResponse = await projectsAPI.getUpcoming();
                setUpcomingProjects(upcomingResponse.data);
            } catch (err) {
                console.error('Failed to load upcoming projects:', err);
                setUpcomingProjects([]);
            }

            // Enrich employees with skills and availability data
            if (employeesData.length > 0) {
                const employeesWithData = await Promise.all(
                    employeesData.map(async (emp) => {
                        try {
                            const skillsData = await employeeSkillsAPI.getByEmployee(emp.id);

                            // Find projects this employee is assigned to
                            const assignedProjects = ongoingData.filter(project =>
                                project.assignedEmployees && project.assignedEmployees.some(assigned => assigned.employeeId === emp.id)
                            );

                            // Get allocation type from first project (if assigned)
                            const firstAssignment = assignedProjects.length > 0
                                ? assignedProjects[0].assignedEmployees.find(a => a.employeeId === emp.id)
                                : null;

                            return {
                                ...emp,
                                skills: skillsData.data,
                                availability: assignedProjects.length > 0 ? 'Busy' : 'Available',
                                billableStatus: firstAssignment?.allocationType || 'Not Assigned',
                                currentProject: assignedProjects.length > 0 ? assignedProjects[0].name : 'Not Assigned',
                                projectCount: assignedProjects.length,
                            };
                        } catch (err) {
                            return {
                                ...emp,
                                skills: [],
                                availability: 'Available',
                                billableStatus: 'Not Assigned',
                                currentProject: 'Not Assigned',
                                projectCount: 0,
                            };
                        }
                    })
                );
                setEnrichedEmployees(employeesWithData);
            }

        } catch (err) {
            setError('Failed to load data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Clear all filters
    const clearAllFilters = () => {
        setFilterSearch('');
        setFilterSkills([]);
        setFilterDepartment('ALL');
        setFilterAvailability('ALL');
        setFilterAllocationType('ALL');
    };

    // Get filtered employees based on current filter settings
    const getFilteredEmployees = (excludeAssigned = false, projectId = null) => {
        let employees = enrichedEmployees.length > 0 ? enrichedEmployees : allEmployees;

        // Exclude already assigned employees if needed
        if (excludeAssigned && projectId) {
            const project = ongoingProjects.find(p => p.id === projectId);
            if (project) {
                employees = employees.filter(emp => {
                    return !project.assignedEmployees?.some(assigned => assigned.employeeId === emp.id);
                });
            }
        }

        return employees.filter(emp => {
            // Search filter
            const matchesSearch = filterSearch === '' ||
                (emp.name && emp.name.toLowerCase().includes(filterSearch.toLowerCase())) ||
                (emp.email && emp.email.toLowerCase().includes(filterSearch.toLowerCase()));

            // Skills filter - only apply if we have enriched data
            const matchesSkills = filterSkills.length === 0 ||
                (emp.skills && Array.isArray(emp.skills) && filterSkills.every(selectedSkill =>
                    emp.skills.some(empSkill => empSkill.skillId === selectedSkill.id)
                ));

            // Department filter
            const matchesDepartment = filterDepartment === 'ALL' || emp.department === filterDepartment;

            // Availability filter - only apply if we have enriched data
            const matchesAvailability = filterAvailability === 'ALL' ||
                (emp.availability ? emp.availability === filterAvailability : filterAvailability === 'Available');

            // Allocation type filter - only apply if we have enriched data
            const matchesAllocationType = filterAllocationType === 'ALL' ||
                (emp.billableStatus ? emp.billableStatus === filterAllocationType : filterAllocationType === 'Not Assigned');

            return matchesSearch && matchesSkills && matchesDepartment &&
                matchesAvailability && matchesAllocationType;
        });
    };

    // Get unique values for filter dropdowns
    const departments = ['ALL', ...new Set(enrichedEmployees.map(e => e.department).filter(Boolean))];
    const availabilityOptions = ['ALL', 'Available', 'Busy'];
    const allocationTypeOptions = ['ALL', 'BILLABLE', 'NON_BILLABLE', 'INVESTMENT', 'Not Assigned'];

    // Ongoing Projects Functions
    const handleOpenAllocateDialog = (project) => {
        setSelectedProject(project);
        setAllocationData({ selectedEmployees: [], allocationTypes: {} });
        clearAllFilters();
        setOpenAllocateDialog(true);
    };

    const handleAllocateResource = async () => {
        if (allocationData.selectedEmployees.length === 0) {
            setError('Please select at least one employee');
            return;
        }

        try {
            // Assign each selected employee to the project with allocation type
            for (const employee of allocationData.selectedEmployees) {
                const allocationType = allocationData.allocationTypes[employee.id] || 'BILLABLE';
                await projectsAPI.assignEmployee(selectedProject.id, employee.id, allocationType);
            }

            setSuccess('Resources allocated successfully!');
            setOpenAllocateDialog(false);

            // Refresh ongoing projects
            const ongoingResponse = await projectsAPI.getOngoing();
            setOngoingProjects(ongoingResponse.data);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to allocate resources');
            console.error(err);
        }
    };

    const handleRemoveEmployee = async (projectId, employeeId) => {
        if (window.confirm('Remove this employee from the project?')) {
            try {
                await projectsAPI.unassignEmployee(projectId, employeeId);

                setSuccess('Employee removed from project');

                // Refresh ongoing projects
                const ongoingResponse = await projectsAPI.getOngoing();
                setOngoingProjects(ongoingResponse.data);

                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to remove employee');
                console.error(err);
            }
        }
    };

    // Upcoming Projects Functions
    const handleOpenUpcomingDialog = (project = null) => {
        if (project) {
            setEditingUpcoming(project);
            setUpcomingFormData({
                name: project.name,
                description: project.description,
                expectedStartDate: project.expectedStartDate,
                techStack: project.techStack || [],
            });
        } else {
            setEditingUpcoming(null);
            setUpcomingFormData({
                name: '',
                description: '',
                expectedStartDate: '',
                techStack: [],
            });
        }
        setOpenUpcomingDialog(true);
    };

    const handleSaveUpcoming = async () => {
        if (!upcomingFormData.name || !upcomingFormData.expectedStartDate) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            if (editingUpcoming) {
                // Update existing
                await projectsAPI.update(editingUpcoming.id, upcomingFormData);
                setSuccess('Project updated successfully!');
            } else {
                // Add new
                await projectsAPI.create(upcomingFormData);
                setSuccess('Project added successfully!');
            }

            setOpenUpcomingDialog(false);

            // Refresh upcoming projects
            const upcomingResponse = await projectsAPI.getUpcoming();
            setUpcomingProjects(upcomingResponse.data);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to save project');
            console.error(err);
        }
    };

    const handleDeleteUpcoming = async (projectId) => {
        if (window.confirm('Delete this upcoming project?')) {
            try {
                await projectsAPI.delete(projectId);

                setSuccess('Project deleted successfully');

                // Refresh upcoming projects
                const upcomingResponse = await projectsAPI.getUpcoming();
                setUpcomingProjects(upcomingResponse.data);

                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete project');
                console.error(err);
            }
        }
    };

    // Resource Allocation Functions
    const handleOpenAllocationDialog = (project) => {
        setProjectToAllocate(project);
        setAllocationData({ selectedEmployees: [], allocationTypes: {} });
        clearAllFilters();
        setOpenAllocationDialog(true);
    };

    const handleStartProject = async () => {
        if (allocationData.selectedEmployees.length === 0) {
            setError('Please allocate at least one employee before starting the project');
            return;
        }

        try {
            const employeeIds = allocationData.selectedEmployees.map(emp => emp.id);
            const allocationTypes = allocationData.allocationTypes;

            await projectsAPI.start(projectToAllocate.id, {
                employeeIds,
                allocationTypes
            });

            setSuccess('Project started and moved to Ongoing Projects!');
            setOpenAllocationDialog(false);

            // Refresh both ongoing and upcoming projects
            const ongoingResponse = await projectsAPI.getOngoing();
            setOngoingProjects(ongoingResponse.data);

            const upcomingResponse = await projectsAPI.getUpcoming();
            setUpcomingProjects(upcomingResponse.data);

            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to start project');
            console.error(err);
        }
    };

    // Helper functions for display
    const getSkillName = (skillId) => {
        const skill = allSkills.find(s => s.id === skillId);
        return skill ? skill.name : 'Unknown';
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || '-';
    };

    const getBillableLabel = (status) => {
        const labels = {
            'BILLABLE': '💰 Billable',
            'NON_BILLABLE': '📋 Non-Billable',
            'INVESTMENT': '🎓 Investment',
            'Not Assigned': 'Not Assigned'
        };
        return labels[status] || status;
    };

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            {/* Modern Header */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: 2,
                }}
            >
                <Typography variant="h3" gutterBottom fontWeight="bold">
                    📋 Project Management
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                    Manage ongoing projects, plan upcoming projects, and allocate resources efficiently
                </Typography>
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Enhanced Tabs */}
                <Box sx={{ borderBottom: 2, borderColor: 'primary.main', mb: 3 }}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, v) => setTabValue(v)}
                        sx={{
                            '& .MuiTab-root': {
                                fontWeight: 'bold',
                                fontSize: '1rem',
                            },
                            '& .Mui-selected': {
                                color: 'primary.main',
                            },
                        }}
                    >
                        <Tab
                            icon={<PlayArrow />}
                            iconPosition="start"
                            label={`Ongoing Projects (${ongoingProjects.length})`}
                        />
                        <Tab
                            icon={<Schedule />}
                            iconPosition="start"
                            label={`Upcoming Projects (${upcomingProjects.length})`}
                        />
                        <Tab
                            icon={<Assignment />}
                            iconPosition="start"
                            label="Resource Allocation"
                        />
                    </Tabs>
                </Box>

                {/* Tab 1: Ongoing Projects */}
                {tabValue === 0 && (
                    <Box>
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.dark">
                                🚀 Ongoing Projects
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                View active projects, see assigned employees, and manage resources
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            {ongoingProjects.length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                                        <Typography variant="h6" color="text.secondary" gutterBottom>
                                            No ongoing projects
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Start an upcoming project to see it here
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                ongoingProjects.map((project) => (
                                    <Grid item xs={12} lg={6} key={project.id}>
                                        <Card
                                            elevation={3}
                                            sx={{
                                                height: '100%',
                                                transition: 'transform 0.2s, box-shadow 0.2s',
                                                '&:hover': {
                                                    transform: 'translateY(-4px)',
                                                    boxShadow: 6,
                                                },
                                            }}
                                        >
                                            <CardContent sx={{ p: 3 }}>
                                                {/* Project Header */}
                                                <Box sx={{ mb: 3 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                                        <Typography variant="h5" fontWeight="bold" color="primary.dark">
                                                            {project.name}
                                                        </Typography>
                                                        <Chip
                                                            label={project.status}
                                                            color="success"
                                                            size="small"
                                                            sx={{ fontWeight: 'bold' }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {project.description}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Schedule fontSize="small" />
                                                        Started: {project.startDate}
                                                    </Typography>
                                                </Box>

                                                <Divider sx={{ my: 2 }} />

                                                {/* Tech Stack Section */}
                                                <Box sx={{ mb: 3 }}>
                                                    <Typography variant="subtitle2" gutterBottom fontWeight="bold" color="primary">
                                                        <Code fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                        Tech Stack
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {project.techStack && project.techStack.length > 0 ? (
                                                            project.techStack.map((tech, idx) => (
                                                                <Chip
                                                                    key={idx}
                                                                    label={tech}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="primary"
                                                                />
                                                            ))
                                                        ) : (
                                                            <Typography variant="caption" color="text.secondary">
                                                                No tech stack defined
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>

                                                {/* Team Section - Collapsible */}
                                                <Box sx={{
                                                    bgcolor: 'grey.50',
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}>
                                                    {/* Clickable Header */}
                                                    <Box
                                                        onClick={() => setExpandedTeams(prev => ({
                                                            ...prev,
                                                            [project.id]: !prev[project.id]
                                                        }))}
                                                        sx={{
                                                            p: 2,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                            cursor: 'pointer',
                                                            '&:hover': {
                                                                bgcolor: 'action.hover',
                                                            },
                                                            borderRadius: 1,
                                                            transition: 'background-color 0.2s',
                                                        }}
                                                    >
                                                        <Typography variant="subtitle2" fontWeight="bold" color="primary">
                                                            <Person fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                            Team Members ({project.assignedEmployees ? project.assignedEmployees.length : 0})
                                                        </Typography>
                                                        <ExpandMore
                                                            sx={{
                                                                transform: expandedTeams[project.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                                                                transition: 'transform 0.3s',
                                                            }}
                                                        />
                                                    </Box>

                                                    {/* Collapsible Content */}
                                                    {expandedTeams[project.id] && (
                                                        <Box sx={{ px: 2, pb: 2 }}>
                                                            {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
                                                                <Box sx={{ mt: 1 }}>
                                                                    {project.assignedEmployees.map((emp) => (
                                                                        <Box
                                                                            key={emp.employeeId}
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                p: 1.5,
                                                                                mb: 1,
                                                                                bgcolor: 'white',
                                                                                borderRadius: 1,
                                                                                border: '1px solid',
                                                                                borderColor: 'divider',
                                                                                '&:hover': {
                                                                                    bgcolor: 'action.hover',
                                                                                },
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1 }}>
                                                                                <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                                                                                    {emp.name.charAt(0)}
                                                                                </Avatar>
                                                                                <Box sx={{ flex: 1 }}>
                                                                                    <Typography variant="body2" fontWeight="bold">
                                                                                        {emp.name}
                                                                                    </Typography>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                                                                        <Typography variant="caption" color="text.secondary">
                                                                                            {emp.role}
                                                                                        </Typography>
                                                                                        <Chip
                                                                                            label={
                                                                                                emp.allocationType === 'BILLABLE' ? '💰 Billable' :
                                                                                                    emp.allocationType === 'NON_BILLABLE' ? '📋 Non-Billable' :
                                                                                                        emp.allocationType === 'INVESTMENT' ? '🎓 Investment' :
                                                                                                            '💰 Billable'
                                                                                            }
                                                                                            size="small"
                                                                                            color={
                                                                                                emp.allocationType === 'BILLABLE' ? 'success' :
                                                                                                    emp.allocationType === 'NON_BILLABLE' ? 'default' :
                                                                                                        emp.allocationType === 'INVESTMENT' ? 'info' :
                                                                                                            'success'
                                                                                            }
                                                                                            sx={{ height: 18, fontSize: '0.65rem' }}
                                                                                        />
                                                                                    </Box>
                                                                                </Box>
                                                                            </Box>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleRemoveEmployee(project.id, emp.employeeId);
                                                                                }}
                                                                                color="error"
                                                                                sx={{
                                                                                    '&:hover': {
                                                                                        bgcolor: 'error.lighter',
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <PersonRemove fontSize="small" />
                                                                            </IconButton>
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            ) : (
                                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                                    No team members assigned yet
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>

                                            <Divider />

                                            <CardActions sx={{ p: 2, bgcolor: 'grey.50' }}>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    startIcon={<PersonAdd />}
                                                    onClick={() => handleOpenAllocateDialog(project)}
                                                    fullWidth
                                                    sx={{ fontWeight: 'bold' }}
                                                >
                                                    Allocate Resource
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Tab 2: Upcoming Projects */}
                {tabValue === 1 && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold">
                                    Upcoming Projects
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Plan future projects with tech stack for gap analysis
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenUpcomingDialog()}
                            >
                                Add Upcoming Project
                            </Button>
                        </Box>

                        <Grid container spacing={3}>
                            {upcomingProjects.length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No upcoming projects
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Click "Add Upcoming Project" to plan a new project
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                upcomingProjects.map((project) => (
                                    <Grid item xs={12} md={6} key={project.id}>
                                        <Card elevation={3}>
                                            <CardContent>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                                    <Box>
                                                        <Typography variant="h6" fontWeight="bold">
                                                            {project.name}
                                                        </Typography>
                                                        <Chip label={project.status} color="warning" size="small" sx={{ mt: 1 }} />
                                                    </Box>
                                                    <Box>
                                                        <IconButton size="small" onClick={() => handleOpenUpcomingDialog(project)}>
                                                            <Edit />
                                                        </IconButton>
                                                        <IconButton size="small" onClick={() => handleDeleteUpcoming(project.id)} color="error">
                                                            <Delete />
                                                        </IconButton>
                                                    </Box>
                                                </Box>

                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {project.description}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    Expected Start: {project.expectedStartDate}
                                                </Typography>

                                                <Divider sx={{ my: 2 }} />

                                                {/* Tech Stack */}
                                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                                    <Code fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Tech Stack
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                                                    {project.techStack && project.techStack.map((tech, idx) => (
                                                        <Chip key={idx} label={tech} size="small" color="primary" variant="outlined" />
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </Box>
                )}

                {/* Tab 3: Resource Allocation */}
                {tabValue === 2 && (
                    <Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold">
                            Resource Allocation
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Allocate resources to upcoming projects and start them
                        </Typography>

                        <Grid container spacing={3}>
                            {upcomingProjects.length === 0 ? (
                                <Grid item xs={12}>
                                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.secondary">
                                            No projects available for allocation
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Add upcoming projects first to allocate resources
                                        </Typography>
                                    </Paper>
                                </Grid>
                            ) : (
                                upcomingProjects.map((project) => (
                                    <Grid item xs={12} md={6} key={project.id}>
                                        <Card elevation={3} sx={{ bgcolor: 'info.lighter' }}>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                    {project.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {project.description}
                                                </Typography>

                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Expected Start: {project.expectedStartDate}
                                                    </Typography>
                                                </Box>

                                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                                    <Code fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                                                    Tech Stack (for Gap Analysis)
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {project.techStack && project.techStack.map((tech, idx) => (
                                                        <Chip key={idx} label={tech} size="small" color="primary" variant="outlined" />
                                                    ))}
                                                </Box>
                                            </CardContent>
                                            <CardActions>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    startIcon={<PersonAdd />}
                                                    onClick={() => handleOpenAllocationDialog(project)}
                                                >
                                                    Allocate & Start Project
                                                </Button>
                                            </CardActions>
                                        </Card>
                                    </Grid>
                                ))
                            )}
                        </Grid>
                    </Box>
                )}
            </Paper>

            {/* Allocate Resource Dialog (for ongoing projects) */}
            <Dialog open={openAllocateDialog} onClose={() => setOpenAllocateDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Allocate Resources to {selectedProject?.name}</span>
                        <Button size="small" onClick={clearAllFilters} startIcon={<FilterList />}>
                            Clear Filters
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* Filter Section */}
                        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Filter Resources
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                {/* Search Bar */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Search by Name or Email"
                                        value={filterSearch}
                                        onChange={(e) => setFilterSearch(e.target.value)}
                                        placeholder="e.g., John, john@example.com"
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>

                                {/* Skills Filter */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={allSkills}
                                        getOptionLabel={(option) => option.name}
                                        value={filterSkills}
                                        onChange={(event, newValue) => setFilterSkills(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Filter by Skills"
                                                placeholder="Select skills..."
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={option.name}
                                                    {...getTagProps({ index })}
                                                    size="small"
                                                    color="primary"
                                                />
                                            ))
                                        }
                                    />
                                </Grid>

                                {/* Department Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Department"
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept} value={dept}>
                                                {dept}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Availability Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Availability"
                                        value={filterAvailability}
                                        onChange={(e) => setFilterAvailability(e.target.value)}
                                    >
                                        {availabilityOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Allocation Type Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Current Allocation"
                                        value={filterAllocationType}
                                        onChange={(e) => setFilterAllocationType(e.target.value)}
                                    >
                                        {allocationTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option === 'ALL' ? 'ALL' : getBillableLabel(option)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                Showing {getFilteredEmployees(true, selectedProject?.id).length} available resources
                            </Typography>
                        </Paper>

                        {/* Employee Selection */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select employees to allocate to this project
                        </Typography>

                        <Autocomplete
                            multiple
                            options={getFilteredEmployees(true, selectedProject?.id)}
                            getOptionLabel={(option) => `${option.name || 'Unknown'} - ${option.email || ''} (${option.jobTitle || option.role || 'N/A'})`}
                            value={allocationData.selectedEmployees}
                            onChange={(event, newValue) => {
                                // Initialize allocation types for new employees
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
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Employees to Allocate"
                                    placeholder="Choose employees..."
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {option.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip
                                                    label={option.availability || 'Available'}
                                                    size="small"
                                                    color={(option.availability === 'Available') ? 'success' : 'error'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                {option.billableStatus && option.billableStatus !== 'Not Assigned' && (
                                                    <Chip
                                                        label={getBillableLabel(option.billableStatus)}
                                                        size="small"
                                                        color={
                                                            option.billableStatus === 'BILLABLE' ? 'success' :
                                                                option.billableStatus === 'NON_BILLABLE' ? 'default' :
                                                                    option.billableStatus === 'INVESTMENT' ? 'info' : 'default'
                                                        }
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.email || 'No email'} • {option.jobTitle || option.role || 'N/A'} • {option.department || 'No Dept'}
                                        </Typography>
                                        {option.skills && option.skills.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                {option.skills.slice(0, 3).map((skill) => (
                                                    <Chip
                                                        key={skill.id}
                                                        label={getSkillName(skill.skillId)}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 18, fontSize: '0.65rem' }}
                                                    />
                                                ))}
                                                {option.skills.length > 3 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        +{option.skills.length - 3} more
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </li>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        size="small"
                                        color="primary"
                                    />
                                ))
                            }
                        />

                        {/* Allocation Type Selection for Each Employee */}
                        {allocationData.selectedEmployees.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                    Set Allocation Type for Each Employee:
                                </Typography>
                                {allocationData.selectedEmployees.map((employee) => (
                                    <Box
                                        key={employee.id}
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            bgcolor: 'background.default'
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            {employee.name}
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
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
                                            <MenuItem value="BILLABLE">💰 Billable (Client Work)</MenuItem>
                                            <MenuItem value="NON_BILLABLE">📋 Non-Billable (Internal)</MenuItem>
                                            <MenuItem value="INVESTMENT">🎓 Investment (Training/R&D)</MenuItem>
                                        </TextField>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {allocationData.selectedEmployees.length > 0 && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {allocationData.selectedEmployees.length} employee(s) selected for allocation
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllocateDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleAllocateResource} variant="contained">
                        Allocate Selected
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Upcoming Project Dialog */}
            <Dialog open={openUpcomingDialog} onClose={() => setOpenUpcomingDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>{editingUpcoming ? 'Edit' : 'Add'} Upcoming Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Project Name"
                            value={upcomingFormData.name}
                            onChange={(e) => setUpcomingFormData({ ...upcomingFormData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={upcomingFormData.description}
                            onChange={(e) => setUpcomingFormData({ ...upcomingFormData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            fullWidth
                            label="Expected Start Date"
                            type="date"
                            value={upcomingFormData.expectedStartDate}
                            onChange={(e) => setUpcomingFormData({ ...upcomingFormData, expectedStartDate: e.target.value })}
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <Autocomplete
                            multiple
                            options={allSkills}
                            getOptionLabel={(option) => option.name}
                            value={allSkills.filter(skill => upcomingFormData.techStack.includes(skill.name))}
                            onChange={(event, newValue) => {
                                setUpcomingFormData({
                                    ...upcomingFormData,
                                    techStack: newValue.map(skill => skill.name)
                                });
                            }}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Tech Stack (for Gap Analysis)"
                                    placeholder="Select technologies..."
                                    margin="normal"
                                />
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        size="small"
                                        color="primary"
                                    />
                                ))
                            }
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpcomingDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSaveUpcoming} variant="contained">
                        {editingUpcoming ? 'Update' : 'Add'} Project
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Resource Allocation Dialog (for starting projects) */}
            <Dialog open={openAllocationDialog} onClose={() => setOpenAllocationDialog(false)} maxWidth="lg" fullWidth>
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>Allocate Resources & Start Project: {projectToAllocate?.name}</span>
                        <Button size="small" onClick={clearAllFilters} startIcon={<FilterList />}>
                            Clear Filters
                        </Button>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {/* Filter Section */}
                        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <FilterList sx={{ mr: 1, color: 'primary.main' }} />
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Filter Resources
                                </Typography>
                            </Box>

                            <Grid container spacing={2}>
                                {/* Search Bar */}
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Search by Name or Email"
                                        value={filterSearch}
                                        onChange={(e) => setFilterSearch(e.target.value)}
                                        placeholder="e.g., John, john@example.com"
                                        InputProps={{
                                            startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                                        }}
                                    />
                                </Grid>

                                {/* Skills Filter */}
                                <Grid item xs={12} md={6}>
                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={allSkills}
                                        getOptionLabel={(option) => option.name}
                                        value={filterSkills}
                                        onChange={(event, newValue) => setFilterSkills(newValue)}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Filter by Skills"
                                                placeholder="Select skills..."
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    label={option.name}
                                                    {...getTagProps({ index })}
                                                    size="small"
                                                    color="primary"
                                                />
                                            ))
                                        }
                                    />
                                </Grid>

                                {/* Department Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Department"
                                        value={filterDepartment}
                                        onChange={(e) => setFilterDepartment(e.target.value)}
                                    >
                                        {departments.map((dept) => (
                                            <MenuItem key={dept} value={dept}>
                                                {dept}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Availability Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Availability"
                                        value={filterAvailability}
                                        onChange={(e) => setFilterAvailability(e.target.value)}
                                    >
                                        {availabilityOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>

                                {/* Allocation Type Filter */}
                                <Grid item xs={12} sm={4}>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        label="Current Allocation"
                                        value={filterAllocationType}
                                        onChange={(e) => setFilterAllocationType(e.target.value)}
                                    >
                                        {allocationTypeOptions.map((option) => (
                                            <MenuItem key={option} value={option}>
                                                {option === 'ALL' ? 'ALL' : getBillableLabel(option)}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            </Grid>

                            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                Showing {getFilteredEmployees(false, null).length} available resources
                            </Typography>
                        </Paper>

                        {/* Employee Selection */}
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Select employees to allocate to this project. The project will start immediately.
                        </Typography>

                        <Autocomplete
                            multiple
                            options={getFilteredEmployees(false, null)}
                            getOptionLabel={(option) => `${option.name || 'Unknown'} - ${option.email || ''} (${option.jobTitle || option.role || 'N/A'})`}
                            value={allocationData.selectedEmployees}
                            onChange={(event, newValue) => {
                                // Initialize allocation types for new employees
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
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Employees to Allocate"
                                    placeholder="Choose employees..."
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Typography variant="body2" fontWeight="bold">
                                                {option.name}
                                            </Typography>
                                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                                <Chip
                                                    label={option.availability || 'Available'}
                                                    size="small"
                                                    color={(option.availability === 'Available') ? 'success' : 'error'}
                                                    sx={{ height: 20, fontSize: '0.7rem' }}
                                                />
                                                {option.billableStatus && option.billableStatus !== 'Not Assigned' && (
                                                    <Chip
                                                        label={getBillableLabel(option.billableStatus)}
                                                        size="small"
                                                        color={
                                                            option.billableStatus === 'BILLABLE' ? 'success' :
                                                                option.billableStatus === 'NON_BILLABLE' ? 'default' :
                                                                    option.billableStatus === 'INVESTMENT' ? 'info' : 'default'
                                                        }
                                                        sx={{ height: 20, fontSize: '0.7rem' }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {option.email || 'No email'} • {option.jobTitle || option.role || 'N/A'} • {option.department || 'No Dept'}
                                        </Typography>
                                        {option.skills && option.skills.length > 0 && (
                                            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                                                {option.skills.slice(0, 3).map((skill) => (
                                                    <Chip
                                                        key={skill.id}
                                                        label={getSkillName(skill.skillId)}
                                                        size="small"
                                                        variant="outlined"
                                                        sx={{ height: 18, fontSize: '0.65rem' }}
                                                    />
                                                ))}
                                                {option.skills.length > 3 && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        +{option.skills.length - 3} more
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                </li>
                            )}
                            renderTags={(value, getTagProps) =>
                                value.map((option, index) => (
                                    <Chip
                                        label={option.name}
                                        {...getTagProps({ index })}
                                        size="small"
                                        color="primary"
                                    />
                                ))
                            }
                        />

                        {/* Allocation Type Selection for Each Employee */}
                        {allocationData.selectedEmployees.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                    Set Allocation Type for Each Employee:
                                </Typography>
                                {allocationData.selectedEmployees.map((employee) => (
                                    <Box
                                        key={employee.id}
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            border: '1px solid #e0e0e0',
                                            borderRadius: 1,
                                            bgcolor: 'background.default'
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                                            {employee.name}
                                        </Typography>
                                        <TextField
                                            select
                                            fullWidth
                                            size="small"
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
                                            <MenuItem value="BILLABLE">💰 Billable (Client Work)</MenuItem>
                                            <MenuItem value="NON_BILLABLE">📋 Non-Billable (Internal)</MenuItem>
                                            <MenuItem value="INVESTMENT">🎓 Investment (Training/R&D)</MenuItem>
                                        </TextField>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {allocationData.selectedEmployees.length > 0 && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {allocationData.selectedEmployees.length} employee(s) selected. Project will start immediately.
                            </Alert>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAllocationDialog(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleStartProject} variant="contained" color="success">
                        Allocate & Start Project
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default RolesProjects;
