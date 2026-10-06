import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, IconButton, InputAdornment, Link,
} from '@mui/material';
import { Login as LoginIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

// Demo credentials are only shown in the dev server, never in a production build
const DEMO_ACCOUNTS = [
    ['Employee', 'employee@skillbridge.com', 'employee123'],
    ['Manager', 'manager@skillbridge.com', 'manager123'],
    ['HR Admin', 'admin@skillbridge.com', 'admin123'],
];

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error);
        }
        setLoading(false);
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', py: 4 }}>
                <Paper sx={{ p: { xs: 3, sm: 5 }, width: '100%' }}>
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
                            Skill<Box component="span" sx={{ color: 'primary.main' }}>Bridge</Box>
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Employee Skill Matrix & Learning Recommender
                        </Typography>
                    </Box>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth label="Email" type="email" value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal" required autoFocus autoComplete="username"
                        />
                        <TextField
                            fullWidth label="Password" type={showPassword ? 'text' : 'password'} value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal" required autoComplete="current-password"
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                            onClick={() => setShowPassword((s) => !s)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <Box sx={{ textAlign: 'right', mt: 0.5 }}>
                            <Link component="button" type="button" variant="body2" onClick={() => setShowForgot((s) => !s)}>
                                Forgot password?
                            </Link>
                        </Box>
                        {showForgot && (
                            <Alert severity="info" sx={{ mt: 1 }}>
                                Password resets are handled by your HR administrator. Ask them to set a new password
                                for you, then change it from your profile after signing in.
                            </Alert>
                        )}
                        <Button
                            fullWidth type="submit" variant="contained" size="large" disabled={loading}
                            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
                            sx={{ mt: 3, mb: 1 }}
                        >
                            {loading ? 'Signing in…' : 'Sign in'}
                        </Button>
                    </form>

                    {import.meta.env.DEV && (
                        <Box sx={{ mt: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
                            <Typography variant="caption" display="block" gutterBottom fontWeight={700}>
                                Demo accounts (dev only) — click to fill
                            </Typography>
                            {DEMO_ACCOUNTS.map(([label, e, p]) => (
                                <Link
                                    key={e} component="button" type="button" variant="caption" underline="hover"
                                    sx={{ display: 'block', textAlign: 'left' }}
                                    onClick={() => { setEmail(e); setPassword(p); }}
                                >
                                    {label}: {e}
                                </Link>
                            ))}
                        </Box>
                    )}
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;
