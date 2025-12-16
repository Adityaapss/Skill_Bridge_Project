import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Divider,
    Chip,
} from '@mui/material';
import { School, TrendingUp } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, rolesProjectsAPI } from '../services/api';

const Recommendations = () => {
    const { user } = useAuth();
    const [rolesProjects, setRolesProjects] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchRolesProjects();
    }, []);

    const fetchRolesProjects = async () => {
        try {
            const response = await rolesProjectsAPI.getAll(null, 'ACTIVE');
            setRolesProjects(response.data);
        } catch (err) {
            setError('Failed to load roles and projects');
        }
    };

    const handleGetRecommendations = async () => {
        if (!selectedRole) return;

        setLoading(true);
        setError('');

        try {
            const response = await analyticsAPI.getRecommendations(user.id, selectedRole, 10);
            setRecommendations(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to get recommendations');
        } finally {
            setLoading(false);
        }
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || 'Unknown';
    };

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <School color="primary" />
                    <Typography variant="h5">
                        Learning Recommendations
                    </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Get personalized learning recommendations based on your skill gaps for a target role or project.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
                    <TextField
                        select
                        label="Select Target Role/Project"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        sx={{ minWidth: 300 }}
                    >
                        {rolesProjects.map((rp) => (
                            <MenuItem key={rp.id} value={rp.id}>
                                {rp.name} ({rp.type})
                            </MenuItem>
                        ))}
                    </TextField>
                    <Button
                        variant="contained"
                        onClick={handleGetRecommendations}
                        disabled={!selectedRole || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <TrendingUp />}
                    >
                        Get Recommendations
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {recommendations.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Recommended Learning Path
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Based on your skill gaps, here are personalized learning resources to help you reach your goal.
                    </Typography>

                    {recommendations.map((rec, index) => (
                        <Card key={index} sx={{ mb: 3 }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box>
                                        <Typography variant="h6" gutterBottom>
                                            {rec.skillName}
                                        </Typography>
                                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                            <Chip label={rec.skillCategory} size="small" />
                                            <Chip
                                                label={`Gap: ${rec.gap} level${rec.gap > 1 ? 's' : ''}`}
                                                color="warning"
                                                size="small"
                                            />
                                        </Box>
                                    </Box>
                                    <Box sx={{ textAlign: 'right' }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            Current Level
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            {getProficiencyLabel(rec.currentLevel)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                            Target Level
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold" color="primary">
                                            {getProficiencyLabel(rec.targetLevel)}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                {rec.resources.length > 0 ? (
                                    <>
                                        <Typography variant="subtitle2" gutterBottom>
                                            Recommended Resources:
                                        </Typography>
                                        <List dense>
                                            {rec.resources.map((resource, rIndex) => (
                                                <ListItem
                                                    key={rIndex}
                                                    sx={{
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        borderRadius: 1,
                                                        mb: 1,
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <Typography variant="body1">{resource.title}</Typography>
                                                                {resource.isFree && (
                                                                    <Chip label="Free" color="success" size="small" />
                                                                )}
                                                            </Box>
                                                        }
                                                        secondary={
                                                            <>
                                                                <Typography variant="body2" component="span">
                                                                    {resource.type} • {resource.level}
                                                                    {resource.estimatedDuration && ` • ${resource.estimatedDuration} hours`}
                                                                </Typography>
                                                                <br />
                                                                <Button
                                                                    size="small"
                                                                    variant="text"
                                                                    href={resource.url}
                                                                    target="_blank"
                                                                    sx={{ mt: 0.5 }}
                                                                >
                                                                    View Resource →
                                                                </Button>
                                                            </>
                                                        }
                                                    />
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                ) : (
                                    <Alert severity="info">
                                        No specific resources available yet for this skill. Check back later or search online for "{rec.skillName}" tutorials.
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {!loading && recommendations.length === 0 && selectedRole && (
                <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        Select a role/project and click "Get Recommendations" to see personalized learning suggestions.
                    </Typography>
                </Paper>
            )}
        </Container>
    );
};

export default Recommendations;
