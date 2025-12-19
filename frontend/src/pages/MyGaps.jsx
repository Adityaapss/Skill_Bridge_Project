import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
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
    Tabs,
    Tab,
    Avatar,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import {
    Assessment,
    TrendingUp,
    CheckCircle,
    Warning,
    School,
    ExpandMore,
    Code,
    PlayArrow,
    Schedule,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { employeeSkillsAPI, skillsAPI, learningResourcesAPI, projectsAPI } from '../services/api';

const MyGaps = () => {
    const { user } = useAuth();
    const [tabValue, setTabValue] = useState(0);
    const [mySkills, setMySkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [learningResources, setLearningResources] = useState({});
    const [ongoingProjects, setOngoingProjects] = useState([]);
    const [upcomingProjects, setUpcomingProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [skillsResponse, mySkillsResponse, ongoingResponse, upcomingResponse] = await Promise.all([
                skillsAPI.getAll(true),
                employeeSkillsAPI.getByEmployee(user.id),
                projectsAPI.getOngoing(),
                projectsAPI.getUpcoming(),
            ]);

            setAllSkills(skillsResponse.data);
            // Filter to only APPROVED skills for gap analysis
            const approvedSkills = mySkillsResponse.data.filter(skill => skill.approvalStatus === 'APPROVED');
            setMySkills(approvedSkills);
            setOngoingProjects(ongoingResponse.data);
            setUpcomingProjects(upcomingResponse.data);

            // Fetch learning resources for all skills
            const resourcesMap = {};
            for (const skill of skillsResponse.data) {
                try {
                    const resourcesResponse = await learningResourcesAPI.getAll(skill.id);
                    if (resourcesResponse.data && resourcesResponse.data.length > 0) {
                        resourcesMap[skill.id] = resourcesResponse.data;
                    }
                } catch (err) {
                    // Skip if no resources found for this skill
                    console.log(`No resources found for skill: ${skill.name}`);
                }
            }
            setLearningResources(resourcesMap);
        } catch (err) {
            setError('Failed to load skills data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const analyzeProjectGaps = (project) => {
        const gaps = [];
        const matches = [];
        const missing = [];

        project.techStack.forEach(tech => {
            // Find if this tech is in the skills catalog
            const skill = allSkills.find(s =>
                s.name.toLowerCase() === tech.toLowerCase() ||
                s.name.toLowerCase().includes(tech.toLowerCase()) ||
                tech.toLowerCase().includes(s.name.toLowerCase())
            );

            if (skill) {
                // Check if employee has this skill
                const mySkill = mySkills.find(ms => ms.skillId === skill.id);

                if (mySkill) {
                    // Employee has the skill
                    if (mySkill.proficiencyLevel >= 2) {
                        // Intermediate or above - good match
                        matches.push({
                            tech,
                            skillName: skill.name,
                            skillId: skill.id,
                            currentLevel: mySkill.proficiencyLevel,
                            status: 'match'
                        });
                    } else {
                        // Beginner - needs improvement
                        gaps.push({
                            tech,
                            skillName: skill.name,
                            skillId: skill.id,
                            currentLevel: mySkill.proficiencyLevel,
                            recommendedLevel: 2,
                            gap: 2 - mySkill.proficiencyLevel,
                            status: 'gap'
                        });
                    }
                } else {
                    // Employee doesn't have this skill
                    missing.push({
                        tech,
                        skillName: skill.name,
                        skillId: skill.id,
                        currentLevel: 0,
                        recommendedLevel: 2,
                        gap: 2,
                        status: 'missing'
                    });
                }
            } else {
                // Tech not in catalog - treat as missing
                missing.push({
                    tech,
                    skillName: tech,
                    skillId: null,
                    currentLevel: 0,
                    recommendedLevel: 2,
                    gap: 2,
                    status: 'missing'
                });
            }
        });

        const totalSkills = project.techStack.length;
        const matchScore = totalSkills > 0 ? (matches.length / totalSkills) * 100 : 0;

        return { matches, gaps, missing, matchScore, totalSkills };
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || 'None';
    };

    const getProficiencyColor = (level) => {
        const colors = ['default', 'error', 'warning', 'success'];
        return colors[level] || 'default';
    };

    const handleLearnSkill = (skillId, skillName) => {
        if (!skillId) {
            alert(`No learning resources available for ${skillName}. This technology is not in the skill catalog yet.`);
            return;
        }

        const resources = learningResources[skillId];
        if (resources && resources.length > 0) {
            // Open the first available resource
            const firstResource = resources[0];
            window.open(firstResource.url, '_blank');
        } else {
            alert(`No learning resources available for ${skillName} yet. Please contact HR to add resources.`);
        }
    };

    const renderProjectAnalysis = (project, isUpcoming = false) => {
        const analysis = analyzeProjectGaps(project);

        return (
            <Accordion key={project.id} defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                        <Avatar sx={{ bgcolor: isUpcoming ? 'warning.main' : 'success.main' }}>
                            {isUpcoming ? <Schedule /> : <PlayArrow />}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" fontWeight="bold">
                                {project.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isUpcoming ? `Expected: ${project.expectedStartDate}` : `Started: ${project.startDate}`}
                            </Typography>
                        </Box>
                        <Chip
                            label={`${analysis.matchScore.toFixed(0)}% Match`}
                            color={analysis.matchScore >= 70 ? 'success' : analysis.matchScore >= 40 ? 'warning' : 'error'}
                            sx={{ fontWeight: 'bold' }}
                        />
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    <Box>
                        {/* Project Description */}
                        <Typography variant="body2" color="text.secondary" paragraph>
                            {project.description}
                        </Typography>

                        {/* Match Score */}
                        <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                                Your Readiness
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                                <Box sx={{ flexGrow: 1 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={analysis.matchScore}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: 'grey.300',
                                            '& .MuiLinearProgress-bar': {
                                                bgcolor: analysis.matchScore >= 70 ? 'success.main' :
                                                    analysis.matchScore >= 40 ? 'warning.main' : 'error.main'
                                            }
                                        }}
                                    />
                                </Box>
                                <Typography variant="h6" fontWeight="bold">
                                    {analysis.matchScore.toFixed(0)}%
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                                You have {analysis.matches.length} out of {analysis.totalSkills} required technologies
                            </Typography>
                        </Paper>

                        {/* Summary Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={4}>
                                <Card elevation={0} sx={{ bgcolor: 'success.lighter', textAlign: 'center' }}>
                                    <CardContent>
                                        <CheckCircle color="success" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">
                                            {analysis.matches.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Ready
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={4}>
                                <Card elevation={0} sx={{ bgcolor: 'warning.lighter', textAlign: 'center' }}>
                                    <CardContent>
                                        <Warning color="warning" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">
                                            {analysis.gaps.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Need Improvement
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={4}>
                                <Card elevation={0} sx={{ bgcolor: 'error.lighter', textAlign: 'center' }}>
                                    <CardContent>
                                        <TrendingUp color="error" sx={{ fontSize: 32, mb: 1 }} />
                                        <Typography variant="h5" fontWeight="bold">
                                            {analysis.missing.length}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            To Learn
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Tech Stack Breakdown */}
                        <Typography variant="subtitle2" gutterBottom fontWeight="bold" sx={{ mt: 3 }}>
                            <Code fontSize="small" sx={{ mr: 1, verticalAlign: 'middle' }} />
                            Tech Stack Analysis
                        </Typography>

                        <List>
                            {/* Matches */}
                            {analysis.matches.map((item, idx) => (
                                <ListItem key={`match-${idx}`} sx={{ bgcolor: 'success.lighter', mb: 1, borderRadius: 1 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <CheckCircle color="success" fontSize="small" />
                                                <Typography fontWeight="bold">{item.tech}</Typography>
                                                <Chip
                                                    label={getProficiencyLabel(item.currentLevel)}
                                                    color={getProficiencyColor(item.currentLevel)}
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary="You're ready for this technology!"
                                    />
                                </ListItem>
                            ))}

                            {/* Gaps */}
                            {analysis.gaps.map((item, idx) => (
                                <ListItem key={`gap-${idx}`} sx={{ bgcolor: 'warning.lighter', mb: 1, borderRadius: 1 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Warning color="warning" fontSize="small" />
                                                <Typography fontWeight="bold">{item.tech}</Typography>
                                                <Chip
                                                    label={`${getProficiencyLabel(item.currentLevel)} → ${getProficiencyLabel(item.recommendedLevel)}`}
                                                    color="warning"
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={`Improve from ${getProficiencyLabel(item.currentLevel)} to ${getProficiencyLabel(item.recommendedLevel)} level`}
                                    />
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        color="warning"
                                        startIcon={<School />}
                                        onClick={() => handleLearnSkill(item.skillId, item.skillName)}
                                    >
                                        Learn
                                    </Button>
                                </ListItem>
                            ))}

                            {/* Missing */}
                            {analysis.missing.map((item, idx) => (
                                <ListItem key={`missing-${idx}`} sx={{ bgcolor: 'error.lighter', mb: 1, borderRadius: 1 }}>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <TrendingUp color="error" fontSize="small" />
                                                <Typography fontWeight="bold">{item.tech}</Typography>
                                                <Chip
                                                    label="Not Started"
                                                    color="error"
                                                    size="small"
                                                />
                                            </Box>
                                        }
                                        secondary={`Start learning this technology from scratch`}
                                    />
                                    <Button
                                        size="small"
                                        variant="contained"
                                        color="error"
                                        startIcon={<School />}
                                        onClick={() => handleLearnSkill(item.skillId, item.skillName)}
                                    >
                                        Start Learning
                                    </Button>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </AccordionDetails>
            </Accordion>
        );
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
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                    🎯 Skill Gap Analysis
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Analyze your skills against ongoing and upcoming projects. Identify gaps and get personalized learning recommendations.
                </Typography>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* Tabs for Ongoing vs Upcoming */}
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                    <Tab
                        icon={<PlayArrow />}
                        iconPosition="start"
                        label={`Ongoing Projects (${ongoingProjects.length})`}
                    />
                    <Tab
                        icon={<Schedule />}
                        iconPosition="start"
                        label={`Upcoming Projects (${upcomingProjects.length})`}
                    />
                </Tabs>
            </Paper>

            {/* Ongoing Projects Tab */}
            {tabValue === 0 && (
                <Box>
                    {ongoingProjects.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No ongoing projects
                            </Typography>
                        </Paper>
                    ) : (
                        <Box>
                            <Alert severity="info" sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Ongoing Projects
                                </Typography>
                                <Typography variant="body2">
                                    These are active projects. Improve your skills to contribute more effectively!
                                </Typography>
                            </Alert>
                            {ongoingProjects.map(project => renderProjectAnalysis(project, false))}
                        </Box>
                    )}
                </Box>
            )}

            {/* Upcoming Projects Tab */}
            {tabValue === 1 && (
                <Box>
                    {upcomingProjects.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary">
                                No upcoming projects
                            </Typography>
                        </Paper>
                    ) : (
                        <Box>
                            <Alert severity="warning" sx={{ mb: 3 }}>
                                <Typography variant="subtitle2" fontWeight="bold">
                                    Upcoming Projects
                                </Typography>
                                <Typography variant="body2">
                                    Prepare for these projects by learning the required technologies before they start!
                                </Typography>
                            </Alert>
                            {upcomingProjects.map(project => renderProjectAnalysis(project, true))}
                        </Box>
                    )}
                </Box>
            )}

            {/* Overall Summary */}
            <Paper sx={{ p: 3, mt: 3, bgcolor: 'primary.light' }}>
                <Typography variant="h6" gutterBottom fontWeight="bold" color="primary.contrastText">
                    💡 Pro Tip
                </Typography>
                <Typography variant="body2" color="primary.contrastText">
                    Focus on "To Learn" skills first, especially for upcoming projects. Use the "Learn" buttons to find relevant learning resources.
                    Track your progress in the "My Skills" section as you improve!
                </Typography>
            </Paper>
        </Container>
    );
};

export default MyGaps;
