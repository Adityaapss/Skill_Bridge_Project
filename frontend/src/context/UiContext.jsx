/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback, useRef, useMemo } from 'react';
import {
    Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button,
} from '@mui/material';

const UiContext = createContext(null);

/**
 * App-wide toasts and confirmation dialogs, replacing window.alert / window.confirm.
 *   const { toast, confirm } = useUi();
 *   toast.success('Saved');  if (await confirm({ title, message })) { ... }
 */
export const UiProvider = ({ children }) => {
    const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });
    const [dialog, setDialog] = useState(null);
    const resolver = useRef(null);

    const show = useCallback((severity) => (message) => setSnack({ open: true, message, severity }), []);
    const toast = useMemo(() => ({
        success: show('success'), error: show('error'), info: show('info'), warning: show('warning'),
    }), [show]);

    const confirm = useCallback((options) => new Promise((resolve) => {
        resolver.current = resolve;
        setDialog({
            title: 'Are you sure?', confirmText: 'Confirm', cancelText: 'Cancel', destructive: false, ...options,
        });
    }), []);

    const close = (result) => {
        resolver.current?.(result);
        resolver.current = null;
        setDialog(null);
    };

    const value = useMemo(() => ({ toast, confirm }), [toast, confirm]);

    return (
        <UiContext.Provider value={value}>
            {children}
            <Snackbar
                open={snack.open}
                autoHideDuration={4500}
                onClose={(_, reason) => reason !== 'clickaway' && setSnack((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snack.severity} variant="filled" onClose={() => setSnack((s) => ({ ...s, open: false }))}>
                    {snack.message}
                </Alert>
            </Snackbar>
            <Dialog open={Boolean(dialog)} onClose={() => close(false)} maxWidth="xs" fullWidth>
                {dialog && (
                    <>
                        <DialogTitle>{dialog.title}</DialogTitle>
                        <DialogContent><DialogContentText>{dialog.message}</DialogContentText></DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2 }}>
                            <Button onClick={() => close(false)}>{dialog.cancelText}</Button>
                            <Button
                                variant="contained"
                                color={dialog.destructive ? 'error' : 'primary'}
                                onClick={() => close(true)}
                                autoFocus
                            >
                                {dialog.confirmText}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </UiContext.Provider>
    );
};

export const useUi = () => {
    const ctx = useContext(UiContext);
    if (!ctx) throw new Error('useUi must be used within UiProvider');
    return ctx;
};
