/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../theme';

const ColorModeContext = createContext({ mode: 'light', toggle: () => { } });

const initialMode = () => {
    try {
        const saved = localStorage.getItem('colorMode');
        if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage unavailable */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ColorModeProvider = ({ children }) => {
    const [mode, setMode] = useState(initialMode);
    const toggle = useCallback(() => {
        setMode((m) => {
            const next = m === 'light' ? 'dark' : 'light';
            try { localStorage.setItem('colorMode', next); } catch { /* ignore */ }
            return next;
        });
    }, []);
    const theme = useMemo(() => getTheme(mode), [mode]);
    const value = useMemo(() => ({ mode, toggle }), [mode, toggle]);
    return (
        <ColorModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
};

export const useColorMode = () => useContext(ColorModeContext);
