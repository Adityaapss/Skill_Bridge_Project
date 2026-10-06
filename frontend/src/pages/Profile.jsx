import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Grid, Chip, Divider, Avatar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useUi } from '../context/UiContext';
import { authAPI } from '../services/api';
import { errorMessage } from '../utils/errors';
import PageHeader from '../components/PageHeader';

const ROLE_LABEL = { EMPLOYEE: 'Employee', MANAGER: 'Manager', HR_ADMIN: 'HR Admin' };

const Profile = () => {
    const { user } = useAuth();
    const { toast } = useUi();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [saving, setSaving] = useState(false);

    const mismatch = form.confirm.length > 0 && form.next !== form.confirm;
    const tooShort = form.next.length > 0 && form.next.length < 8;
    const canSubmit = form.current && form.next.length >= 8 && form.next === form.confirm && !saving;

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authAPI.changePassword(form.current, form.next);
            toast.success('Password updated');
            setForm({ current: '', next: '', confirm: '' });
        } catch (err) {
            toast.error(errorMessage(err, 'Could not change password'));
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box>
            <PageHeader title="Profile" subtitle="Your account details and security settings" />
            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
                                {user.name?.[0]?.toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6">{user.name}</Typography>
                                <Chip size="small" label={ROLE_LABEL[user.role]} color="primary" variant="outlined" />
                            </Box>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        {[['Email', user.email], ['Job title', user.jobTitle], ['Department', user.department]].map(([k, v]) => (
                            <Box key={k} sx={{ mb: 1.5 }}>
                                <Typography variant="caption" color="text.secondary">{k}</Typography>
                                <Typography>{v || '—'}</Typography>
                            </Box>
                        ))}
                    </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper sx={{ p: 3 }} component="form" onSubmit={submit}>
                        <Typography variant="h6" gutterBottom>Change password</Typography>
                        <TextField
                            fullWidth margin="normal" label="Current password" type="password" required
                            autoComplete="current-password" value={form.current}
                            onChange={(e) => setForm({ ...form, current: e.target.value })}
                        />
                        <TextField
                            fullWidth margin="normal" label="New password" type="password" required
                            autoComplete="new-password" value={form.next} error={tooShort}
                            helperText={tooShort ? 'Use at least 8 characters' : ' '}
                            onChange={(e) => setForm({ ...form, next: e.target.value })}
                        />
                        <TextField
                            fullWidth margin="normal" label="Confirm new password" type="password" required
                            autoComplete="new-password" value={form.confirm} error={mismatch}
                            helperText={mismatch ? 'Passwords do not match' : ' '}
                            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                        />
                        <Button type="submit" variant="contained" disabled={!canSubmit} sx={{ mt: 1 }}>
                            {saving ? 'Saving…' : 'Update password'}
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Profile;
