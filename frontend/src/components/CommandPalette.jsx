import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog, TextField, List, ListItemButton, ListItemIcon, ListItemText, InputAdornment, Typography, Box,
} from '@mui/material';
import Search from '@mui/icons-material/Search';
import ArrowForward from '@mui/icons-material/ArrowForward';

/**
 * ⌘K / Ctrl+K quick navigation. `items` are { text, path, icon, group? }.
 */
const PaletteBody = ({ onClose, items }) => {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [index, setIndex] = useState(0);
    const listRef = useRef(null);

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter((i) => !q || i.text.toLowerCase().includes(q) || (i.keywords || '').includes(q));
    }, [items, query]);

    const onQuery = (value) => { setQuery(value); setIndex(0); };
    useEffect(() => {
        listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: 'nearest' });
    }, [index]);

    const go = (item) => {
        if (!item) return;
        onClose();
        navigate(item.path);
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)); }
        else if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)); }
        else if (e.key === 'Enter') { e.preventDefault(); go(results[index]); }
    };

    return (
        <>
            <TextField
                autoFocus
                fullWidth
                placeholder="Jump to a page…"
                value={query}
                onChange={(e) => onQuery(e.target.value)}
                onKeyDown={onKeyDown}
                inputProps={{ 'aria-label': 'Search pages' }}
                InputProps={{
                    startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                    sx: { p: 1, '& fieldset': { border: 'none' } },
                }}
            />
            <List ref={listRef} sx={{ maxHeight: 340, overflow: 'auto', pt: 0 }}>
                {results.length === 0 && (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">No matches</Typography>
                    </Box>
                )}
                {results.map((item, i) => (
                    <ListItemButton
                        key={item.path + item.text}
                        selected={i === index}
                        data-active={i === index}
                        onClick={() => go(item)}
                        onMouseMove={() => setIndex(i)}
                    >
                        <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                        {i === index && <ArrowForward fontSize="small" color="action" />}
                    </ListItemButton>
                ))}
            </List>
        </>
    );
};

const CommandPalette = ({ open, onClose, items }) => (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { position: 'absolute', top: '12%' } }}>
        <PaletteBody onClose={onClose} items={items} />
    </Dialog>
);

export default CommandPalette;
