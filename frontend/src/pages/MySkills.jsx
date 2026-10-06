import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Paper, Typography, Box, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    MenuItem, Alert, Rating, Grid, Tabs, Tab, LinearProgress, Tooltip, InputAdornment, Table, TableHead, TableRow,
    TableCell, TableBody, TableContainer, Avatar,
} from '@mui/material';
import { Add, Edit, Delete, Search, ThumbUp, WorkspacePremium, Link as LinkIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { employeeSkillsAPI, skillsAPI, endorsementsAPI, certificationsAPI } from '../services/api';
import { errorMessage } from '../utils/errors';
import { LEVEL_LABELS } from '../theme';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import EmptyState from '../components/EmptyState';

const STATUS = {
    APPROVED: { label: 'Approved', color: 'success' },
    PENDING: { label: 'Pending review', color: 'warning' },
    REJECTED: { label: 'Rejected', color: 'error' },
};
const LEVEL_COLOR = ['default', 'error', 'warning', 'success'];
const emptyForm = { skillId: '', proficiencyLevel: 1, interestLevel: 1, yearsExperience: 0 };
const emptyCert = { name: '', issuer: '', issuedDate: '', expiryDate: '', credentialUrl: '' };

const daysUntil = (iso) => Math.ceil((new Date(iso) - new Date()) / 86400000);
const fmt = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '—');

const HISTORY_TEXT = {
    ADDED: (h, name) => `Added ${name} at ${LEVEL_LABELS[h.newLevel]}`,
    UPDATED: (h, name) => `Changed ${name} from ${LEVEL_LABELS[h.oldLevel]} to ${LEVEL_LABELS[h.newLevel]}`,
    APPROVED: (h, name) => `${name} approved at ${LEVEL_LABELS[h.newLevel]}`,
    REJECTED: (h, name) => `${name} rejected${h.note ? ` — ${h.note}` : ''}`,
    REMOVED: (h, name) => `Removed ${name}`,
};
const HISTORY_COLOR = { ADDED: 'primary', UPDATED: 'warning', APPROVED: 'success', REJECTED: 'error', REMOVED: 'default' };

const MySkills = () => {
    const { user } = useAuth();
    const { toast, confirm } = useUi();
    const [tab, setTab] = useState(0);
    const [skills, setSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [endorsements, setEndorsements] = useState({});
    const [history, setHistory] = useState([]);
    const [certs, setCerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [openDialog, setOpenDialog] = useState(false);
    const [editingSkill, setEditingSkill] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [certDialog, setCertDialog] = useState(false);
    const [certForm, setCertForm] = useState(emptyCert);

    const load = useCallback(async () => {
        try {
            const [s, e, h, c] = await Promise.all([
                employeeSkillsAPI.getByEmployee(user.id),
                endorsementsAPI.forEmployee(user.id),
                employeeSkillsAPI.getHistory(user.id),
                certificationsAPI.forEmployee(user.id),
            ]);
            setSkills(s.data); setEndorsements(e.data); setHistory(h.data); setCerts(c.data);
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to load your skills'));
        } finally {
            setLoading(false);
        }
    }, [user.id, toast]);

    useEffect(() => {
        load();
        skillsAPI.getAll(true).then((r) => setAllSkills(r.data)).catch(() => { });
    }, [load]);

    const skillName = useMemo(() => Object.fromEntries(allSkills.map((s) => [s.id, s.name])), [allSkills]);
    const available = useMemo(() => {
        const mine = new Set(skills.map((s) => s.skillId));
        return allSkills.filter((s) => !mine.has(s.id));
    }, [allSkills, skills]);

    const filtered = useMemo(() => skills.filter((s) =>
        (statusFilter === 'ALL' || s.approvalStatus === statusFilter) &&
        s.skillName.toLowerCase().includes(search.trim().toLowerCase())), [skills, search, statusFilter]);

    const byCategory = useMemo(() => filtered.reduce((acc, s) => {
        const c = (s.skillCategory || 'OTHER').replace('_', ' ');
        (acc[c] = acc[c] || []).push(s);
        return acc;
    }, {}), [filtered]);

    const openForm = (skill = null) => {
        setEditingSkill(skill);
        setFormData(skill ? {
            skillId: skill.skillId, proficiencyLevel: skill.proficiencyLevel,
            interestLevel: skill.interestLevel, yearsExperience: skill.yearsExperience || 0,
        } : emptyForm);
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        try {
            if (editingSkill) {
                await employeeSkillsAPI.update(user.id, editingSkill.skillId, formData);
                toast.success(formData.proficiencyLevel !== editingSkill.proficiencyLevel
                    ? 'Saved — your manager will review the new level' : 'Skill updated');
            } else {
                await employeeSkillsAPI.add(user.id, {
                    ...formData, source: 'SELF_REPORTED', lastUsedDate: new Date().toISOString().split('T')[0],
                });
                toast.success('Skill submitted for approval');
            }
            setOpenDialog(false);
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to save skill'));
        }
    };

    const handleDelete = async (skill) => {
        const ok = await confirm({
            title: `Remove ${skill.skillName}?`, message: 'It will be removed from your profile. This is recorded in your history.',
            confirmText: 'Remove', destructive: true,
        });
        if (!ok) return;
        try {
            await employeeSkillsAPI.delete(user.id, skill.skillId);
            toast.success('Skill removed');
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to remove skill'));
        }
    };

    const saveCert = async () => {
        try {
            await certificationsAPI.add(user.id, {
                ...certForm, issuedDate: certForm.issuedDate || null, expiryDate: certForm.expiryDate || null,
                credentialUrl: certForm.credentialUrl || null,
            });
            toast.success('Certification added');
            setCertDialog(false); setCertForm(emptyCert);
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to add certification'));
        }
    };

    const removeCert = async (c) => {
        if (!(await confirm({ title: `Remove ${c.name}?`, message: 'This certification will be deleted.', confirmText: 'Delete', destructive: true }))) return;
        try {
            await certificationsAPI.remove(user.id, c.id);
            load();
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to remove certification'));
        }
    };

    if (loading) return <PageSkeleton />;

    const approved = skills.filter((s) => s.approvalStatus === 'APPROVED').length;
    const pending = skills.filter((s) => s.approvalStatus === 'PENDING').length;
    const totalEndorsements = Object.values(endorsements).reduce((n, l) => n + l.length, 0);

    return (
        <Box>
            <PageHeader
                title="My Skills"
                subtitle="Track your expertise. New skills and level changes are reviewed by your manager."
                actions={tab === 2
                    ? <Button variant="contained" startIcon={<Add />} onClick={() => setCertDialog(true)}>Add certification</Button>
                    : <Button variant="contained" startIcon={<Add />} onClick={() => openForm()}>Add skill</Button>}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                {[['Total skills', skills.length], ['Approved', approved], ['Pending review', pending], ['Endorsements', totalEndorsements]].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 6, md: 3 }}>
                        <Paper sx={{ p: 2.5 }}>
                            <Typography variant="body2" color="text.secondary">{label}</Typography>
                            <Typography variant="h4">{value}</Typography>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label="Skills" />
                    <Tab label={`History (${history.length})`} />
                    <Tab label={`Certifications (${certs.length})`} />
                </Tabs>
            </Paper>

            {tab === 0 && (
                <>
                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <TextField
                            size="small" placeholder="Search skills" value={search} onChange={(e) => setSearch(e.target.value)}
                            sx={{ minWidth: 240 }} inputProps={{ 'aria-label': 'Search skills' }}
                            InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }}
                        />
                        <TextField select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 170 }} label="Status">
                            <MenuItem value="ALL">All statuses</MenuItem>
                            {Object.entries(STATUS).map(([k, v]) => <MenuItem key={k} value={k}>{v.label}</MenuItem>)}
                        </TextField>
                    </Box>

                    {skills.length === 0 ? (
                        <Paper><EmptyState title="No skills yet" message="Build your profile by adding your first skill." actionLabel="Add your first skill" onAction={() => openForm()} /></Paper>
                    ) : filtered.length === 0 ? (
                        <Paper><EmptyState title="No matching skills" message="Try a different search or status filter." /></Paper>
                    ) : Object.entries(byCategory).map(([category, list]) => (
                        <Box key={category} sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 1.5 }}>{category} <Typography component="span" color="text.secondary">({list.length})</Typography></Typography>
                            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 2 }}>
                                {list.map((skill) => {
                                    const ends = endorsements[skill.id] || [];
                                    const st = STATUS[skill.approvalStatus];
                                    return (
                                        <Paper key={skill.id} sx={{ p: 2.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                <Box>
                                                    <Typography variant="h6">{skill.skillName}</Typography>
                                                    <Chip size="small" color={st.color} label={st.label} />
                                                </Box>
                                                <Box>
                                                    <Tooltip title="Edit"><IconButton size="small" aria-label={`Edit ${skill.skillName}`} onClick={() => openForm(skill)}><Edit fontSize="small" /></IconButton></Tooltip>
                                                    <Tooltip title="Remove"><IconButton size="small" color="error" aria-label={`Remove ${skill.skillName}`} onClick={() => handleDelete(skill)}><Delete fontSize="small" /></IconButton></Tooltip>
                                                </Box>
                                            </Box>
                                            {skill.approvalStatus === 'REJECTED' && skill.rejectionReason && (
                                                <Alert severity="error" sx={{ mb: 1.5, py: 0 }}>{skill.rejectionReason}</Alert>
                                            )}
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                <Typography variant="body2" color="text.secondary">Proficiency</Typography>
                                                <Chip size="small" label={LEVEL_LABELS[skill.proficiencyLevel]} color={LEVEL_COLOR[skill.proficiencyLevel]} variant="outlined" />
                                            </Box>
                                            <LinearProgress
                                                variant="determinate" value={(skill.proficiencyLevel / 3) * 100}
                                                color={LEVEL_COLOR[skill.proficiencyLevel] === 'default' ? 'inherit' : LEVEL_COLOR[skill.proficiencyLevel]}
                                                sx={{ height: 8, borderRadius: 4, mb: 1.5 }}
                                            />
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Rating value={skill.interestLevel} max={3} readOnly size="small" aria-label="Interest level" />
                                                <Typography variant="body2" color="text.secondary">{skill.yearsExperience || 0} yrs</Typography>
                                            </Box>
                                            {skill.approvalStatus === 'APPROVED' && (
                                                <Box sx={{ mt: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    <Tooltip title={ends.length ? ends.map((e) => e.endorserName).join(', ') : 'No endorsements yet'}>
                                                        <Chip size="small" icon={<ThumbUp />} label={`${ends.length} endorsement${ends.length === 1 ? '' : 's'}`} variant="outlined" />
                                                    </Tooltip>
                                                    {skill.approvedByName && <Typography variant="caption" color="text.secondary">Approved by {skill.approvedByName}</Typography>}
                                                </Box>
                                            )}
                                        </Paper>
                                    );
                                })}
                            </Box>
                        </Box>
                    ))}
                </>
            )}

            {tab === 1 && (
                <Paper sx={{ p: 3 }}>
                    {history.length === 0 ? <EmptyState title="No history yet" message="Changes to your skills will be recorded here." /> : (
                        <Box>
                            {history.map((h) => (
                                <Box key={h.id} sx={{ display: 'flex', gap: 2, pb: 2, mb: 2, borderBottom: 1, borderColor: 'divider', '&:last-child': { borderBottom: 0, mb: 0, pb: 0 } }}>
                                    <Avatar sx={{ width: 10, height: 10, mt: 1, bgcolor: `${HISTORY_COLOR[h.action]}.main` }}> </Avatar>
                                    <Box>
                                        <Typography>{HISTORY_TEXT[h.action](h, skillName[h.skillId] || 'a skill')}</Typography>
                                        <Typography variant="caption" color="text.secondary">{new Date(h.createdAt).toLocaleString()}</Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}
                </Paper>
            )}

            {tab === 2 && (
                <Paper>
                    {certs.length === 0 ? (
                        <EmptyState icon={<WorkspacePremium sx={{ fontSize: 48, opacity: 0.5 }} />} title="No certifications" message="Add certifications to track their expiry." actionLabel="Add certification" onAction={() => setCertDialog(true)} />
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Certification</TableCell><TableCell>Issuer</TableCell><TableCell>Issued</TableCell><TableCell>Expires</TableCell><TableCell align="right" /></TableRow></TableHead>
                                <TableBody>
                                    {certs.map((c) => {
                                        const left = c.expiryDate ? daysUntil(c.expiryDate) : null;
                                        return (
                                            <TableRow key={c.id} hover>
                                                <TableCell>
                                                    {c.name}
                                                    {c.credentialUrl && <IconButton size="small" component="a" href={c.credentialUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${c.name} credential`}><LinkIcon fontSize="small" /></IconButton>}
                                                </TableCell>
                                                <TableCell>{c.issuer || '—'}</TableCell>
                                                <TableCell>{fmt(c.issuedDate)}</TableCell>
                                                <TableCell>
                                                    {fmt(c.expiryDate)}{' '}
                                                    {left !== null && left < 0 && <Chip size="small" color="error" label="Expired" />}
                                                    {left !== null && left >= 0 && left <= 60 && <Chip size="small" color="warning" label={`${left}d left`} />}
                                                </TableCell>
                                                <TableCell align="right"><IconButton size="small" color="error" aria-label={`Delete ${c.name}`} onClick={() => removeCert(c)}><Delete fontSize="small" /></IconButton></TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>
            )}

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editingSkill ? `Edit ${editingSkill.skillName}` : 'Add skill'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        {!editingSkill && (
                            <TextField select fullWidth label="Skill" value={formData.skillId} margin="normal" required
                                onChange={(e) => setFormData({ ...formData, skillId: e.target.value })}
                                helperText={available.length === 0 ? 'You have already added every skill in the catalog' : ' '}>
                                {available.map((s) => <MenuItem key={s.id} value={s.id}>{s.name} ({s.category.replace('_', ' ')})</MenuItem>)}
                            </TextField>
                        )}
                        <TextField select fullWidth label="Proficiency level" value={formData.proficiencyLevel} margin="normal"
                            onChange={(e) => setFormData({ ...formData, proficiencyLevel: parseInt(e.target.value, 10) })}>
                            {LEVEL_LABELS.slice(1).map((l, i) => <MenuItem key={l} value={i + 1}>{l}</MenuItem>)}
                        </TextField>
                        {editingSkill && formData.proficiencyLevel !== editingSkill.proficiencyLevel && (
                            <Alert severity="info" sx={{ mb: 1 }}>Changing the level sends this skill back to your manager for approval.</Alert>
                        )}
                        <Box sx={{ mt: 2 }}>
                            <Typography gutterBottom>Interest level</Typography>
                            <Rating value={formData.interestLevel} max={3} onChange={(_, v) => setFormData({ ...formData, interestLevel: v || 1 })} />
                        </Box>
                        <TextField fullWidth type="number" label="Years of experience" margin="normal" value={formData.yearsExperience}
                            onChange={(e) => setFormData({ ...formData, yearsExperience: parseFloat(e.target.value) || 0 })}
                            inputProps={{ min: 0, step: 0.5 }} />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={!editingSkill && !formData.skillId}>{editingSkill ? 'Update' : 'Submit'}</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={certDialog} onClose={() => setCertDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Add certification</DialogTitle>
                <DialogContent>
                    <TextField fullWidth margin="normal" required label="Name" value={certForm.name} onChange={(e) => setCertForm({ ...certForm, name: e.target.value })} />
                    <TextField fullWidth margin="normal" label="Issuer" value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} />
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}><TextField fullWidth margin="normal" type="date" label="Issued" InputLabelProps={{ shrink: true }} value={certForm.issuedDate} onChange={(e) => setCertForm({ ...certForm, issuedDate: e.target.value })} /></Grid>
                        <Grid size={{ xs: 6 }}><TextField fullWidth margin="normal" type="date" label="Expires" InputLabelProps={{ shrink: true }} value={certForm.expiryDate} onChange={(e) => setCertForm({ ...certForm, expiryDate: e.target.value })} /></Grid>
                    </Grid>
                    <TextField fullWidth margin="normal" label="Credential URL" value={certForm.credentialUrl} onChange={(e) => setCertForm({ ...certForm, credentialUrl: e.target.value })} />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setCertDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={saveCert} disabled={!certForm.name.trim()}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MySkills;
