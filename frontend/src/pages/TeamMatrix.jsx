import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
    Autocomplete,
    Avatar,
    Divider,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
} from '@mui/material';
import {
    Person,
    Work,
    LocationOn,
    Business,
    CheckCircle,
    Cancel,
    Search,
    FilterList,
    Close,
    Code,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { employeeSkillsAPI, skillsAPI, employeesAPI, projectsAPI } from '../services/api';

const TeamMatrix = () => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('ALL');
    const [selectedAvailability, setSelectedAvailability] = useState('ALL');
    const [selectedBillable, setSelectedBillable] = useState('ALL');
    const [selectedProject, setSelectedProject] = useState('ALL');

    // Employee detail modal
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openEmployeeDetail, setOpenEmployeeDetail] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [skillsResponse, employeesResponse, ongoingProjectsResponse] = await Promise.all([
                skillsAPI.getAll(true),
                employeesAPI.getAll(),
                projectsAPI.getOngoing(),
            ]);

            setAllSkills(skillsResponse.data);

            // Fetch skills for each employee and enrich with project data
            const employeesWithData = await Promise.all(
                employeesResponse.data.map(async (emp) => {
                    try {
                        const skillsData = await employeeSkillsAPI.getByEmployee(emp.id);

                        // Find projects this employee is assigned to
                        const assignedProjects = ongoingProjectsResponse.data.filter(project =>
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
                            allProjects: assignedProjects, // Store all projects
                        };
                    } catch (err) {
                        return {
                            ...emp,
                            skills: [],
                            availability: 'Available',
                            billableStatus: 'Not Assigned',
                            currentProject: 'Not Assigned',
                            projectCount: 0,
                            allProjects: [],
                        };
                    }
                })
            );

            setEmployees(employeesWithData);
        } catch (err) {
            setError('Failed to load employee data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Get unique values for filters
    const departments = ['ALL', ...new Set(employees.map(e => e.department).filter(Boolean))];
    const projects = ['ALL', 'Not Assigned', ...new Set(employees.map(e => e.currentProject).filter(p => p !== 'Not Assigned'))];
    const availabilityOptions = ['ALL', 'Available', 'Busy'];
    const billableOptions = ['ALL', 'BILLABLE', 'NON_BILLABLE', 'INVESTMENT', 'Not Assigned'];

    // Filter employees based on all criteria
    const filteredEmployees = employees.filter(emp => {
        // Search term filter (name, email)
        const matchesSearch = searchTerm === '' ||
            emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());

        // Skills filter
        const matchesSkills = selectedSkills.length === 0 ||
            selectedSkills.every(selectedSkill =>
                emp.skills.some(empSkill => empSkill.skillId === selectedSkill.id)
            );

        // Department filter
        const matchesDepartment = selectedDepartment === 'ALL' || emp.department === selectedDepartment;

        // Availability filter
        const matchesAvailability = selectedAvailability === 'ALL' || emp.availability === selectedAvailability;

        // Billable status filter
        const matchesBillable = selectedBillable === 'ALL' || emp.billableStatus === selectedBillable;

        // Project filter
        const matchesProject = selectedProject === 'ALL' || emp.currentProject === selectedProject;

        return matchesSearch && matchesSkills && matchesDepartment &&
            matchesAvailability && matchesBillable && matchesProject;
    });

    const getAvailabilityColor = (availability) => {
        return availability === 'Available' ? 'success' : 'error';
    };

    const getBillableColor = (status) => {
        const colors = {
            'BILLABLE': 'success',
            'NON_BILLABLE': 'warning',
            'INVESTMENT': 'info',
            'Not Assigned': 'default'
        };
        return colors[status] || 'default';
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

    const getSkillName = (skillId) => {
        const skill = allSkills.find(s => s.id === skillId);
        return skill ? skill.name : 'Unknown';
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || '-';
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedSkills([]);
        setSelectedDepartment('ALL');
        setSelectedAvailability('ALL');
        setSelectedBillable('ALL');
        setSelectedProject('ALL');
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
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                        🔍 Exploring the Resources
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Search and filter employees based on skills, availability, projects, and more
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {/* Filter Section */}
                <Paper
                    elevation={3}
                    sx={{
                        p: 4,
                        mb: 4,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <FilterList sx={{ mr: 1.5, color: 'primary.main', fontSize: 28 }} />
                        <Typography variant="h5" fontWeight="bold" color="primary.dark">
                            Filter Resources
                        </Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Search Bar */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Search by Name or Email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="e.g., John Doe, john@example.com"
                                variant="outlined"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    '& .MuiOutlinedInput-root': {
                                        '&:hover fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                    },
                                }}
                                InputProps={{
                                    startAdornment: <Search sx={{ mr: 1, color: 'primary.main' }} />
                                }}
                            />
                        </Grid>

                        {/* Skills Filter */}
                        <Grid item xs={12} md={6}>
                            <Autocomplete
                                multiple
                                options={allSkills}
                                getOptionLabel={(option) => option.name}
                                value={selectedSkills}
                                onChange={(event, newValue) => setSelectedSkills(newValue)}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Filter by Skills"
                                        placeholder="Select skills..."
                                        variant="outlined"
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            label={option.name}
                                            {...getTagProps({ index })}
                                            size="small"
                                            color="primary"
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                    ))
                                }
                            />
                        </Grid>

                        {/* Department Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Department"
                                value={selectedDepartment}
                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                }}
                            >
                                {departments.map((dept) => (
                                    <MenuItem key={dept} value={dept}>
                                        <Business fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                        {dept}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Availability Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Availability"
                                value={selectedAvailability}
                                onChange={(e) => setSelectedAvailability(e.target.value)}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                }}
                            >
                                {availabilityOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option === 'Available' && <CheckCircle fontSize="small" sx={{ mr: 1, color: 'success.main' }} />}
                                        {option === 'Busy' && <Cancel fontSize="small" sx={{ mr: 1, color: 'error.main' }} />}
                                        {option === 'ALL' && <FilterList fontSize="small" sx={{ mr: 1, color: 'action.active' }} />}
                                        {option}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Billable Status Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Allocation Type"
                                value={selectedBillable}
                                onChange={(e) => setSelectedBillable(e.target.value)}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                }}
                            >
                                {billableOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option === 'ALL' ? 'ALL' : getBillableLabel(option)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {/* Project Filter */}
                        <Grid item xs={12} sm={6} md={3}>
                            <TextField
                                select
                                fullWidth
                                label="Project"
                                value={selectedProject}
                                onChange={(e) => setSelectedProject(e.target.value)}
                                variant="outlined"
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                }}
                            >
                                {projects.map((project) => (
                                    <MenuItem key={project} value={project}>
                                        <Work fontSize="small" sx={{ mr: 1, color: 'action.active' }} />
                                        {project}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{
                            bgcolor: 'white',
                            px: 2,
                            py: 1,
                            borderRadius: 1,
                            boxShadow: 1,
                        }}>
                            <Typography variant="body2" color="text.secondary">
                                Showing <Typography component="span" fontWeight="bold" color="primary.main">{filteredEmployees.length}</Typography> of <Typography component="span" fontWeight="bold">{employees.length}</Typography> resources
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            size="medium"
                            onClick={clearFilters}
                            sx={{
                                fontWeight: 'bold',
                                boxShadow: 2,
                                '&:hover': {
                                    boxShadow: 4,
                                }
                            }}
                        >
                            Clear All Filters
                        </Button>
                    </Box>
                </Paper>

                {/* Employee Table */}
                <Paper elevation={3} sx={{ overflow: 'hidden' }}>
                    {filteredEmployees.length === 0 ? (
                        <Box sx={{ p: 6, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                                No resources found matching your criteria
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Try adjusting your filters
                            </Typography>
                        </Box>
                    ) : (
                        <>
                            <Box sx={{ overflowX: 'auto' }}>
                                <Table sx={{ minWidth: 1000 }}>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'primary.main' }}>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Employee</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Role & Department</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Status</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Current Project</TableCell>
                                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem' }}>Skills</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {filteredEmployees.map((emp, index) => (
                                            <TableRow
                                                key={emp.id}
                                                onClick={() => {
                                                    setSelectedEmployee(emp);
                                                    setOpenEmployeeDetail(true);
                                                }}
                                                sx={{
                                                    '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                                                    '&:hover': { bgcolor: 'action.selected', cursor: 'pointer' },
                                                    transition: 'background-color 0.2s',
                                                }}
                                            >
                                                {/* Employee Info */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                                            {emp.name.split(' ').map(n => n[0]).join('')}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight="bold">
                                                                {emp.name}
                                                            </Typography>
                                                            <Typography variant="caption" color="text.secondary">
                                                                {emp.email}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>

                                                {/* Role & Department */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                        <Work fontSize="small" color="action" />
                                                        <Typography variant="body2">{emp.role}</Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <Business fontSize="small" color="action" />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {emp.department || 'Not Set'}
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        <Chip
                                                            icon={emp.availability === 'Available' ? <CheckCircle /> : <Cancel />}
                                                            label={emp.availability}
                                                            color={getAvailabilityColor(emp.availability)}
                                                            size="small"
                                                            sx={{ width: 'fit-content' }}
                                                        />
                                                        <Chip
                                                            label={getBillableLabel(emp.billableStatus)}
                                                            color={getBillableColor(emp.billableStatus)}
                                                            size="small"
                                                            sx={{ width: 'fit-content', fontSize: '0.7rem' }}
                                                        />
                                                    </Box>
                                                </TableCell>

                                                {/* Current Project */}
                                                <TableCell>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {emp.currentProject}
                                                    </Typography>
                                                    {emp.projectCount > 1 && (
                                                        <Typography variant="caption" color="primary">
                                                            +{emp.projectCount - 1} more project{emp.projectCount - 1 > 1 ? 's' : ''}
                                                        </Typography>
                                                    )}
                                                </TableCell>

                                                {/* Skills */}
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: 300 }}>
                                                        {emp.skills.length === 0 ? (
                                                            <Typography variant="caption" color="text.secondary">
                                                                No skills
                                                            </Typography>
                                                        ) : (
                                                            <>
                                                                {emp.skills.slice(0, 3).map((skill) => (
                                                                    <Chip
                                                                        key={skill.id}
                                                                        label={getSkillName(skill.skillId)}
                                                                        size="small"
                                                                        variant="outlined"
                                                                        color="primary"
                                                                    />
                                                                ))}
                                                                {emp.skills.length > 3 && (
                                                                    <Chip
                                                                        label={`+${emp.skills.length - 3}`}
                                                                        size="small"
                                                                        color="primary"
                                                                    />
                                                                )}
                                                            </>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </Box>

                            {/* Table Footer with Summary */}
                            <Box sx={{
                                p: 2,
                                bgcolor: 'grey.100',
                                borderTop: '2px solid',
                                borderColor: 'divider',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Typography variant="body2" color="text.secondary">
                                    Displaying <strong>{filteredEmployees.length}</strong> resource{filteredEmployees.length !== 1 ? 's' : ''}
                                </Typography>
                            </Box>
                        </>
                    )}
                </Paper>

                {/* Employee Detail Modal */}
                <Dialog
                    open={openEmployeeDetail}
                    onClose={() => setOpenEmployeeDetail(false)}
                    maxWidth="md"
                    fullWidth
                >
                    {selectedEmployee && (
                        <>
                            <DialogTitle>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                                            {selectedEmployee.name.split(' ').map(n => n[0]).join('')}
                                        </Avatar>
                                        <Box>
                                            <Typography variant="h5" fontWeight="bold">
                                                {selectedEmployee.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {selectedEmployee.email}
                                            </Typography>
                                        </Box>
                                    </Box>
                                    <IconButton onClick={() => setOpenEmployeeDetail(false)}>
                                        <Close />
                                    </IconButton>
                                </Box>
                            </DialogTitle>

                            <DialogContent dividers>
                                <Grid container spacing={3}>
                                    {/* Personal Information */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                            <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Personal Information
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Job Title</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {selectedEmployee.role || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Department</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {selectedEmployee.department || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Location</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    <LocationOn fontSize="small" sx={{ mr: 0.5, verticalAlign: 'middle' }} />
                                                    {selectedEmployee.location || 'Not specified'}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Typography variant="caption" color="text.secondary">Manager</Typography>
                                                <Typography variant="body1" fontWeight="medium">
                                                    {employees.find(e => e.id === selectedEmployee.managerId)?.name || 'Not assigned'}
                                                </Typography>
                                            </Grid>
                                        </Grid>
                                    </Grid>

                                    {/* Status Information */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                            <CheckCircle sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Current Status
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                            <Chip
                                                icon={selectedEmployee.availability === 'Available' ? <CheckCircle /> : <Cancel />}
                                                label={selectedEmployee.availability || 'Available'}
                                                color={getAvailabilityColor(selectedEmployee.availability || 'Available')}
                                            />
                                            <Chip
                                                label={getBillableLabel(selectedEmployee.billableStatus || 'Not Assigned')}
                                                color={getBillableColor(selectedEmployee.billableStatus || 'Not Assigned')}
                                            />
                                        </Box>
                                    </Grid>

                                    {/* Current Projects */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                            <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Current Projects ({selectedEmployee.projectCount || 0})
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        {selectedEmployee.allProjects && selectedEmployee.allProjects.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                {selectedEmployee.allProjects.map((project) => (
                                                    <Paper
                                                        key={project.id}
                                                        elevation={1}
                                                        sx={{
                                                            p: 2,
                                                            bgcolor: 'primary.lighter',
                                                            border: '1px solid',
                                                            borderColor: 'primary.light',
                                                        }}
                                                    >
                                                        <Typography variant="body1" fontWeight="bold" gutterBottom>
                                                            {project.name}
                                                        </Typography>
                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                            {project.description}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                                                            <Chip
                                                                label={project.status}
                                                                color="success"
                                                                size="small"
                                                            />
                                                            {project.assignedEmployees?.find(a => a.employeeId === selectedEmployee.id)?.allocationType && (
                                                                <Chip
                                                                    label={getBillableLabel(
                                                                        project.assignedEmployees.find(a => a.employeeId === selectedEmployee.id).allocationType
                                                                    )}
                                                                    color={getBillableColor(
                                                                        project.assignedEmployees.find(a => a.employeeId === selectedEmployee.id).allocationType
                                                                    )}
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>
                                                    </Paper>
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                Not currently assigned to any projects
                                            </Typography>
                                        )}
                                    </Grid>

                                    {/* Skills */}
                                    <Grid item xs={12}>
                                        <Typography variant="h6" gutterBottom fontWeight="bold" color="primary">
                                            <Code sx={{ mr: 1, verticalAlign: 'middle' }} />
                                            Skills ({selectedEmployee.skills?.length || 0})
                                        </Typography>
                                        <Divider sx={{ mb: 2 }} />
                                        {selectedEmployee.skills && selectedEmployee.skills.length > 0 ? (
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                                {selectedEmployee.skills.map((skill) => (
                                                    <Chip
                                                        key={skill.id}
                                                        label={`${getSkillName(skill.skillId)} - ${getProficiencyLabel(skill.proficiencyLevel)}`}
                                                        variant="outlined"
                                                        color="primary"
                                                    />
                                                ))}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No skills added yet
                                            </Typography>
                                        )}
                                    </Grid>
                                </Grid>
                            </DialogContent>

                            <DialogActions sx={{ p: 2 }}>
                                <Button onClick={() => setOpenEmployeeDetail(false)} variant="contained">
                                    Close
                                </Button>
                            </DialogActions>
                        </>
                    )}
                </Dialog>
            </Paper>
        </Container>
    );
};

export default TeamMatrix;
