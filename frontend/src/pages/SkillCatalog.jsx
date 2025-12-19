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
import { Add, Edit, Delete, Category as CategoryIcon } from '@mui/icons-material';
import { skillsAPI } from '../services/api';

const SkillCatalog = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openSkillDialog, setOpenSkillDialog] = useState(false);
    const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [selectedTab, setSelectedTab] = useState(0);
    const [categories, setCategories] = useState([
        'LANGUAGE',
        'FRAMEWORK',
        'DATABASE',
        'CLOUD',
        'TOOL',
        'OTHER'
    ]);
    const [newCategory, setNewCategory] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        category: 'LANGUAGE',
        description: '',
    });

    // Technical skill categories (excluding soft skills)
    const technicalCategories = ['LANGUAGE', 'FRAMEWORK', 'DATABASE', 'CLOUD', 'TOOL', 'OTHER'];

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await skillsAPI.getAll(true);
            // Filter to show only technical skills (exclude SOFT_SKILL category)
            const technicalSkills = response.data.filter(skill =>
                technicalCategories.includes(skill.category)
            );
            setSkills(technicalSkills);
        } catch (err) {
            setError('Failed to load skills');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenSkillDialog = (skill = null) => {
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
                category: categories[0],
                description: '',
            });
        }
        setOpenSkillDialog(true);
    };

    const handleCloseSkillDialog = () => {
        setOpenSkillDialog(false);
        setEditingSkill(null);
        setError('');
    };

    const handleSubmitSkill = async () => {
        try {
            if (!formData.name.trim()) {
                setError('Skill name is required');
                return;
            }

            if (editingSkill) {
                await skillsAPI.update(editingSkill.id, formData);
                setSuccess('Skill updated successfully!');
            } else {
                await skillsAPI.create(formData);
                setSuccess('Skill added successfully!');
            }
            fetchSkills();
            handleCloseSkillDialog();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save skill');
        }
    };

    const handleDeleteSkill = async (skillId, skillName) => {
        if (window.confirm(`Are you sure you want to delete "${skillName}"? This action cannot be undone.`)) {
            try {
                await skillsAPI.delete(skillId);
                setSuccess('Skill deleted successfully!');
                fetchSkills();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError('Failed to delete skill. It may be in use by employees.');
            }
        }
    };

    const handleAddCategory = () => {
        if (newCategory.trim() && !categories.includes(newCategory.toUpperCase())) {
            const formattedCategory = newCategory.toUpperCase().replace(/\s+/g, '_');
            setCategories([...categories, formattedCategory]);
            setNewCategory('');
            setSuccess('Category added successfully!');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const handleDeleteCategory = (category) => {
        // Check if any skills use this category
        const skillsInCategory = skills.filter(skill => skill.category === category);
        if (skillsInCategory.length > 0) {
            setError(`Cannot delete category "${category}". It has ${skillsInCategory.length} skill(s).`);
            return;
        }

        if (window.confirm(`Are you sure you want to delete the category "${category}"?`)) {
            setCategories(categories.filter(cat => cat !== category));
            setSuccess('Category deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        }
    };

    const getSkillsByCategory = (category) => {
        return skills.filter(skill => skill.category === category);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'LANGUAGE': '#1976d2',
            'FRAMEWORK': '#2e7d32',
            'DATABASE': '#ed6c02',
            'CLOUD': '#9c27b0',
            'TOOL': '#0288d1',
            'OTHER': '#757575',
        };
        return colors[category] || '#757575';
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

    const currentCategory = categories[selectedTab];
    const categorySkills = getSkillsByCategory(currentCategory);

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h5" fontWeight="bold">Technical Skill Catalog</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage programming and technical skills only
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="outlined"
                            startIcon={<CategoryIcon />}
                            onClick={() => setOpenCategoryDialog(true)}
                        >
                            Manage Categories
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<Add />}
                            onClick={() => handleOpenSkillDialog()}
                        >
                            Add Skill
                        </Button>
                    </Box>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

                {/* Category Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs
                        value={selectedTab}
                        onChange={(e, newValue) => setSelectedTab(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                    >
                        {categories.map((category, index) => (
                            <Tab
                                key={category}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {category}
                                        <Chip
                                            label={getSkillsByCategory(category).length}
                                            size="small"
                                            sx={{
                                                bgcolor: getCategoryColor(category),
                                                color: 'white',
                                                height: 20,
                                                minWidth: 30,
                                            }}
                                        />
                                    </Box>
                                }
                            />
                        ))}
                    </Tabs>
                </Box>

                {/* Skills Table */}
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Skill Name</strong></TableCell>
                                <TableCell><strong>Category</strong></TableCell>
                                <TableCell><strong>Description</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {categorySkills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <Typography color="text.secondary">
                                            No skills in this category. Click "Add Skill" to create one!
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                categorySkills.map((skill) => (
                                    <TableRow key={skill.id} hover>
                                        <TableCell>
                                            <Typography fontWeight="medium">{skill.name}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={skill.category}
                                                size="small"
                                                sx={{
                                                    bgcolor: getCategoryColor(skill.category),
                                                    color: 'white',
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {skill.description || '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenSkillDialog(skill)}
                                                color="primary"
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={() => handleDeleteSkill(skill.id, skill.name)}
                                                color="error"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
                    <Typography variant="body2">
                        <strong>💡 Tip:</strong> Only technical and programming-related skills are shown here.
                        Soft skills like leadership are excluded from this catalog.
                    </Typography>
                </Box>
            </Paper>

            {/* Add/Edit Skill Dialog */}
            <Dialog open={openSkillDialog} onClose={handleCloseSkillDialog} maxWidth="sm" fullWidth>
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
                            placeholder="e.g., Python, React, PostgreSQL"
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
                            placeholder="Brief description of the skill..."
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSkillDialog}>Cancel</Button>
                    <Button onClick={handleSubmitSkill} variant="contained">
                        {editingSkill ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Manage Categories Dialog */}
            <Dialog open={openCategoryDialog} onClose={() => setOpenCategoryDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Manage Categories</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Add new categories or remove existing ones. Categories with skills cannot be deleted.
                        </Typography>

                        {/* Add New Category */}
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <TextField
                                fullWidth
                                label="New Category Name"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="e.g., MOBILE, DEVOPS"
                                size="small"
                            />
                            <Button
                                variant="contained"
                                onClick={handleAddCategory}
                                disabled={!newCategory.trim()}
                            >
                                Add
                            </Button>
                        </Box>

                        {/* Existing Categories */}
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>Existing Categories:</Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {categories.map((category) => {
                                const skillCount = getSkillsByCategory(category).length;
                                return (
                                    <Chip
                                        key={category}
                                        label={`${category} (${skillCount})`}
                                        onDelete={skillCount === 0 ? () => handleDeleteCategory(category) : undefined}
                                        sx={{
                                            bgcolor: getCategoryColor(category),
                                            color: 'white',
                                            '& .MuiChip-deleteIcon': {
                                                color: 'white',
                                            },
                                        }}
                                    />
                                );
                            })}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCategoryDialog(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default SkillCatalog;


