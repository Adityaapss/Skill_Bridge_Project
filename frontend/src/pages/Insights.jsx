import React, { useEffect, useState } from 'react';
import {
    Box, Grid, Paper, Typography, Table, TableHead, TableRow, TableCell, TableBody, Chip, Alert, TableContainer,
    Tabs, Tab, Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { insightsAPI, certificationsAPI, employeesAPI } from '../services/api';
import { useUi } from '../context/UiContext';
import { errorMessage } from '../utils/errors';
import { downloadBlob } from '../utils/download';
import PageHeader from '../components/PageHeader';
import PageSkeleton from '../components/PageSkeleton';
import EmptyState from '../components/EmptyState';
import useTablePagination from '../hooks/useTablePagination';
import { TablePagination } from '@mui/material';

const Stat = ({ label, value, hint }) => (
    <Paper sx={{ p: 2.5 }}>
        <Typography variant="body2" color="text.secondary">{label}</Typography>
        <Typography variant="h4">{value}</Typography>
        {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </Paper>
);

const pretty = (s) => s.replace('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());

const Insights = () => {
    const theme = useTheme();
    const { toast } = useUi();
    const [summary, setSummary] = useState(null);
    const [busFactor, setBusFactor] = useState([]);
    const [supply, setSupply] = useState([]);
    const [expiring, setExpiring] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);
    const busPaging = useTablePagination(busFactor, 10);

    useEffect(() => {
        (async () => {
            try {
                const [s, b, d, c] = await Promise.all([
                    insightsAPI.summary(), insightsAPI.busFactor(), insightsAPI.supplyDemand(), certificationsAPI.expiring(),
                ]);
                setSummary(s.data); setBusFactor(b.data); setSupply(d.data); setExpiring(c.data);
            } catch (err) {
                toast.error(errorMessage(err, 'Failed to load insights'));
            } finally {
                setLoading(false);
            }
        })();
    }, [toast]);

    const exportMatrix = async () => {
        try {
            const res = await employeesAPI.exportSkillMatrix();
            downloadBlob(res.data, 'skill-matrix.csv');
        } catch (err) {
            toast.error(errorMessage(err, 'Export failed'));
        }
    };

    if (loading) return <PageSkeleton />;
    if (!summary) return <Alert severity="error">Insights are unavailable right now.</Alert>;

    const critical = busFactor.filter((b) => b.requiredByActiveWork);
    const catData = summary.categories.map((c) => ({ name: pretty(c.category), Holders: c.holders, 'Avg level': c.avgLevel }));
    const sdData = supply.slice(0, 10).map((s) => ({ name: s.skillName, Demand: s.demand, Qualified: s.qualified }));

    return (
        <Box>
            <PageHeader
                title="Organisation insights"
                subtitle="Where skills are strong, where they are thin, and where demand outpaces supply"
                actions={<Button variant="outlined" onClick={exportMatrix}>Export skill matrix (CSV)</Button>}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}><Stat label="Employees" value={summary.employees} /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><Stat label="Active skills" value={summary.activeSkills} /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><Stat label="Approved skill records" value={summary.approvedSkillRecords} /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><Stat label="Pending approvals" value={summary.pendingApprovals} hint={summary.pendingApprovals ? 'Waiting on managers' : 'Nothing waiting'} /></Grid>
            </Grid>

            {critical.length > 0 && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    <strong>{critical.length}</strong> skill{critical.length > 1 ? 's' : ''} needed by active roles/projects {critical.length > 1 ? 'are' : 'is'} held by one person or nobody:{' '}
                    {critical.slice(0, 4).map((c) => c.skillName).join(', ')}{critical.length > 4 ? '…' : ''}
                </Alert>
            )}

            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Typography variant="h6" gutterBottom>Coverage by category</Typography>
                        <Box sx={{ height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={catData} margin={{ left: -15, right: -10 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                    <XAxis dataKey="name" tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                    <YAxis yAxisId="people" allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                    <YAxis yAxisId="level" orientation="right" domain={[0, 3]} tickCount={4} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                    <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                                    <Legend />
                                    <Bar yAxisId="people" name="People with the skill" dataKey="Holders" fill={theme.palette.primary.main} radius={[6, 6, 0, 0]} />
                                    <Bar yAxisId="level" name="Avg level (0–3)" dataKey="Avg level" fill={theme.palette.secondary.main} radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 2.5 }}>
                        <Typography variant="h6" gutterBottom>Demand vs qualified people</Typography>
                        {sdData.length === 0 ? (
                            <EmptyState title="No demand yet" message="Add skill requirements to active roles or projects." />
                        ) : (
                            <Box sx={{ height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={sdData} layout="vertical" margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                                        <XAxis type="number" allowDecimals={false} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                        <YAxis type="category" dataKey="name" width={110} tick={{ fill: theme.palette.text.secondary, fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}` }} />
                                        <Legend />
                                        <Bar dataKey="Demand" fill={theme.palette.warning.main} radius={[0, 6, 6, 0]} />
                                        <Bar dataKey="Qualified" fill={theme.palette.success.main} radius={[0, 6, 6, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </Box>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }} variant="scrollable">
                    <Tab label={`Bus factor (${busFactor.length})`} />
                    <Tab label={`Departments (${summary.departments.length})`} />
                    <Tab label={`Expiring certifications (${expiring.length})`} />
                </Tabs>

                {tab === 0 && (busFactor.length === 0 ? (
                    <EmptyState title="No single points of failure" message="Every active skill has at least two people at Intermediate or above." />
                ) : (
                    <>
                        <TableContainer>
                            <Table size="small">
                                <TableHead><TableRow><TableCell>Skill</TableCell><TableCell>Category</TableCell><TableCell>Holders (Intermediate+)</TableCell><TableCell>Needed by active work</TableCell></TableRow></TableHead>
                                <TableBody>
                                    {busPaging.pageRows.map((b) => (
                                        <TableRow key={b.skillId} hover>
                                            <TableCell>{b.skillName}</TableCell>
                                            <TableCell>{pretty(b.category)}</TableCell>
                                            <TableCell>{b.holders === 0 ? <Chip size="small" color="error" label="Nobody" /> : b.holderNames.join(', ')}</TableCell>
                                            <TableCell>{b.requiredByActiveWork ? <Chip size="small" color="warning" label="Yes" /> : '—'}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination {...busPaging.props} />
                    </>
                ))}

                {tab === 1 && (
                    <TableContainer>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>Department</TableCell><TableCell align="right">Employees</TableCell><TableCell align="right">Approved skills</TableCell><TableCell align="right">Avg level (0–3)</TableCell></TableRow></TableHead>
                            <TableBody>
                                {summary.departments.map((d) => (
                                    <TableRow key={d.department} hover>
                                        <TableCell>{d.department}</TableCell>
                                        <TableCell align="right">{d.employees}</TableCell>
                                        <TableCell align="right">{d.approvedSkills}</TableCell>
                                        <TableCell align="right">{d.avgLevel.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tab === 2 && (expiring.length === 0 ? (
                    <EmptyState title="Nothing expiring soon" message="No certification expires in the next 60 days." />
                ) : (
                    <TableContainer>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>Certification</TableCell><TableCell>Issuer</TableCell><TableCell>Employee ID</TableCell><TableCell>Expires</TableCell></TableRow></TableHead>
                            <TableBody>
                                {expiring.map((c) => (
                                    <TableRow key={c.id} hover>
                                        <TableCell>{c.name}</TableCell><TableCell>{c.issuer || '—'}</TableCell>
                                        <TableCell>{c.employeeId}</TableCell><TableCell>{c.expiryDate}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                ))}
            </Paper>
        </Box>
    );
};

export default Insights;
