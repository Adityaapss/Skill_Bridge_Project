import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    TextField,
    MenuItem,
    Button,
    Grid,
    Card,
    CardContent,
    Chip,
    LinearProgress,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Divider,
} from '@mui/material';
import { Assessment, TrendingUp, TrendingDown, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, rolesProjectsAPI } from '../services/api';

const MyGaps = () => {
    const { user } = useAuth();
    const [rolesProjects, setRolesProjects] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [gapAnalysis, setGapAnalysis] = useState(null);
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

    const handleAnalyze = async () => {
        if (!selectedRole) return;

        setLoading(true);
        setError('');

        try {
            const [gapResponse, recResponse] = await Promise.all([
                analyticsAPI.getGapAnalysis(user.id, selectedRole),
                analyticsAPI.getRecommendations(user.id, selectedRole, 5),
            ]);

            setGapAnalysis(gapResponse.data);
            setRecommendations(recResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to analyze gaps');
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
                <Typography variant="h5" gutterBottom>
                    Skill Gap Analysis
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                    Compare your skills against a target role or project to identify gaps and get learning recommendations.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
                    <TextField
                        select
                        label="Select Role/Project"
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
                        onClick={handleAnalyze}
                        disabled={!selectedRole || loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <Assessment />}
                    >
                        Analyze
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            </Paper>

            {gapAnalysis && (
                <>
                    {/* Match Score */}
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Overall Match Score
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ flexGrow: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={gapAnalysis.matchScore}
                                    sx={{ height: 10, borderRadius: 5 }}
                                />
                            </Box>
                            <Typography variant="h5" color="primary">
                                {gapAnalysis.matchScore.toFixed(0)}%
                            </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            You meet {gapAnalysis.matches.length} out of{' '}
                            {gapAnalysis.matches.length + gapAnalysis.gaps.length + gapAnalysis.missing.length} required skills
                        </Typography>
                    </Paper>

                    {/* Summary Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <CheckCircle color="success" />
                                        <Typography variant="h6">Matches</Typography>
                                    </Box>
                                    <Typography variant="h4">{gapAnalysis.matches.length}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Skills you meet or exceed
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TrendingDown color="warning" />
                                        <Typography variant="h6">Gaps</Typography>
                                    </Box>
                                    <Typography variant="h4">{gapAnalysis.gaps.length}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Skills below required level
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        <TrendingUp color="error" />
                                        <Typography variant="h6">Missing</Typography>
                                    </Box>
                                    <Typography variant="h4">{gapAnalysis.missing.length}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Skills you don't have
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Detailed Gaps */}
                    {(gapAnalysis.gaps.length > 0 || gapAnalysis.missing.length > 0) && (
                        <Paper sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Skills to Improve
                            </Typography>
                            <List>
                                {[...gapAnalysis.gaps, ...gapAnalysis.missing].map((gap, index) => (
                                    <React.Fragment key={index}>
                                        <ListItem>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography>{gap.skillName}</Typography>
                                                        <Chip
                                                            label={gap.importance}
                                                            color={gap.importance === 'MUST_HAVE' ? 'error' : 'default'}
                                                            size="small"
                                                        />
                                                    </Box>
                                                }
                                                secondary={
                                                    <Box sx={{ mt: 1 }}>
                                                        <Typography variant="body2" color="text.secondary">
                                                            Current: {getProficiencyLabel(gap.currentLevel)} →
                                                            Required: {getProficiencyLabel(gap.requiredLevel)}
                                                            (Gap: {gap.gap} level{gap.gap > 1 ? 's' : ''})
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </ListItem>
                                        {index < gapAnalysis.gaps.length + gapAnalysis.missing.length - 1 && <Divider />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </Paper>
                    )}

                    {/* Learning Recommendations */}
                    {recommendations.length > 0 && (
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Recommended Learning Resources
                            </Typography>
                            {recommendations.map((rec, index) => (
                                <Box key={index} sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {rec.skillName} ({rec.skillCategory})
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" gutterBottom>
                                        Target: {getProficiencyLabel(rec.targetLevel)}
                                    </Typography>
                                    {rec.resources.length > 0 ? (
                                        <List dense>
                                            {rec.resources.map((resource, rIndex) => (
                                                <ListItem key={rIndex}>
                                                    <ListItemText
                                                        primary={resource.title}
                                                        secondary={
                                                            <>
                                                                {resource.type} • {resource.level}
                                                                {resource.estimatedDuration && ` • ${resource.estimatedDuration} hours`}
                                                                {resource.isFree && ' • Free'}
                                                            </>
                                                        }
                                                    />
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        href={resource.url}
                                                        target="_blank"
                                                    >
                                                        View
                                                    </Button>
                                                </ListItem>
                                            ))}
                                        </List>
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No resources available yet
                                        </Typography>
                                    )}
                                    {index < recommendations.length - 1 && <Divider sx={{ my: 2 }} />}
                                </Box>
                            ))}
                        </Paper>
                    )}
                </>
            )}
        </Container>
    );
};

export default MyGaps;
