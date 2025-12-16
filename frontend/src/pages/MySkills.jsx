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
                await employeeSkillsAPI.add(user.id, formData);
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

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">My Skills</Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                    >
                        Add Skill
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Skill</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Proficiency</TableCell>
                                <TableCell>Interest</TableCell>
                                <TableCell>Experience (Years)</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No skills added yet. Click "Add Skill" to get started!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                skills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell>{skill.skillName}</TableCell>
                                        <TableCell>{skill.skillCategory}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getProficiencyLabel(skill.proficiencyLevel)}
                                                color={getProficiencyColor(skill.proficiencyLevel)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Rating value={skill.interestLevel} max={3} readOnly size="small" />
                                        </TableCell>
                                        <TableCell>{skill.yearsExperience || 0}</TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => handleOpenDialog(skill)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(skill.skillId)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

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
                            required
                        >
                            <MenuItem value={0}>None</MenuItem>
                            <MenuItem value={1}>Beginner</MenuItem>
                            <MenuItem value={2}>Intermediate</MenuItem>
                            <MenuItem value={3}>Advanced</MenuItem>
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Interest Level"
                            value={formData.interestLevel}
                            onChange={(e) => setFormData({ ...formData, interestLevel: parseInt(e.target.value) })}
                            margin="normal"
                            required
                        >
                            <MenuItem value={0}>None</MenuItem>
                            <MenuItem value={1}>Low</MenuItem>
                            <MenuItem value={2}>Medium</MenuItem>
                            <MenuItem value={3}>High</MenuItem>
                        </TextField>
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
                    <Button onClick={handleSubmit} variant="contained">
                        {editingSkill ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MySkills;
