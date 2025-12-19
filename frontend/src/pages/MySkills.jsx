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
    Rating,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { employeeSkillsAPI, skillsAPI } from '../services/api';

const MySkills = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [formData, setFormData] = useState({
        skillId: '',
        proficiencyLevel: 1,
        interestLevel: 1,
        yearsExperience: 0,
    });

    useEffect(() => {
        fetchSkills();
        fetchAllSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await employeeSkillsAPI.getByEmployee(user.id);
            setSkills(response.data);
        } catch (err) {
            setError('Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllSkills = async () => {
        try {
            const response = await skillsAPI.getAll(true);
            setAllSkills(response.data);
        } catch (err) {
            console.error('Failed to load skill catalog');
        }
    };

    const handleOpenDialog = (skill = null) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                skillId: skill.skillId,
                proficiencyLevel: skill.proficiencyLevel,
                interestLevel: skill.interestLevel,
                yearsExperience: skill.yearsExperience || 0,
            });
        } else {
            setEditingSkill(null);
            setFormData({
                skillId: '',
                proficiencyLevel: 1,
                interestLevel: 1,
                yearsExperience: 0,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingSkill(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingSkill) {
                await employeeSkillsAPI.update(user.id, editingSkill.skillId, formData);
            } else {
                await employeeSkillsAPI.add(user.id, {
                    ...formData,
                    source: 'SELF_REPORTED',
                    lastUsedDate: new Date().toISOString().split('T')[0]
                });
            }
            fetchSkills();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save skill');
        }
    };

    const handleDelete = async (skillId) => {
        if (window.confirm('Are you sure you want to remove this skill?')) {
            try {
                await employeeSkillsAPI.delete(user.id, skillId);
                fetchSkills();
            } catch (err) {
                setError('Failed to delete skill');
            }
        }
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || 'Unknown';
    };

    const getProficiencyColor = (level) => {
        const colors = ['default', 'error', 'warning', 'success'];
        return colors[level] || 'default';
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

    // Group skills by category
    const skillsByCategory = skills.reduce((acc, skill) => {
        const category = skill.skillCategory || 'Other';
        if (!acc[category]) acc[category] = [];
        acc[category].push(skill);
        return acc;
    }, {});

    // Calculate statistics
    const totalSkills = skills.length;
    const approvedSkills = skills.filter(s => s.approvalStatus === 'APPROVED').length;
    const pendingSkills = skills.filter(s => s.approvalStatus === 'PENDING').length;
    const avgExperience = skills.length > 0
        ? (skills.reduce((sum, s) => sum + (s.yearsExperience || 0), 0) / skills.length).toFixed(1)
        : 0;

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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography variant="h3" gutterBottom fontWeight="bold">
                            🎯 My Skills
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Track and showcase your professional expertise
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        sx={{
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontWeight: 'bold',
                            '&:hover': {
                                bgcolor: 'grey.100',
                            },
                        }}
                    >
                        Add Skill
                    </Button>
                </Box>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            {/* Statistics Dashboard */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                <Paper elevation={2} sx={{ flex: 1, minWidth: 200, p: 3, bgcolor: 'primary.main', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{totalSkills}</Typography>
                    <Typography variant="body1">Total Skills</Typography>
                </Paper>
                <Paper elevation={2} sx={{ flex: 1, minWidth: 200, p: 3, bgcolor: 'success.main', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{approvedSkills}</Typography>
                    <Typography variant="body1">Approved</Typography>
                </Paper>
                <Paper elevation={2} sx={{ flex: 1, minWidth: 200, p: 3, bgcolor: 'warning.main', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{pendingSkills}</Typography>
                    <Typography variant="body1">Pending Approval</Typography>
                </Paper>
                <Paper elevation={2} sx={{ flex: 1, minWidth: 200, p: 3, bgcolor: 'info.main', color: 'white' }}>
                    <Typography variant="h3" fontWeight="bold">{avgExperience}</Typography>
                    <Typography variant="body1">Avg. Years Experience</Typography>
                </Paper>
            </Box>

            {/* Skills by Category */}
            {skills.length === 0 ? (
                <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h5" color="text.secondary" gutterBottom>
                        No skills added yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                        Start building your skill profile by adding your first skill!
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Your First Skill
                    </Button>
                </Paper>
            ) : (
                Object.entries(skillsByCategory).map(([category, categorySkills]) => (
                    <Box key={category} sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.dark" sx={{ mb: 2 }}>
                            {category} ({categorySkills.length})
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
                            {categorySkills.map((skill) => (
                                <Paper
                                    key={skill.id}
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6,
                                        },
                                    }}
                                >
                                    {/* Skill Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                                {skill.skillName}
                                            </Typography>
                                            {/* Approval Status */}
                                            {skill.approvalStatus === 'APPROVED' && (
                                                <Chip
                                                    label="✓ Approved"
                                                    color="success"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            )}
                                            {skill.approvalStatus === 'PENDING' && (
                                                <Chip
                                                    label="⏳ Pending"
                                                    color="warning"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            )}
                                            {skill.approvalStatus === 'REJECTED' && (
                                                <Chip
                                                    label="✗ Rejected"
                                                    color="error"
                                                    size="small"
                                                    sx={{ fontWeight: 'bold' }}
                                                />
                                            )}
                                        </Box>
                                        <Box>
                                            <IconButton size="small" onClick={() => handleOpenDialog(skill)} color="primary">
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(skill.skillId)} color="error">
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    </Box>

                                    {/* Rejection Reason */}
                                    {skill.approvalStatus === 'REJECTED' && skill.rejectionReason && (
                                        <Alert severity="error" sx={{ mb: 2, py: 0.5 }}>
                                            <Typography variant="caption">
                                                <strong>Reason:</strong> {skill.rejectionReason}
                                            </Typography>
                                        </Alert>
                                    )}

                                    {/* Proficiency Level with Progress Bar */}
                                    <Box sx={{ mb: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                            <Typography variant="body2" fontWeight="medium">
                                                Proficiency
                                            </Typography>
                                            <Chip
                                                label={getProficiencyLabel(skill.proficiencyLevel)}
                                                color={getProficiencyColor(skill.proficiencyLevel)}
                                                size="small"
                                            />
                                        </Box>
                                        <Box
                                            sx={{
                                                width: '100%',
                                                height: 8,
                                                bgcolor: 'grey.200',
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: `${(skill.proficiencyLevel / 3) * 100}%`,
                                                    height: '100%',
                                                    bgcolor: skill.proficiencyLevel === 3 ? 'success.main' :
                                                        skill.proficiencyLevel === 2 ? 'warning.main' : 'error.main',
                                                    transition: 'width 0.3s',
                                                }}
                                            />
                                        </Box>
                                    </Box>

                                    {/* Interest Level */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                                            Interest Level
                                        </Typography>
                                        <Rating value={skill.interestLevel} max={3} readOnly size="medium" />
                                    </Box>

                                    {/* Years of Experience */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Experience:
                                        </Typography>
                                        <Chip
                                            label={`${skill.yearsExperience || 0} years`}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Box>
                ))
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add Skill'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        {!editingSkill && (
                            <TextField
                                select
                                fullWidth
                                label="Skill"
                                value={formData.skillId}
                                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                                margin="normal"
                                required
                            >
                                {allSkills.map((skill) => (
                                    <MenuItem key={skill.id} value={skill.id}>
                                        {skill.name} ({skill.category})
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}

                        <TextField
                            select
                            fullWidth
                            label="Proficiency Level"
                            value={formData.proficiencyLevel}
                            onChange={(e) => setFormData({ ...formData, proficiencyLevel: parseInt(e.target.value) })}
                            margin="normal"
                        >
                            <MenuItem value={0}>None</MenuItem>
                            <MenuItem value={1}>Beginner</MenuItem>
                            <MenuItem value={2}>Intermediate</MenuItem>
                            <MenuItem value={3}>Advanced</MenuItem>
                        </TextField>

                        <Box sx={{ mt: 2 }}>
                            <Typography gutterBottom>Interest Level</Typography>
                            <Rating
                                value={formData.interestLevel}
                                max={3}
                                onChange={(e, newValue) => setFormData({ ...formData, interestLevel: newValue || 1 })}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            type="number"
                            label="Years of Experience"
                            value={formData.yearsExperience}
                            onChange={(e) => setFormData({ ...formData, yearsExperience: parseFloat(e.target.value) })}
                            margin="normal"
                            inputProps={{ min: 0, step: 0.5 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!editingSkill && !formData.skillId}>
                        {editingSkill ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MySkills;
