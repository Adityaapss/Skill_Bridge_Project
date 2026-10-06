import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Paper, Typography, Box, Button, Grid, TextField, MenuItem, Chip, Autocomplete, Table, TableHead, TableRow,
    TableCell, TableBody, TableContainer, TablePagination, ToggleButtonGroup, ToggleButton, Dialog, DialogTitle,
    DialogContent, DialogActions, InputAdornment, Tooltip, LinearProgress, Alert, Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Search, TableRows, GridOn, PersonSearch, Download, FilterListOff } from '@mui/icons-material';
import { employeeSkillsAPI, skillsAPI, employeesAPI, projectsAPI, rolesProjectsAPI, insightsAPI } from '../services/api';
import { useUi } from '../context/UiContext';
import { errorMessage } from '../utils/errors';
import { downloadBlob } from '../utils/download';
import { levelColor, LEVEL_LABELS } from '../theme';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import EmptyState from '../components/EmptyState';
import useTablePagination from '../hooks/useTablePagination';

const BILLABLE = { BILLABLE: ['Billable', 'success'], NON_BILLABLE: ['Non-billable', 'warning'], INVESTMENT: ['Investment', 'info'], 'Not Assigned': ['Not assigned', 'default'] };
const scoreColor = (n) => (n >= 70 ? 'success' : n >= 40 ? 'warning' : 'error');
const initials = (name) => name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

const TeamMatrix = () => {
    const theme = useTheme();
    const { toast } = useUi();
    const [view, setView] = useState('directory');
    const [employees, setEmployees] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [minLevel, setMinLevel] = useState(1);
    const [department, setDepartment] = useState('ALL');
    const [availability, setAvailability] = useState('ALL');
    const [billable, setBillable] = useState('ALL');
    const [project, setProject] = useState('ALL');
    const [detail, setDetail] = useState(null);

    const [targets, setTargets] = useState([]);
    const [targetId, setTargetId] = useState('');
    const [suggestions, setSuggestions] = useState(null);
    const [suggesting, setSuggesting] = useState(false);

    const load = useCallback(async () => {
        try {
            const [skills, emps, ongoing, rp] = await Promise.all([
                skillsAPI.getAll(true), employeesAPI.getAll(), projectsAPI.getOngoing(), rolesProjectsAPI.getAll(undefined, 'ACTIVE'),
            ]);
            setAllSkills(skills.data);
            setTargets(rp.data);
            const enriched = await Promise.all(emps.data.map(async (emp) => {
                let list = [];
                try { list = (await employeeSkillsAPI.getByEmployee(emp.id)).data; } catch { /* leave empty */ }
                // Only manager-approved skills count when searching for people
                const approved = list.filter((s) => s.approvalStatus === 'APPROVED');
                const mine = ongoing.data.filter((p) => p.assignedEmployees?.some((a) => a.employeeId === emp.id));
                const first = mine[0]?.assignedEmployees.find((a) => a.employeeId === emp.id);
                return {
                    ...emp, skills: approved,
                    availability: mine.length ? 'Busy' : 'Available',
                    billableStatus: first?.allocationType || 'Not Assigned',
                    currentProject: mine[0]?.name || 'Not Assigned',
                    allProjects: mine,
                };
            }));
            setEmployees(enriched);
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to load employee data'));
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => { load(); }, [load]);

    const departments = useMemo(() => ['ALL', ...new Set(employees.map((e) => e.department).filter(Boolean))], [employees]);
    const projectNames = useMemo(() => ['ALL', 'Not Assigned', ...new Set(employees.map((e) => e.currentProject).filter((p) => p !== 'Not Assigned'))], [employees]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return employees.filter((e) =>
            (!q || e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q)) &&
            selectedSkills.every((sk) => e.skills.some((es) => es.skillId === sk.id && es.proficiencyLevel >= minLevel)) &&
            (department === 'ALL' || e.department === department) &&
            (availability === 'ALL' || e.availability === availability) &&
            (billable === 'ALL' || e.billableStatus === billable) &&
            (project === 'ALL' || e.currentProject === project));
    }, [employees, search, selectedSkills, minLevel, department, availability, billable, project]);

    const filtersActive = search || selectedSkills.length || department !== 'ALL' || availability !== 'ALL' || billable !== 'ALL' || project !== 'ALL';
    const clear = () => { setSearch(''); setSelectedSkills([]); setMinLevel(1); setDepartment('ALL'); setAvailability('ALL'); setBillable('ALL'); setProject('ALL'); };

    const paging = useTablePagination(filtered, 10);
    const heatPaging = useTablePagination(filtered, 15);

    // Heatmap columns: selected skills, else the most commonly held ones
    const heatSkills = useMemo(() => {
        if (selectedSkills.length) return selectedSkills;
        const counts = {};
        employees.forEach((e) => e.skills.forEach((s) => { counts[s.skillId] = (counts[s.skillId] || 0) + 1; }));
        return allSkills.filter((s) => counts[s.id]).sort((a, b) => counts[b.id] - counts[a.id]).slice(0, 12);
    }, [selectedSkills, employees, allSkills]);

    const levelOf = (emp, skillId) => emp.skills.find((s) => s.skillId === skillId)?.proficiencyLevel || 0;

    const exportCsv = async () => {
        try {
            downloadBlob((await employeesAPI.exportSkillMatrix()).data, 'skill-matrix.csv');
        } catch (err) {
            toast.error(errorMessage(err, 'Export failed'));
        }
    };

    const suggest = async () => {
        setSuggesting(true);
        try {
            setSuggestions((await insightsAPI.staffing(targetId, 10)).data);
        } catch (err) {
            toast.error(errorMessage(err, 'Could not compute suggestions'));
        } finally {
            setSuggesting(false);
        }
    };

    if (loading) return <PageSkeleton tiles={3} />;

    const target = targets.find((t) => t.id === targetId);

    return (
        <Box>
            <PageHeader
                title="Team matrix"
                subtitle="Find the right people by skill, availability and project"
                actions={<Button variant="outlined" startIcon={<Download />} onClick={exportCsv}>Export CSV</Button>}
            />

            <Paper sx={{ p: 2, mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <ToggleButtonGroup exclusive size="small" value={view} onChange={(_, v) => v && setView(v)} aria-label="View">
                    <ToggleButton value="directory"><TableRows fontSize="small" sx={{ mr: 1 }} />Directory</ToggleButton>
                    <ToggleButton value="heatmap"><GridOn fontSize="small" sx={{ mr: 1 }} />Heatmap</ToggleButton>
                    <ToggleButton value="staffing"><PersonSearch fontSize="small" sx={{ mr: 1 }} />Staffing</ToggleButton>
                </ToggleButtonGroup>
                <Typography color="text.secondary">{filtered.length} of {employees.length} people</Typography>
            </Paper>

            {view !== 'staffing' && (
                <Paper sx={{ p: 2.5, mb: 3 }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth size="small" label="Search name or email" value={search} onChange={(e) => setSearch(e.target.value)}
                                InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Autocomplete multiple size="small" options={allSkills} getOptionLabel={(o) => o.name} value={selectedSkills}
                                onChange={(_, v) => setSelectedSkills(v)}
                                renderInput={(params) => <TextField {...params} label="Must have skills" placeholder="Select skills…" />} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 3 }}>
                            <TextField select fullWidth size="small" label="Minimum level" value={minLevel} onChange={(e) => setMinLevel(Number(e.target.value))} disabled={!selectedSkills.length}>
                                {LEVEL_LABELS.slice(1).map((l, i) => <MenuItem key={l} value={i + 1}>{l}+</MenuItem>)}
                            </TextField>
                        </Grid>
                        {[['Department', department, setDepartment, departments], ['Availability', availability, setAvailability, ['ALL', 'Available', 'Busy']],
                        ['Allocation', billable, setBillable, ['ALL', 'BILLABLE', 'NON_BILLABLE', 'INVESTMENT', 'Not Assigned']], ['Project', project, setProject, projectNames]].map(([label, value, set, opts]) => (
                            <Grid key={label} size={{ xs: 6, md: 2.4 }}>
                                <TextField select fullWidth size="small" label={label} value={value} onChange={(e) => set(e.target.value)}>
                                    {opts.map((o) => <MenuItem key={o} value={o}>{o === 'ALL' ? `All` : BILLABLE[o]?.[0] || o}</MenuItem>)}
                                </TextField>
                            </Grid>
                        ))}
                        <Grid size={{ xs: 12, md: 2.4 }}>
                            <Button fullWidth startIcon={<FilterListOff />} onClick={clear} disabled={!filtersActive} sx={{ height: 40 }}>Clear filters</Button>
                        </Grid>
                    </Grid>
                </Paper>
            )}

            {view === 'directory' && (
                <Paper>
                    {filtered.length === 0 ? <EmptyState title="No one matches these filters" actionLabel="Clear filters" onAction={clear} /> : (
                        <>
                            <TableContainer>
                                <Table>
                                    <TableHead><TableRow><TableCell>Person</TableCell><TableCell>Department</TableCell><TableCell>Top skills</TableCell><TableCell>Availability</TableCell><TableCell>Allocation</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {paging.pageRows.map((e) => {
                                            const top = [...e.skills].sort((a, b) => b.proficiencyLevel - a.proficiencyLevel).slice(0, 3);
                                            const [bl, bc] = BILLABLE[e.billableStatus] || [e.billableStatus, 'default'];
                                            return (
                                                <TableRow key={e.id} hover onClick={() => setDetail(e)} sx={{ cursor: 'pointer' }}>
                                                    <TableCell>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                            <Avatar sx={{ width: 34, height: 34, fontSize: 13, bgcolor: 'primary.main' }}>{initials(e.name)}</Avatar>
                                                            <Box><Typography fontWeight={600}>{e.name}</Typography><Typography variant="caption" color="text.secondary">{e.jobTitle || e.email}</Typography></Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>{e.department || '—'}</TableCell>
                                                    <TableCell>{top.length ? top.map((s) => <Chip key={s.id} size="small" label={`${s.skillName} · ${LEVEL_LABELS[s.proficiencyLevel][0]}`} sx={{ mr: 0.5 }} />) : <Typography variant="body2" color="text.secondary">No approved skills</Typography>}</TableCell>
                                                    <TableCell><Chip size="small" color={e.availability === 'Available' ? 'success' : 'error'} variant="outlined" label={e.availability} /></TableCell>
                                                    <TableCell><Chip size="small" color={bc} label={bl} /></TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination {...paging.props} />
                        </>
                    )}
                </Paper>
            )}

            {view === 'heatmap' && (
                <Paper>
                    {filtered.length === 0 || heatSkills.length === 0 ? <EmptyState title="Nothing to show" message="No approved skills match the current filters." /> : (
                        <>
                            <Box sx={{ px: 2, pt: 2, display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                                <Typography variant="body2" color="text.secondary">
                                    {selectedSkills.length ? 'Selected skills' : 'Most common skills'} · level:
                                </Typography>
                                {LEVEL_LABELS.map((l, i) => (
                                    <Box key={l} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: levelColor(i, theme.palette.mode) }} />
                                        <Typography variant="caption">{l}</Typography>
                                    </Box>
                                ))}
                            </Box>
                            <TableContainer sx={{ mt: 1 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{ minWidth: 170 }}>Person</TableCell>
                                            {heatSkills.map((s) => <TableCell key={s.id} align="center" sx={{ minWidth: 86 }}>{s.name}</TableCell>)}
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {heatPaging.pageRows.map((e) => (
                                            <TableRow key={e.id} hover>
                                                <TableCell sx={{ cursor: 'pointer' }} onClick={() => setDetail(e)}>{e.name}</TableCell>
                                                {heatSkills.map((s) => {
                                                    const lvl = levelOf(e, s.id);
                                                    return (
                                                        <TableCell key={s.id} align="center" sx={{ p: 0.5 }}>
                                                            <Tooltip title={`${e.name} · ${s.name}: ${LEVEL_LABELS[lvl]}`}>
                                                                <Box sx={{ borderRadius: 1, py: 0.75, bgcolor: levelColor(lvl, theme.palette.mode), color: lvl >= 2 ? '#fff' : 'text.secondary', fontWeight: 700, fontSize: 13 }}>
                                                                    {lvl || '·'}
                                                                </Box>
                                                            </Tooltip>
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination {...heatPaging.props} />
                        </>
                    )}
                </Paper>
            )}

            {view === 'staffing' && (
                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" gutterBottom>Who fits this role or project?</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        People are ranked by how many of the required skills they meet (approved skills only), then by lightest current workload.
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
                        <TextField select size="small" label="Role / project" value={targetId} onChange={(e) => { setTargetId(e.target.value); setSuggestions(null); }} sx={{ minWidth: 280 }}
                            helperText={targets.length === 0 ? 'Create a role or project with skill requirements first' : ' '}>
                            {targets.map((t) => <MenuItem key={t.id} value={t.id}>{t.name} ({t.type.toLowerCase()})</MenuItem>)}
                        </TextField>
                        <Button variant="contained" disabled={!targetId || suggesting} onClick={suggest} sx={{ height: 40 }}>{suggesting ? 'Matching…' : 'Find best fit'}</Button>
                    </Box>
                    {suggestions && (suggestions.length === 0 || suggestions[0].totalSkills === 0 ? (
                        <Alert severity="info">{target?.name} has no skill requirements yet, so there is nothing to match against.</Alert>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>#</TableCell><TableCell>Person</TableCell><TableCell sx={{ minWidth: 190 }}>Match</TableCell><TableCell>Workload</TableCell><TableCell>Missing</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {suggestions.map((s, i) => (
                                        <TableRow key={s.employeeId} hover>
                                            <TableCell>{i + 1}</TableCell>
                                            <TableCell><Typography fontWeight={600}>{s.name}</Typography><Typography variant="caption" color="text.secondary">{s.jobTitle || s.department || ''}</Typography></TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <LinearProgress variant="determinate" value={s.matchScore} color={scoreColor(s.matchScore)} sx={{ flexGrow: 1, height: 8, borderRadius: 4 }} />
                                                    <Typography variant="body2" sx={{ width: 64 }}>{s.matchScore.toFixed(0)}% ({s.metSkills}/{s.totalSkills})</Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell><Chip size="small" variant="outlined" color={s.activeAssignments === 0 ? 'success' : 'default'} label={s.activeAssignments === 0 ? 'Free' : `${s.activeAssignments} project${s.activeAssignments > 1 ? 's' : ''}`} /></TableCell>
                                            <TableCell>{s.missingSkills.length ? s.missingSkills.join(', ') : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ))}
                </Paper>
            )}

            <Dialog open={Boolean(detail)} onClose={() => setDetail(null)} fullWidth maxWidth="sm">
                {detail && (
                    <>
                        <DialogTitle>{detail.name}</DialogTitle>
                        <DialogContent dividers>
                            <Typography color="text.secondary" gutterBottom>{[detail.jobTitle, detail.department, detail.location].filter(Boolean).join(' · ') || detail.email}</Typography>
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Approved skills</Typography>
                            {detail.skills.length === 0 ? <Typography color="text.secondary">None yet</Typography> : (
                                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                    {[...detail.skills].sort((a, b) => b.proficiencyLevel - a.proficiencyLevel).map((s) => (
                                        <Chip key={s.id} size="small" label={`${s.skillName} · ${LEVEL_LABELS[s.proficiencyLevel]}`} color={['default', 'error', 'warning', 'success'][s.proficiencyLevel]} variant="outlined" />
                                    ))}
                                </Box>
                            )}
                            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>Current projects</Typography>
                            {detail.allProjects.length === 0 ? <Typography color="text.secondary">Not assigned</Typography>
                                : detail.allProjects.map((p) => <Chip key={p.id} label={p.name} sx={{ mr: 0.5 }} />)}
                        </DialogContent>
                        <DialogActions><Button onClick={() => setDetail(null)}>Close</Button></DialogActions>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default TeamMatrix;
