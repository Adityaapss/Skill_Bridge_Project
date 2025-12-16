import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
} from '@mui/material';
import { Add, Edit, Delete, Assignment } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { rolesProjectsAPI, skillsAPI } from '../services/api';

const RolesProjects = () => {
    const { user } = useAuth();
    const [rolesProjects, setRolesProjects] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [selectedRP, setSelectedRP] = useState(null);
    const [requirements, setRequirements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [openReqDialog, setOpenReqDialog] = useState(false);
    const [tabValue, setTabValue] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        type: 'ROLE',
        description: '',
        status: 'ACTIVE',
    });
    const [reqFormData, setReqFormData] = useState({
        skillId: '',
        requiredLevel: 2,
        importance: 'MUST_HAVE',
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rpResponse, skillsResponse] = await Promise.all([
                rolesProjectsAPI.getAll(),
                skillsAPI.getAll(true),
            ]);
            setRolesProjects(rpResponse.data);
            setAllSkills(skillsResponse.data);
        } catch (err) {
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (rp = null) => {
        if (rp) {
            setFormData({
                name: rp.name,
                type: rp.type,
                description: rp.description || '',
                status: rp.status,
            });
            setSelectedRP(rp);
        } else {
            setFormData({
                name: '',
                type: 'ROLE',
                description: '',
                status: 'ACTIVE',
            });
            setSelectedRP(null);
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedRP(null);
    };

    const handleSubmit = async () => {
        try {
            if (selectedRP) {
                await rolesProjectsAPI.update(selectedRP.id, formData);
            } else {
                await rolesProjectsAPI.create(formData);
            }
            fetchData();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this?')) {
            try {
                await rolesProjectsAPI.delete(id);
                fetchData();
            } catch (err) {
                setError('Failed to delete');
            }
        }
    };

    const handleViewRequirements = async (rp) => {
        try {
            const response = await rolesProjectsAPI.getRequirements(rp.id);
            setRequirements(response.data);
            setSelectedRP(rp);
            setTabValue(1);
        } catch (err) {
            setError('Failed to load requirements');
        }
    };

    const handleAddRequirement = () => {
        setReqFormData({
            skillId: '',
            requiredLevel: 2,
            importance: 'MUST_HAVE',
        });
        setOpenReqDialog(true);
    };

    const handleSubmitRequirement = async () => {
        try {
            await rolesProjectsAPI.addRequirement(selectedRP.id, reqFormData);
            const response = await rolesProjectsAPI.getRequirements(selectedRP.id);
            setRequirements(response.data);
            setOpenReqDialog(false);
        } catch (err) {
            setError('Failed to add requirement');
        }
    };

    const handleDeleteRequirement = async (skillId) => {
        if (window.confirm('Remove this skill requirement?')) {
            try {
                await rolesProjectsAPI.deleteRequirement(selectedRP.id, skillId);
                const response = await rolesProjectsAPI.getRequirements(selectedRP.id);
                setRequirements(response.data);
            } catch (err) {
                setError('Failed to delete requirement');
            }
        }
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || 'Unknown';
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
        <Container maxWidth="lg">
            <Paper sx={{ p: 3 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="Roles & Projects" />
                        <Tab label="Requirements" disabled={!selectedRP} />
                    </Tabs>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {tabValue === 0 && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">Manage Roles & Projects</Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                            >
                                Create New
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Name</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Description</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rolesProjects.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No roles or projects yet. Click "Create New" to add one!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        rolesProjects.map((rp) => (
                                            <TableRow key={rp.id}>
                                                <TableCell>{rp.name}</TableCell>
                                                <TableCell>
                                                    <Chip label={rp.type} size="small" color={rp.type === 'ROLE' ? 'primary' : 'secondary'} />
                                                </TableCell>
                                                <TableCell>{rp.description || '-'}</TableCell>
                                                <TableCell>
                                                    <Chip label={rp.status} size="small" color={rp.status === 'ACTIVE' ? 'success' : 'default'} />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleViewRequirements(rp)}>
                                                        <Assignment />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleOpenDialog(rp)}>
                                                        <Edit />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={() => handleDelete(rp.id)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}

                {tabValue === 1 && selectedRP && (
                    <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h6">
                                Requirements for: {selectedRP.name}
                            </Typography>
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={handleAddRequirement}
                            >
                                Add Requirement
                            </Button>
                        </Box>

                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Skill</TableCell>
                                        <TableCell>Category</TableCell>
                                        <TableCell>Required Level</TableCell>
                                        <TableCell>Importance</TableCell>
                                        <TableCell>Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {requirements.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                No requirements defined. Click "Add Requirement" to add skills!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        requirements.map((req) => (
                                            <TableRow key={req.id}>
                                                <TableCell>{req.skillName}</TableCell>
                                                <TableCell>{req.skillCategory}</TableCell>
                                                <TableCell>
                                                    <Chip label={getProficiencyLabel(req.requiredLevel)} size="small" />
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={req.importance}
                                                        size="small"
                                                        color={req.importance === 'MUST_HAVE' ? 'error' : 'default'}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton size="small" onClick={() => handleDeleteRequirement(req.skillId)}>
                                                        <Delete />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </>
                )}
            </Paper>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedRP ? 'Edit' : 'Create'} Role/Project</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            margin="normal"
                            required
                        >
                            <MenuItem value="ROLE">Role</MenuItem>
                            <MenuItem value="PROJECT">Project</MenuItem>
                        </TextField>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <TextField
                            select
                            fullWidth
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            margin="normal"
                            required
                        >
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="ARCHIVED">Archived</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedRP ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add Requirement Dialog */}
            <Dialog open={openReqDialog} onClose={() => setOpenReqDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add Skill Requirement</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            select
                            fullWidth
                            label="Skill"
                            value={reqFormData.skillId}
                            onChange={(e) => setReqFormData({ ...reqFormData, skillId: e.target.value })}
                            margin="normal"
                            required
                        >
                            {allSkills.map((skill) => (
                                <MenuItem key={skill.id} value={skill.id}>
                                    {skill.name} ({skill.category})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Required Level"
                            value={reqFormData.requiredLevel}
                            onChange={(e) => setReqFormData({ ...reqFormData, requiredLevel: parseInt(e.target.value) })}
                            margin="normal"
                            required
                        >
                            <MenuItem value={1}>Beginner</MenuItem>
                            <MenuItem value={2}>Intermediate</MenuItem>
                            <MenuItem value={3}>Advanced</MenuItem>
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Importance"
                            value={reqFormData.importance}
                            onChange={(e) => setReqFormData({ ...reqFormData, importance: e.target.value })}
                            margin="normal"
                            required
                        >
                            <MenuItem value="MUST_HAVE">Must Have</MenuItem>
                            <MenuItem value="NICE_TO_HAVE">Nice to Have</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReqDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmitRequirement} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default RolesProjects;
