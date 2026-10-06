import { createTheme } from '@mui/material';

export const getTheme = (mode) =>
    createTheme({
        palette: {
            mode,
            primary: { main: mode === 'dark' ? '#8ab4ff' : '#3157d5' },
            secondary: { main: '#0fa3a3' },
            success: { main: '#2e9e6a' },
            warning: { main: '#e0922f' },
            error: { main: '#d6455d' },
            background:
                mode === 'dark'
                    ? { default: '#0f1422', paper: '#171d30' }
                    : { default: '#f4f6fb', paper: '#ffffff' },
        },
        shape: { borderRadius: 12 },
        typography: {
            fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            h4: { fontWeight: 700 },
            h5: { fontWeight: 700 },
            h6: { fontWeight: 600 },
            button: { textTransform: 'none', fontWeight: 600 },
        },
        components: {
            MuiPaper: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: ({ theme }) => ({
                        border: `1px solid ${theme.palette.divider}`,
                        backgroundImage: 'none',
                    }),
                },
            },
            MuiCard: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: ({ theme }) => ({ border: `1px solid ${theme.palette.divider}` }),
                },
            },
            MuiAppBar: {
                defaultProps: { elevation: 0 },
                styleOverrides: {
                    root: ({ theme }) => ({
                        backgroundColor: theme.palette.background.paper,
                        color: theme.palette.text.primary,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        backgroundImage: 'none',
                    }),
                },
            },
            MuiDrawer: {
                styleOverrides: { paper: ({ theme }) => ({ borderRight: `1px solid ${theme.palette.divider}` }) },
            },
            MuiButton: { defaultProps: { disableElevation: true } },
            MuiTableCell: {
                styleOverrides: {
                    head: ({ theme }) => ({
                        fontWeight: 700,
                        backgroundColor: theme.palette.action.hover,
                    }),
                },
            },
            MuiDialog: { styleOverrides: { paper: { borderRadius: 16 } } },
        },
    });

/** Heatmap colours for proficiency 0-3, readable in both modes. */
export const levelColor = (level, mode = 'light') => {
    const light = ['#eceff4', '#cfe3ff', '#7fb2f5', '#2f6fd6'];
    const dark = ['#232a40', '#2a4a7a', '#3b72c4', '#6aa3ff'];
    return (mode === 'dark' ? dark : light)[Math.max(0, Math.min(3, level || 0))];
};

export const LEVEL_LABELS = ['None', 'Beginner', 'Intermediate', 'Advanced'];
