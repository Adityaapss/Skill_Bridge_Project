import React, { useState, useEffect } from 'react';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Divider,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import {
    Category,
    MenuBook,
    People,
    Work,
    CheckCircle,
    Code,
    ExpandMore,
    Assignment,
    Group,
    Email,
    Business,
    Schedule,
    Person,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { skillsAPI, learningResourcesAPI, employeesAPI, projectsAPI } from '../services/api';
import SkillApprovals from '../components/SkillApprovals';
import PageSkeleton from '../components/PageSkeleton';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // HR/Manager Dashboard State
    const [stats, setStats] = useState({});

    // Employee Dashboard State
    const [employeeDashboard, setEmployeeDashboard] = useState(null);
    const [managedEmployees, setManagedEmployees] = useState([]);

    useEffect(() => {
        if (user.role === 'EMPLOYEE') {
            fetchEmployeeDashboard();
        } else {
            fetchHRManagerDashboard();
        }
    }, [user.role, user.id]);

    const fetchHRManagerDashboard = async () => {
        try {
            setLoading(true);

            if (user.role === 'HR_ADMIN') {
                // HR Admin - fetch organization-wide stats
                const [skillsResponse, resourcesResponse, employeesResponse, projectsResponse] = await Promise.all([
                    skillsAPI.getAll(true),
                    learningResourcesAPI.getAll(),
                    employeesAPI.getAll(),
                    projectsAPI.getOngoing(),
                ]);

                setStats({
                    skillCatalogCount: skillsResponse.data.length,
                    learningResourcesCount: resourcesResponse.data.length,
                    totalEmployeesCount: employeesResponse.data.length,
                    ongoingProjectsCount: projectsResponse.data.length,
                });
            } else {
                // Manager - fetch personal stats
                const dashboardResponse = await employeesAPI.getDashboard(user.id);
                const employeesResponse = await employeesAPI.getAll();
                const managed = employeesResponse.data.filter(emp => emp.managerId === user.id);

                setEmployeeDashboard(dashboardResponse.data);
                setManagedEmployees(managed);
                setStats({
                    approvedSkillsCount: dashboardResponse.data.approvedSkillsCount || 0,
                    activeProjectsCount: dashboardResponse.data.assignedProjects?.length || 0,
                    managedEmployeesCount: managed.length,
                });
            }
        } catch (err) {
            console.error('Failed to fetch dashboard stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployeeDashboard = async () => {
        try {
            setLoading(true);
            const response = await employeesAPI.getDashboard(user.id);
            setEmployeeDashboard(response.data);
        } catch (err) {
            console.error('Failed to fetch employee dashboard:', err);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageSkeleton />;
    }

    // Employee Dashboard View
    if (user.role === 'EMPLOYEE') {
        return (
            <Container maxWidth="lg">
                {/* Welcome Section */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
                        color: 'white',
                    }}
                >
                    <Typography variant="h3" gutterBottom fontWeight="bold">
                        Welcome back, {user.name}! 👋
                    </Typography>

                    {/* Job Title */}
                    {user.jobTitle && (
                        <Typography variant="h5" sx={{ opacity: 0.95, mb: 1, fontWeight: 500 }}>
                            {user.jobTitle}
                        </Typography>
                    )}

                    {/* Role and Department */}
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Work sx={{ fontSize: 20 }} />
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {user.role.replace('_', ' ')}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Business sx={{ fontSize: 20 }} />
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                {user.department || 'N/A'}
                            </Typography>
                        </Box>
                        {employeeDashboard?.managerName && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Person sx={{ fontSize: 20 }} />
                                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                    Reports to: {employeeDashboard.managerName}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                        Track your skills, identify gaps, and discover personalized learning recommendations.
                    </Typography>
                </Paper>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                {/* Quick Overview */}
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                    Quick Overview
                </Typography>

                <Grid container spacing={3} sx={{ mb: 4 }}>
                    {/* Approved Skills Count */}
                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Box sx={{ color: '#2e7d32' }}>
                                        <CheckCircle sx={{ fontSize: 40 }} />
                                    </Box>
                                </Box>
                                <Typography variant="h4" component="div" align="center" fontWeight="bold" color="#2e7d32">
                                    {employeeDashboard?.approvedSkillsCount || 0}
                                </Typography>
                                <Typography variant="h6" component="h2" gutterBottom align="center">
                                    Approved Skills
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Skills in your profile
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Active Projects Count */}
                    <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Box sx={{ color: '#9c27b0' }}>
                                        <Work sx={{ fontSize: 40 }} />
                                    </Box>
                                </Box>
                                <Typography variant="h4" component="div" align="center" fontWeight="bold" color="#9c27b0">
                                    {employeeDashboard?.assignedProjects?.length || 0}
                                </Typography>
                                <Typography variant="h6" component="h2" gutterBottom align="center">
                                    Active Projects
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    Projects you're assigned to
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>


                {/* Project Details */}
                {employeeDashboard?.assignedProjects && employeeDashboard.assignedProjects.length > 0 ? (
                    <>
                        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
                            🚀 My Projects ({employeeDashboard.assignedProjects.length})
                        </Typography>

                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {employeeDashboard.assignedProjects.map((project) => (
                                <Grid key={project.projectId} size={{ xs: 12, md: 6 }}>
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
                                        <CardContent>
                                            {/* Project Header */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                                                    {project.projectName}
                                                </Typography>
                                                <Chip
                                                    label={project.status}
                                                    color={project.status === 'ONGOING' ? 'success' : 'warning'}
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            </Box>

                                            {/* Project Details */}
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                                    {project.description}
                                                </Typography>
                                                {project.startDate && (
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Schedule fontSize="small" color="action" />
                                                        <Typography variant="caption" color="text.secondary">
                                                            Started: {new Date(project.startDate).toLocaleDateString()}
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </Box>

                                            {/* Tech Stack */}
                                            {project.techStack && project.techStack.length > 0 && (
                                                <Box sx={{ mb: 2 }}>
                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                                        <Code fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                        Tech Stack
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                        {project.techStack.map((tech, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                label={tech}
                                                                size="small"
                                                                variant="outlined"
                                                                color="primary"
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Team Members */}
                                            {project.teamMembers && project.teamMembers.length > 0 && (
                                                <Box
                                                    sx={{
                                                        bgcolor: 'action.hover',
                                                        p: 2,
                                                        borderRadius: 1,
                                                        border: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                                        <People fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                        Team Members ({project.teamMembers.length})
                                                    </Typography>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                        {project.teamMembers.slice(0, 5).map((member) => (
                                                            <Chip
                                                                key={member.employeeId}
                                                                avatar={
                                                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                        {member.name.charAt(0)}
                                                                    </Avatar>
                                                                }
                                                                label={member.name}
                                                                size="small"
                                                                variant="outlined"
                                                            />
                                                        ))}
                                                        {project.teamMembers.length > 5 && (
                                                            <Chip
                                                                label={`+${project.teamMembers.length - 5} more`}
                                                                size="small"
                                                                color="primary"
                                                            />
                                                        )}
                                                    </Box>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                ) : (
                    <Paper elevation={2} sx={{ p: 6, textAlign: 'center', mb: 4, bgcolor: 'action.hover' }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No Active Projects
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            You are not currently assigned to any projects.
                        </Typography>
                    </Paper>
                )}


            </Container>
        );
    }

    // HR/Manager Dashboard View
    const quickStats = user.role === 'HR_ADMIN' ? [
        {
            title: 'Skill Catalog',
            value: stats.skillCatalogCount || 0,
            icon: <Category sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            description: 'Total skills in catalog',
        },
        {
            title: 'Learning Resources',
            value: stats.learningResourcesCount || 0,
            icon: <MenuBook sx={{ fontSize: 40 }} />,
            color: '#9c27b0',
            description: 'Available learning materials',
        },
        {
            title: 'Total Employees',
            value: stats.totalEmployeesCount || 0,
            icon: <People sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
            description: 'Employees in organization',
        },
        {
            title: 'Ongoing Projects',
            value: stats.ongoingProjectsCount || 0,
            icon: <Work sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
            description: 'Active projects',
        },
    ] : [
        {
            title: 'Approved Skills',
            value: stats.approvedSkillsCount || 0,
            icon: <CheckCircle sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
            description: 'Skills in your profile',
        },
        {
            title: 'Active Projects',
            value: stats.activeProjectsCount || 0,
            icon: <Work sx={{ fontSize: 40 }} />,
            color: '#9c27b0',
            description: "Projects you're assigned to",
        },
        {
            title: 'Employees Managed',
            value: stats.managedEmployeesCount || 0,
            icon: <People sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
            description: 'Team members reporting to you',
        },
    ];

    return (
        <Container maxWidth="lg">
            {/* Welcome Section */}
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    mb: 4,
                    background: (t) => `linear-gradient(135deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
                    color: 'white',
                }}
            >
                <Typography variant="h3" gutterBottom fontWeight="bold">
                    Welcome back, {user.name}! 👋
                </Typography>

                {/* Job Title */}
                {user.jobTitle && (
                    <Typography variant="h5" sx={{ opacity: 0.95, mb: 1, fontWeight: 500 }}>
                        {user.jobTitle}
                    </Typography>
                )}

                {/* Role and Department */}
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Work sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {user.role.replace('_', ' ')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ fontSize: 20 }} />
                        <Typography variant="body1" sx={{ opacity: 0.9 }}>
                            {user.department || 'N/A'}
                        </Typography>
                    </Box>
                    {user.role === 'MANAGER' && employeeDashboard?.managerName && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 20 }} />
                            <Typography variant="body1" sx={{ opacity: 0.9 }}>
                                Reports to: {employeeDashboard.managerName}
                            </Typography>
                        </Box>
                    )}
                </Box>

                <Typography variant="body1" sx={{ mt: 1, opacity: 0.9 }}>
                    {user.role === 'HR_ADMIN'
                        ? 'Manage employees, skills, and organizational resources.'
                        : 'Track your skills, identify gaps, and discover personalized learning recommendations.'}
                </Typography>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Quick Stats */}
            <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
                Quick Overview
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {quickStats.map((stat, index) => (
                    <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card
                            elevation={2}
                            sx={{
                                height: '100%',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4,
                                },
                            }}
                        >
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Box sx={{ color: stat.color }}>
                                        {stat.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h4" component="div" align="center" fontWeight="bold" color={stat.color}>
                                    {stat.value}
                                </Typography>
                                <Typography variant="h6" component="h2" gutterBottom align="center">
                                    {stat.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {stat.description}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Skill Approval Requests - Only for Manager and HR */}
            {(user.role === 'MANAGER' || user.role === 'HR_ADMIN') && (
                <Box sx={{ mb: 4 }}>
                    <SkillApprovals />
                </Box>
            )}

            {/* My Projects - Only for Manager */}
            {user.role === 'MANAGER' && employeeDashboard?.assignedProjects && employeeDashboard.assignedProjects.length > 0 && (
                <>
                    <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main" sx={{ mb: 3 }}>
                        🚀 My Projects ({employeeDashboard.assignedProjects.length})
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        {employeeDashboard.assignedProjects.map((project) => (
                            <Grid key={project.projectId} size={{ xs: 12, md: 6 }}>
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
                                    <CardContent>
                                        {/* Project Header */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                                                {project.projectName}
                                            </Typography>
                                            <Chip
                                                label={project.status}
                                                color={project.status === 'ONGOING' ? 'success' : 'warning'}
                                                sx={{ fontWeight: 'bold' }}
                                            />
                                        </Box>

                                        {/* Project Details */}
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
                                                {project.description}
                                            </Typography>
                                            {project.startDate && (
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <Schedule fontSize="small" color="action" />
                                                    <Typography variant="caption" color="text.secondary">
                                                        Started: {new Date(project.startDate).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Tech Stack */}
                                        {project.techStack && project.techStack.length > 0 && (
                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                                    <Code fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                    Tech Stack
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {project.techStack.map((tech, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={tech}
                                                            size="small"
                                                            variant="outlined"
                                                            color="primary"
                                                        />
                                                    ))}
                                                </Box>
                                            </Box>
                                        )}

                                        {/* Team Members */}
                                        {project.teamMembers && project.teamMembers.length > 0 && (
                                            <Box
                                                sx={{
                                                    bgcolor: 'action.hover',
                                                    p: 2,
                                                    borderRadius: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                }}
                                            >
                                                <Typography variant="subtitle2" fontWeight="bold" color="primary" gutterBottom>
                                                    <People fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                    Team Members ({project.teamMembers.length})
                                                </Typography>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                                                    {project.teamMembers.slice(0, 5).map((member) => (
                                                        <Chip
                                                            key={member.employeeId}
                                                            avatar={
                                                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                                                    {member.name.charAt(0)}
                                                                </Avatar>
                                                            }
                                                            label={member.name}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                    {project.teamMembers.length > 5 && (
                                                        <Chip
                                                            label={`+${project.teamMembers.length - 5} more`}
                                                            size="small"
                                                            color="primary"
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {/* Employees Managed - Only for Manager */}
            {user.role === 'MANAGER' && (
                <Accordion sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Group color="primary" />
                            <Typography variant="h6" fontWeight="bold">
                                Employees Managed ({managedEmployees.length})
                            </Typography>
                        </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                        {managedEmployees.length === 0 ? (
                            <Typography color="text.secondary">No team members assigned yet.</Typography>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell><strong>Name</strong></TableCell>
                                            <TableCell><strong>Email</strong></TableCell>
                                            <TableCell><strong>Job Title</strong></TableCell>
                                            <TableCell><strong>Department</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {managedEmployees.map((employee) => (
                                            <TableRow key={employee.id}>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                                                            {employee.name.charAt(0)}
                                                        </Avatar>
                                                        {employee.name}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Email fontSize="small" color="action" />
                                                        {employee.email}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>{employee.jobTitle || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Business fontSize="small" color="action" />
                                                        {employee.department || 'N/A'}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </AccordionDetails>
                </Accordion>
            )}

        </Container>
    );
};

export default Dashboard;
