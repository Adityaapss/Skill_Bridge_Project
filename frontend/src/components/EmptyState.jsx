import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import InboxOutlined from '@mui/icons-material/InboxOutlined';

const EmptyState = ({ title, message, actionLabel, onAction, icon }) => (
    <Box sx={{ textAlign: 'center', py: 6, px: 2, color: 'text.secondary' }}>
        {icon || <InboxOutlined sx={{ fontSize: 48, opacity: 0.5 }} />}
        <Typography variant="subtitle1" color="text.primary" sx={{ mt: 1 }}>{title}</Typography>
        {message && <Typography variant="body2" sx={{ mt: 0.5 }}>{message}</Typography>}
        {actionLabel && (
            <Button variant="outlined" sx={{ mt: 2 }} onClick={onAction}>{actionLabel}</Button>
        )}
    </Box>
);

export default EmptyState;
