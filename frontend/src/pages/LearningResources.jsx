import { useUi } from '../context/UiContext';
import { errorMessage } from '../utils/errors';
import PageSkeleton from '../components/PageSkeleton';
import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import useTablePagination from '../hooks/useTablePagination';
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
    Alert,
    Link,
    FormControlLabel,
    Checkbox,
    TablePagination,
} from '@mui/material';
import { Add, Edit, Delete, OpenInNew } from '@mui/icons-material';
import { learningResourcesAPI, skillsAPI } from '../services/api';

const LearningResources = () => {
    const { toast, confirm } = useUi();
    const [resources, setResources] = useState([]);
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        url: '',
        type: 'COURSE',
        skillId: '',
        level: 'BEGINNER',
        description: '',
        estimatedDuration: 0,
        isFree: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [resourcesResponse, skillsResponse] = await Promise.all([
                learningResourcesAPI.getAll(),
                skillsAPI.getAll(true),
            ]);
            setResources(resourcesResponse.data);
            setSkills(skillsResponse.data);
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (resource = null) => {
        if (resource) {
            setEditingResource(resource);
            setFormData({
                title: resource.title,
                url: resource.url,
                type: resource.type,
                skillId: resource.skillId,
                level: resource.level,
                description: resource.description || '',
                estimatedDuration: resource.estimatedDuration || 0,
                isFree: resource.isFree,
            });
        } else {
            setEditingResource(null);
            setFormData({
                title: '',
                url: '',
                type: 'COURSE',
                skillId: '',
                level: 'BEGINNER',
                description: '',
                estimatedDuration: 0,
                isFree: true,
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingResource(null);
    };

    const handleSubmit = async () => {
        try {
            if (editingResource) {
                await learningResourcesAPI.update(editingResource.id, formData);
            } else {
                await learningResourcesAPI.create(formData);
            }
            fetchData();
            handleCloseDialog();
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to save resource'));
        }
    };

    const handleDelete = async (id) => {
        if (await confirm({ title: 'Please confirm', message: 'Are you sure you want to delete this resource?', confirmText: 'Confirm', destructive: true })) {
            try {
                await learningResourcesAPI.delete(id);
                fetchData();
            } catch {
                toast.error('Failed to delete resource');
            }
        }
    };

    const [query, setQuery] = useState('');
    const [levelFilter, setLevelFilter] = useState('ALL');
    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return resources.filter((r) =>
            (levelFilter === 'ALL' || r.level === levelFilter) &&
            (!q || r.title.toLowerCase().includes(q) || (r.skillName || '').toLowerCase().includes(q)));
    }, [resources, query, levelFilter]);
    const paging = useTablePagination(visible, 10);

    const types = ['COURSE', 'BOOK', 'VIDEO', 'ARTICLE', 'CERTIFICATION', 'WORKSHOP', 'OTHER'];
    const levels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

    if (loading) {
        return (
            <PageSkeleton />
        );
    }

    return (
        <Container maxWidth="xl">
            <PageHeader
                title="Learning resources"
                subtitle="Courses, books and videos recommended to close skill gaps"
                actions={<Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add resource</Button>}
            />
            <Paper>
                <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField size="small" placeholder="Search title or skill" value={query}
                        onChange={(e) => setQuery(e.target.value)} sx={{ minWidth: 260 }} inputProps={{ 'aria-label': 'Search resources' }} />
                    <TextField select size="small" label="Level" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} sx={{ minWidth: 160 }}>
                        <MenuItem value="ALL">All levels</MenuItem>
                        {levels.map((l) => <MenuItem key={l} value={l}>{l.charAt(0) + l.slice(1).toLowerCase()}</MenuItem>)}
                    </TextField>
                </Box>


                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Skill</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Level</TableCell>
                                <TableCell>Duration (hrs)</TableCell>
                                <TableCell>Cost</TableCell>
                                <TableCell>URL</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visible.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        <EmptyState
                                            title={resources.length === 0 ? 'No learning resources yet' : 'No resources match'}
                                            message={resources.length === 0 ? 'Add the first one to start recommending learning.' : 'Try a different search or level.'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paging.pageRows.map((resource) => (
                                    <TableRow key={resource.id}>
                                        <TableCell>{resource.title}</TableCell>
                                        <TableCell>{resource.skillName}</TableCell>
                                        <TableCell>
                                            <Chip label={resource.type} size="small" />
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={resource.level}
                                                size="small"
                                                color={
                                                    resource.level === 'BEGINNER' ? 'success' :
                                                        resource.level === 'INTERMEDIATE' ? 'warning' : 'error'
                                                }
                                            />
                                        </TableCell>
                                        <TableCell>{resource.estimatedDuration || '-'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={resource.isFree ? 'Free' : 'Paid'}
                                                size="small"
                                                color={resource.isFree ? 'success' : 'default'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Link href={resource.url} target="_blank" rel="noopener noreferrer">
                                                <IconButton size="small" aria-label={`Open ${resource.title}`}>
                                                    <OpenInNew fontSize="small" />
                                                </IconButton>
                                            </Link>
                                        </TableCell>
                                        <TableCell>
                                            <IconButton size="small" aria-label={`Edit ${resource.title}`} onClick={() => handleOpenDialog(resource)}>
                                                <Edit />
                                            </IconButton>
                                            <IconButton size="small" color="error" aria-label={`Delete ${resource.title}`} onClick={() => handleDelete(resource.id)}>
                                                <Delete />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination {...paging.props} />
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{editingResource ? 'Edit Resource' : 'Add Learning Resource'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="URL"
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            margin="normal"
                            required
                            placeholder="https://..."
                        />
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                fullWidth
                                label="Skill"
                                value={formData.skillId}
                                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                                margin="normal"
                                required
                            >
                                {skills.map((skill) => (
                                    <MenuItem key={skill.id} value={skill.id}>
                                        {skill.name} ({skill.category})
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                select
                                fullWidth
                                label="Type"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                margin="normal"
                                required
                            >
                                {types.map((type) => (
                                    <MenuItem key={type} value={type}>
                                        {type}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                select
                                fullWidth
                                label="Level"
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                margin="normal"
                                required
                            >
                                {levels.map((level) => (
                                    <MenuItem key={level} value={level}>
                                        {level}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                type="number"
                                label="Estimated Duration (hours)"
                                value={formData.estimatedDuration}
                                onChange={(e) => setFormData({ ...formData, estimatedDuration: parseFloat(e.target.value) })}
                                margin="normal"
                                inputProps={{ min: 0, step: 0.5 }}
                            />
                        </Box>
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={formData.isFree}
                                    onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                                />
                            }
                            label="Free Resource"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {editingResource ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default LearningResources;
