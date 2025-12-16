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
    Switch,
    FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete, Archive } from '@mui/icons-material';
import { skillsAPI } from '../services/api';

const SkillCatalog = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [showInactive, setShowInactive] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'LANGUAGE',
        description: '',
    });

    useEffect(() => {
        fetchSkills();
    }, [showInactive]);

    const fetchSkills = async () => {
        try {
            const response = await skillsAPI.getAll(!showInactive);
            setSkills(response.data);
        } catch (err) {
            setError('Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (skill = null) => {
        if (skill) {
            setEditingSkill(skill);
            setFormData({
                name: skill.name,
                category: skill.category,
                description: skill.description || '',
            });
        } else {
            setEditingSkill(null);
            setFormData({
                name: '',
                category: 'LANGUAGE',
                description: '',
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
                await skillsAPI.update(editingSkill.id, formData);
            } else {
                await skillsAPI.create(formData);
            }
            fetchSkills();
            handleCloseDialog();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save skill');
        }
    };

    const handleToggleActive = async (skill) => {
        try {
            if (skill.active) {
                await skillsAPI.deactivate(skill.id);
            } else {
                // Reactivate by updating
                await skillsAPI.update(skill.id, { ...skill, active: true });
            }
            fetchSkills();
        } catch (err) {
            setError('Failed to update skill status');
        }
    };

    const categories = [
        'LANGUAGE',
        'FRAMEWORK',
        'DATABASE',
        'CLOUD',
        'TOOL',
        'SOFT_SKILL',
        'OTHER'
    ];

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
                    <Typography variant="h5">Skill Catalog</Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showInactive}
                                    onChange={(e) => setShowInactive(e.target.checked)}
                                />
                            }
                            label="Show Inactive"
                        />
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenDialog()}
                        >
                            Add Skill
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {skills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        No skills found. Click "Add Skill" to create one!
                                    </TableCell>
                                </TableRow>
                            ) : (
                                skills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>
                                            <Chip label={skill.category} size="small" />
                                        </TableCell>
                                        <TableCell>{skill.description || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={skill.active ? 'Active' : 'Inactive'}
                                                color={skill.active ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" onClick={() => handleOpenDialog(skill)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleToggleActive(skill)}
                                                color={skill.active ? 'warning' : 'success'}
                                            >
                                                <Archive />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                        <strong>Note:</strong> Deactivating a skill will hide it from employees when adding new skills,
                        but existing employee skills will remain intact.
                    </Typography>
                </Box>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? 'Edit Skill' : 'Add New Skill'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Skill Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            select
                            fullWidth
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            margin="normal"
                            required
                        >
                            {categories.map((cat) => (
                                <MenuItem key={cat} value={cat}>
                                    {cat}
                                </MenuItem>
                            ))}
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

export default SkillCatalog;
