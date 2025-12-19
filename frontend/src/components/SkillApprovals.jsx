import React, { useState, useEffect } from 'react';
import {
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Tooltip,
} from '@mui/material';
import { CheckCircle, Cancel, Info } from '@mui/icons-material';
import { employeeSkillsAPI } from '../services/api';

const SkillApprovals = ({ managerId }) => {
    const [pendingSkills, setPendingSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [rejectDialog, setRejectDialog] = useState({ open: false, skill: null });
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        fetchPendingSkills();
    }, [managerId]);

    const fetchPendingSkills = async () => {
        try {
            setLoading(true);
            const response = await employeeSkillsAPI.getPendingForManager(managerId);
            setPendingSkills(response.data);
            setError('');
        } catch (err) {
            setError('Failed to load pending skill approvals');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (skillId) => {
        try {
            await employeeSkillsAPI.approve(skillId, managerId);
            setSuccess('Skill approved successfully!');
            fetchPendingSkills();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to approve skill');
        }
    };

    const handleOpenRejectDialog = (skill) => {
        setRejectDialog({ open: true, skill });
        setRejectionReason('');
    };

    const handleCloseRejectDialog = () => {
        setRejectDialog({ open: false, skill: null });
        setRejectionReason('');
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        try {
            await employeeSkillsAPI.reject(rejectDialog.skill.id, managerId, rejectionReason);
            setSuccess('Skill rejected');
            handleCloseRejectDialog();
            fetchPendingSkills();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to reject skill');
        }
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || 'Unknown';
    };

    const getProficiencyColor = (level) => {
        const colors = ['default', 'error', 'warning', 'success'];
        return colors[level] || 'default';
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    📋 Skill Approval Requests
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Review and approve skill additions from your team members
                </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {pendingSkills.length === 0 ? (
                <Alert severity="info">
                    No pending skill approvals at this time.
                </Alert>
            ) : (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Employee</TableCell>
                                <TableCell>Skill</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Proficiency</TableCell>
                                <TableCell>Experience</TableCell>
                                <TableCell>Submitted</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pendingSkills.map((skill) => (
                                <TableRow key={skill.id}>
                                    <TableCell>
                                        <Box>
                                            <Typography variant="body2" fontWeight="bold">
                                                {skill.employeeName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {skill.employeeEmail}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {skill.skillName}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={skill.skillCategory} size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getProficiencyLabel(skill.proficiencyLevel)}
                                            color={getProficiencyColor(skill.proficiencyLevel)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {skill.yearsExperience || 0} years
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {new Date(skill.submittedAt).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="center">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                            <Tooltip title="Approve">
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckCircle />}
                                                    onClick={() => handleApprove(skill.id)}
                                                >
                                                    Approve
                                                </Button>
                                            </Tooltip>
                                            <Tooltip title="Reject">
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<Cancel />}
                                                    onClick={() => handleOpenRejectDialog(skill)}
                                                >
                                                    Reject
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Rejection Dialog */}
            <Dialog open={rejectDialog.open} onClose={handleCloseRejectDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Reject Skill Request</DialogTitle>
                <DialogContent>
                    {rejectDialog.skill && (
                        <Box sx={{ pt: 2 }}>
                            <Alert severity="warning" sx={{ mb: 2 }}>
                                You are about to reject <strong>{rejectDialog.skill.employeeName}</strong>'s
                                request to add <strong>{rejectDialog.skill.skillName}</strong>.
                            </Alert>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Reason for Rejection"
                                placeholder="Please provide a clear reason for rejecting this skill..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                required
                                helperText="This reason will be visible to the employee"
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRejectDialog}>Cancel</Button>
                    <Button
                        onClick={handleReject}
                        variant="contained"
                        color="error"
                        disabled={!rejectionReason.trim()}
                    >
                        Reject Skill
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default SkillApprovals;
