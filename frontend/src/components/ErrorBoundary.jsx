import React from 'react';
import { Box, Button, Typography } from '@mui/material';

class ErrorBoundary extends React.Component {
    state = { error: null };

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('UI error:', error, info);
    }

    render() {
        if (!this.state.error) return this.props.children;
        return (
            <Box sx={{ textAlign: 'center', py: 10 }}>
                <Typography variant="h5" gutterBottom>Something went wrong</Typography>
                <Typography color="text.secondary" sx={{ mb: 3 }}>
                    This page hit an unexpected error. You can try again or head back to the dashboard.
                </Typography>
                <Button variant="contained" sx={{ mr: 1 }} onClick={() => this.setState({ error: null })}>Try again</Button>
                <Button onClick={() => { window.location.href = '/dashboard'; }}>Dashboard</Button>
            </Box>
        );
    }
}

export default ErrorBoundary;
