import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Badge, IconButton, Popover, Box, Typography, List, ListItemButton, ListItemText, Button, Divider, Tooltip,
} from '@mui/material';
import NotificationsNone from '@mui/icons-material/NotificationsNone';
import { notificationsAPI } from '../services/api';
import EmptyState from './EmptyState';

const POLL_MS = 30000;

const timeAgo = (iso) => {
    const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (secs < 60) return 'just now';
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    if (secs < 86400) return `${Math.floor(secs / 3600)}h ago`;
    return `${Math.floor(secs / 86400)}d ago`;
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [anchor, setAnchor] = useState(null);
    const [count, setCount] = useState(0);
    const [items, setItems] = useState([]);

    const refreshCount = useCallback(async () => {
        try {
            const { data } = await notificationsAPI.unreadCount();
            setCount(data.count);
        } catch { /* a failed poll is not worth interrupting the user */ }
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial sync with the server
        refreshCount();
        const id = setInterval(refreshCount, POLL_MS);
        return () => clearInterval(id);
    }, [refreshCount]);

    const open = async (e) => {
        setAnchor(e.currentTarget);
        try {
            const { data } = await notificationsAPI.list();
            setItems(data);
        } catch { setItems([]); }
    };

    const clickItem = async (n) => {
        setAnchor(null);
        if (!n.read) {
            try { await notificationsAPI.markRead(n.id); } catch { /* ignore */ }
            refreshCount();
        }
        if (n.link) navigate(n.link);
    };

    const markAll = async () => {
        try {
            await notificationsAPI.markAllRead();
            setItems((prev) => prev.map((n) => ({ ...n, read: true })));
            setCount(0);
        } catch { /* ignore */ }
    };

    return (
        <>
            <Tooltip title="Notifications">
                <IconButton color="inherit" onClick={open} aria-label={`Notifications, ${count} unread`}>
                    <Badge badgeContent={count} color="error" max={99}>
                        <NotificationsNone />
                    </Badge>
                </IconButton>
            </Tooltip>
            <Popover
                open={Boolean(anchor)}
                anchorEl={anchor}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Box sx={{ width: 360, maxWidth: '92vw' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
                        <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
                        <Button size="small" onClick={markAll} disabled={count === 0}>Mark all read</Button>
                    </Box>
                    <Divider />
                    {items.length === 0 ? (
                        <EmptyState title="You're all caught up" message="New activity will show up here." />
                    ) : (
                        <List disablePadding sx={{ maxHeight: 420, overflow: 'auto' }}>
                            {items.map((n) => (
                                <ListItemButton key={n.id} onClick={() => clickItem(n)} sx={{ alignItems: 'flex-start', bgcolor: n.read ? 'transparent' : 'action.hover' }}>
                                    <ListItemText
                                        primary={n.message}
                                        secondary={timeAgo(n.createdAt)}
                                        primaryTypographyProps={{ fontSize: 14, fontWeight: n.read ? 400 : 600 }}
                                    />
                                </ListItemButton>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>
        </>
    );
};

export default NotificationBell;
