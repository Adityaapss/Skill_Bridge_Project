import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

/** Page title with breadcrumb trail and an optional action slot. */
const PageHeader = ({ title, subtitle, crumbs = [], actions }) => (
    <Box sx={{ mb: 3, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
        <Box>
            <Breadcrumbs sx={{ mb: 0.5, fontSize: 13 }}>
                <Link component={RouterLink} underline="hover" color="text.secondary" to="/dashboard">Home</Link>
                {crumbs.map((c) => (
                    c.to
                        ? <Link key={c.label} component={RouterLink} underline="hover" color="text.secondary" to={c.to}>{c.label}</Link>
                        : <Typography key={c.label} color="text.secondary" fontSize={13}>{c.label}</Typography>
                ))}
                <Typography color="text.primary" fontSize={13}>{title}</Typography>
            </Breadcrumbs>
            <Typography variant="h4" component="h1">{title}</Typography>
            {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Box>
        {actions && <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>{actions}</Box>}
    </Box>
);

export default PageHeader;
