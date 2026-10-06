import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Paper, Typography, Box, Button, Grid, Chip, LinearProgress, Alert, List, ListItem, ListItemText, Tabs, Tab,
    Avatar, Accordion, AccordionSummary, AccordionDetails, Dialog, DialogTitle, DialogContent, DialogActions,
    Menu, MenuItem, IconButton, Tooltip,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import {
    CheckCircle, Warning, School, ExpandMore, PlayArrow, Schedule, TrendingUp, Launch, Route, DoneAll, Close,
} from '@mui/icons-material';
import {
    ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RTooltip,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import {
    employeeSkillsAPI, skillsAPI, learningResourcesAPI, projectsAPI, learningProgressAPI, insightsAPI, analyticsAPI,
} from '../services/api';
import { errorMessage } from '../utils/errors';
import { LEVEL_LABELS } from '../theme';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import EmptyState from '../components/EmptyState';

const RECOMMENDED_LEVEL = 2;
const LEVEL_COLOR = ['default', 'error', 'warning', 'success'];
const norm = (s) => s.trim().toLowerCase();
const scoreColor = (n) => (n >= 70 ? 'success' : n >= 40 ? 'warning' : 'error');

/** Exact (case-insensitive) match only: substring matching confused "Java" with "JavaScript". */
const findSkill = (skills, tech) => skills.find((s) => norm(s.name) === norm(tech));

const MyGaps = () => {
    const theme = useTheme();
    const { user } = useAuth();
    const { toast } = useUi();
    const [tab, setTab] = useState(0);
    const [mySkills, setMySkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [resourcesBySkill, setResourcesBySkill] = useState({});
    const [resourcesById, setResourcesById] = useState({});
    const [progress, setProgress] = useState({});
    const [ongoing, setOngoing] = useState([]);
    const [upcoming, setUpcoming] = useState([]);
    const [careers, setCareers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [radar, setRadar] = useState(null);
    const [picker, setPicker] = useState(null); // { anchor, skillName, resources }

    const loadProgress = useCallback(async () => {
        const { data } = await learningProgressAPI.mine();
        setProgress(Object.fromEntries(data.map((p) => [p.resourceId, p])));
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const [skills, mine, on, up, res, paths] = await Promise.all([
                    skillsAPI.getAll(true),
                    employeeSkillsAPI.getByEmployee(user.id),
                    projectsAPI.getOngoing(),
                    projectsAPI.getUpcoming(),
                    learningResourcesAPI.getAll(),
                    insightsAPI.careerPaths(user.id),
                ]);
                setAllSkills(skills.data);
                setMySkills(mine.data.filter((s) => s.approvalStatus === 'APPROVED'));
                setOngoing(on.data);
                setUpcoming(up.data);
                setCareers(paths.data);
                const bySkill = {};
                res.data.forEach((r) => { (bySkill[r.skillId] = bySkill[r.skillId] || []).push(r); });
                setResourcesBySkill(bySkill);
                setResourcesById(Object.fromEntries(res.data.map((r) => [r.id, r])));
                await loadProgress();
            } catch (err) {
                toast.error(errorMessage(err, 'Failed to load skill data'));
            } finally {
                setLoading(false);
            }
        })();
    }, [user.id, toast, loadProgress]);

    const analyze = useCallback((project) => {
        const matches = []; const gaps = []; const missing = [];
        (project.techStack || []).forEach((tech) => {
            const skill = findSkill(allSkills, tech);
            const mine = skill && mySkills.find((m) => m.skillId === skill.id);
            const base = { tech, skillId: skill?.id ?? null, skillName: skill?.name ?? tech };
            if (mine && mine.proficiencyLevel >= RECOMMENDED_LEVEL) matches.push({ ...base, currentLevel: mine.proficiencyLevel });
            else if (mine) gaps.push({ ...base, currentLevel: mine.proficiencyLevel });
            else missing.push({ ...base, currentLevel: 0 });
        });
        const total = (project.techStack || []).length;
        return { matches, gaps, missing, total, score: total ? (matches.length / total) * 100 : 0 };
    }, [allSkills, mySkills]);

    const learn = (e, item) => {
        const list = item.skillId ? resourcesBySkill[item.skillId] : null;
        if (!list?.length) {
            toast.info(item.skillId
                ? `No learning resources for ${item.skillName} yet — ask HR to add some.`
                : `${item.skillName} is not in the skill catalog yet.`);
            return;
        }
        setPicker({ anchor: e.currentTarget, skillName: item.skillName, resources: list });
    };

    const startResource = async (r) => {
        setPicker(null);
        window.open(r.url, '_blank', 'noopener,noreferrer');
        try {
            await learningProgressAPI.start(r.id);
            await loadProgress();
            toast.success(`Tracking "${r.title}" in My learning`);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not track this resource'));
        }
    };

    const completeResource = async (r) => {
        try {
            await learningProgressAPI.complete(r.id);
            await loadProgress();
            toast.success('Nice work! Add or update the skill in My Skills so your manager can validate it.');
        } catch (err) {
            toast.error(errorMessage(err, 'Could not update progress'));
        }
    };

    const dropResource = async (r) => {
        try {
            await learningProgressAPI.remove(r.id);
            await loadProgress();
        } catch (err) {
            toast.error(errorMessage(err, 'Could not remove'));
        }
    };

    const openRadar = async (role) => {
        try {
            const { data } = await analyticsAPI.getGapAnalysis(user.id, role.roleId);
            const rows = [
                ...data.matches.map((m) => ({ skill: m.skillName, Required: m.requiredLevel, You: m.currentLevel })),
                ...data.gaps.map((m) => ({ skill: m.skillName, Required: m.requiredLevel, You: m.currentLevel })),
                ...data.missing.map((m) => ({ skill: m.skillName, Required: m.requiredLevel, You: 0 })),
            ];
            setRadar({ role: role.roleName, rows });
        } catch (err) {
            toast.error(errorMessage(err, 'Could not load the comparison'));
        }
    };

    const renderProject = (project, isUpcoming) => {
        const a = analyze(project);
        const color = scoreColor(a.score);
        const Row = ({ item, kind }) => (
            <ListItem sx={{ bgcolor: alpha(theme.palette[kind].main, 0.1), mb: 1, borderRadius: 2 }}
                secondaryAction={kind !== 'success' && (
                    <Button size="small" variant={kind === 'error' ? 'contained' : 'outlined'} color={kind}
                        startIcon={<School />} onClick={(e) => learn(e, item)}>
                        {kind === 'error' ? 'Start learning' : 'Learn'}
                    </Button>
                )}>
                <ListItemText
                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {kind === 'success' ? <CheckCircle color="success" fontSize="small" /> : kind === 'warning' ? <Warning color="warning" fontSize="small" /> : <TrendingUp color="error" fontSize="small" />}
                        <Typography fontWeight={600}>{item.tech}</Typography>
                        <Chip size="small" color={kind === 'error' ? 'error' : LEVEL_COLOR[item.currentLevel]} variant="outlined"
                            label={kind === 'warning' ? `${LEVEL_LABELS[item.currentLevel]} → ${LEVEL_LABELS[RECOMMENDED_LEVEL]}` : kind === 'error' ? 'Not started' : LEVEL_LABELS[item.currentLevel]} />
                    </Box>}
                />
            </ListItem>
        );
        return (
            <Accordion key={project.id} disableGutters sx={{ mb: 1.5, '&:before': { display: 'none' }, border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2, pr: 1 }}>
                        <Avatar sx={{ bgcolor: isUpcoming ? 'warning.main' : 'success.main' }}>{isUpcoming ? <Schedule /> : <PlayArrow />}</Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6">{project.name}</Typography>
                            <Typography variant="caption" color="text.secondary">
                                {isUpcoming ? `Expected: ${project.expectedStartDate || 'TBD'}` : `Started: ${project.startDate || '—'}`}
                            </Typography>
                        </Box>
                        <Chip label={`${a.score.toFixed(0)}% match`} color={color} />
                    </Box>
                </AccordionSummary>
                <AccordionDetails>
                    {project.description && <Typography variant="body2" color="text.secondary" paragraph>{project.description}</Typography>}
                    <Box sx={{ mb: 2 }}>
                        <LinearProgress variant="determinate" value={a.score} color={color} sx={{ height: 10, borderRadius: 5 }} />
                        <Typography variant="caption" color="text.secondary">
                            You are ready for {a.matches.length} of {a.total} technologies (Intermediate or above)
                        </Typography>
                    </Box>
                    {a.total === 0 ? <Typography color="text.secondary">No tech stack listed for this project.</Typography> : (
                        <List disablePadding>
                            {a.matches.map((i) => <Row key={`m${i.tech}`} item={i} kind="success" />)}
                            {a.gaps.map((i) => <Row key={`g${i.tech}`} item={i} kind="warning" />)}
                            {a.missing.map((i) => <Row key={`x${i.tech}`} item={i} kind="error" />)}
                        </List>
                    )}
                </AccordionDetails>
            </Accordion>
        );
    };

    const learning = useMemo(() => Object.values(progress)
        .map((p) => ({ ...p, resource: resourcesById[p.resourceId] })).filter((p) => p.resource)
        .sort((a, b) => (a.status === b.status ? 0 : a.status === 'IN_PROGRESS' ? -1 : 1)), [progress, resourcesById]);

    if (loading) return <PageSkeleton tiles={3} />;

    const projectsTab = (list, isUpcoming) => list.length === 0
        ? <Paper><EmptyState title={`No ${isUpcoming ? 'upcoming' : 'ongoing'} projects`} /></Paper>
        : <>
            <Alert severity={isUpcoming ? 'warning' : 'info'} sx={{ mb: 2 }}>
                {isUpcoming ? 'Prepare for these projects by learning the required technologies before they start.' : 'Improve your skills to contribute more effectively to active projects.'}
            </Alert>
            {list.map((p) => renderProject(p, isUpcoming))}
        </>;

    return (
        <Box>
            <PageHeader title="Skill gaps" subtitle="Compare your approved skills with projects and roles, then close the gaps with learning." />
            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" sx={{ px: 2 }}>
                    <Tab icon={<PlayArrow />} iconPosition="start" label={`Ongoing (${ongoing.length})`} />
                    <Tab icon={<Schedule />} iconPosition="start" label={`Upcoming (${upcoming.length})`} />
                    <Tab icon={<Route />} iconPosition="start" label="Career paths" />
                    <Tab icon={<School />} iconPosition="start" label={`My learning (${learning.length})`} />
                </Tabs>
            </Paper>

            {tab === 0 && projectsTab(ongoing, false)}
            {tab === 1 && projectsTab(upcoming, true)}

            {tab === 2 && (careers.length === 0 ? (
                <Paper><EmptyState title="No roles defined yet" message="Roles with skill requirements will appear here." /></Paper>
            ) : (
                <Grid container spacing={2}>
                    {careers.map((c) => (
                        <Grid key={c.roleId} size={{ xs: 12, md: 6 }}>
                            <Paper sx={{ p: 2.5, height: '100%' }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                    <Typography variant="h6">{c.roleName}</Typography>
                                    <Chip color={scoreColor(c.matchScore)} label={`${c.matchScore.toFixed(0)}%`} />
                                </Box>
                                <LinearProgress variant="determinate" value={c.matchScore} color={scoreColor(c.matchScore)} sx={{ height: 8, borderRadius: 4, mb: 1.5 }} />
                                {c.skillsToImprove === 0 ? (
                                    <Typography color="success.main" fontWeight={600}>You meet every requirement for this role 🎉</Typography>
                                ) : (
                                    <>
                                        <Typography variant="body2" color="text.secondary">
                                            {c.skillsToImprove} of {c.totalSkills} skills to improve · est. {c.estimatedMonths} months
                                        </Typography>
                                        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                            {c.topGaps.map((g) => <Chip key={g} size="small" variant="outlined" label={g} />)}
                                        </Box>
                                    </>
                                )}
                                <Button size="small" sx={{ mt: 1.5 }} onClick={() => openRadar(c)}>Compare skills</Button>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ))}

            {tab === 3 && (learning.length === 0 ? (
                <Paper><EmptyState title="Nothing tracked yet" message="Use “Learn” on a skill gap to start a resource and track it here." /></Paper>
            ) : (
                <Paper>
                    <List>
                        {learning.map((p) => (
                            <ListItem key={p.id} divider
                                secondaryAction={<Box>
                                    {p.status === 'IN_PROGRESS' && <Button size="small" startIcon={<DoneAll />} onClick={() => completeResource(p.resource)}>Mark complete</Button>}
                                    <Tooltip title="Open"><IconButton component="a" href={p.resource.url} target="_blank" rel="noopener noreferrer" aria-label="Open resource"><Launch fontSize="small" /></IconButton></Tooltip>
                                    <Tooltip title="Stop tracking"><IconButton onClick={() => dropResource(p.resource)} aria-label="Stop tracking"><Close fontSize="small" /></IconButton></Tooltip>
                                </Box>}>
                                <ListItemText
                                    primary={p.resource.title}
                                    secondary={`${p.resource.skillName} · ${p.resource.level?.toLowerCase()}${p.completedAt ? ` · completed ${new Date(p.completedAt).toLocaleDateString()}` : ''}`}
                                />
                                <Chip size="small" sx={{ mr: 14 }} color={p.status === 'COMPLETED' ? 'success' : 'info'} label={p.status === 'COMPLETED' ? 'Completed' : 'In progress'} />
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            ))}

            <Menu anchorEl={picker?.anchor} open={Boolean(picker)} onClose={() => setPicker(null)}>
                {picker?.resources.map((r) => (
                    <MenuItem key={r.id} onClick={() => startResource(r)}>
                        <ListItemText primary={r.title} secondary={`${r.type} · ${r.level?.toLowerCase()}${r.isFree ? ' · free' : ''}`} />
                    </MenuItem>
                ))}
            </Menu>

            <Dialog open={Boolean(radar)} onClose={() => setRadar(null)} fullWidth maxWidth="sm">
                <DialogTitle>You vs {radar?.role}</DialogTitle>
                <DialogContent>
                    <Box sx={{ height: 340 }}>
                        <ResponsiveContainer>
                            <RadarChart data={radar?.rows || []}>
                                <PolarGrid stroke={theme.palette.divider} />
                                <PolarAngleAxis dataKey="skill" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                <PolarRadiusAxis domain={[0, 3]} tickCount={4} tick={{ fill: theme.palette.text.secondary, fontSize: 11 }} />
                                <Radar name="Required" dataKey="Required" stroke={theme.palette.warning.main} fill={theme.palette.warning.main} fillOpacity={0.2} />
                                <Radar name="You" dataKey="You" stroke={theme.palette.primary.main} fill={theme.palette.primary.main} fillOpacity={0.35} />
                                <Legend />
                                <RTooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </Box>
                    <Typography variant="caption" color="text.secondary">Levels: 0 none · 1 beginner · 2 intermediate · 3 advanced</Typography>
                </DialogContent>
                <DialogActions><Button onClick={() => setRadar(null)}>Close</Button></DialogActions>
            </Dialog>
        </Box>
    );
};

export default MyGaps;
