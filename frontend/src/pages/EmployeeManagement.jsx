import { useUi } from '../context/UiContext';
import { errorMessage } from '../utils/errors';
import PageSkeleton from '../components/PageSkeleton';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Alert,
    MenuItem,
    Grid,
    Autocomplete,
    TablePagination,
    InputAdornment,
    Tooltip,
    DialogContentText,
} from '@mui/material';
import {
    Add,
    Edit,
    Delete,
    Person,
    Email,
    Work,
} from '@mui/icons-material';
import { employeesAPI } from '../services/api';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import useTablePagination from '../hooks/useTablePagination';
import { downloadBlob } from '../utils/download';

const EmployeeManagement = () => {
    const { toast, confirm } = useUi();
    const [employees, setEmployees] = useState([]);
    const [managers, setManagers] = useState([]); // List of managers and HR for selection
    const [departments, setDepartments] = useState([]); // List of unique departments
    const [openDialog, setOpenDialog] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        department: '',
        jobTitle: '',
        managerId: '', // Added managerId
    });


    const fetchEmployees = async () => {
        try {
            const response = await employeesAPI.getAll();
            setEmployees(response.data);

            // Extract unique departments
            const uniqueDepartments = [...new Set(
                response.data
                    .map(emp => emp.department)
                    .filter(dept => dept && dept.trim() !== '')
            )].sort();
            setDepartments(uniqueDepartments);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
            toast.error('Failed to load employees');
        }
    };

    const fetchManagers = async () => {
        try {
            const response = await employeesAPI.getAll();
            // Filter for MANAGER and HR_ADMIN roles
            const managerList = response.data.filter(
                emp => emp.role === 'MANAGER' || emp.role === 'HR_ADMIN'
            );
            setManagers(managerList);
        } catch (err) {
            console.error('Failed to fetch managers:', err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchManagers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleOpenDialog = (employee = null) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                name: employee.name,
                email: employee.email,
                password: '', // Don't populate password for editing
                role: employee.role,
                department: employee.department || '',
                jobTitle: employee.jobTitle || '',
                managerId: employee.managerId || '',
            });
        } else {
            setEditingEmployee(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                role: 'EMPLOYEE',
                department: '',
                jobTitle: '',
                managerId: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingEmployee(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            role: 'EMPLOYEE',
            department: '',
            jobTitle: '',
            managerId: '',
        });
    };

    const handleSaveEmployee = async () => {
        // Validation
        if (!formData.name || !formData.email || (!editingEmployee && !formData.password)) {
            toast.error('Please fill in all required fields');
            return;
        }

        if (!formData.email.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        if (!editingEmployee && formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        // Validate manager selection for EMPLOYEE and MANAGER roles
        if ((formData.role === 'EMPLOYEE' || formData.role === 'MANAGER') && !formData.managerId) {
            toast.error('Please select a manager for this employee');
            return;
        }

        try {
            const dataToSend = { ...formData };

            // If role is HR_ADMIN, set managerId to null
            if (formData.role === 'HR_ADMIN') {
                dataToSend.managerId = null;
            }

            if (editingEmployee) {
                // Update employee
                await employeesAPI.update(editingEmployee.id, dataToSend);
                toast.success('Employee updated successfully!');
                fetchEmployees(); // Refresh list
            } else {
                // Create new employee
                await employeesAPI.create(dataToSend);
                toast.success('Employee added successfully!');
                fetchEmployees(); // Refresh list
                fetchManagers(); // Refresh managers list (in case we added a new manager)
            }

            setTimeout(() => {
                handleCloseDialog();
            }, 2000);
        } catch (err) {
            toast.error(errorMessage(err, 'Failed to save employee'));
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!(await confirm({ title: 'Please confirm', message: 'Are you sure you want to delete this employee?', confirmText: 'Confirm', destructive: true }))) {
            return;
        }

        try {
            await employeesAPI.delete(id);
            setEmployees(employees.filter(emp => emp.id !== id));
            toast.success('Employee deleted successfully!');
        } catch {
            toast.error('Failed to delete employee');
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'HR_ADMIN':
                return 'error';
            case 'MANAGER':
                return 'warning';
            case 'EMPLOYEE':
                return 'success';
            default:
                return 'default';
        }
    };

    const getRoleLabel = (role) => {
        return role.replace('_', ' ');
    };

    const getManagerName = (managerId) => {
        const manager = employees.find(emp => emp.id === managerId);
        return manager ? manager.name : 'N/A';
    };

    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [importResult, setImportResult] = useState(null);
    const [importing, setImporting] = useState(false);
    const fileInput = useRef(null);

    const visible = useMemo(() => {
        const q = query.trim().toLowerCase();
        return employees.filter((e) =>
            (roleFilter === 'ALL' || e.role === roleFilter) &&
            (!q || [e.name, e.email, e.jobTitle, e.department].some((v) => v && v.toLowerCase().includes(q))));
    }, [employees, query, roleFilter]);
    const paging = useTablePagination(visible, 10);

    const handleImport = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        setImporting(true);
        try {
            const { data } = await employeesAPI.importCsv(file);
            setImportResult(data);
            if (data.created > 0) fetchEmployees();
        } catch (err) {
            toast.error(errorMessage(err, 'Import failed'));
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = () => downloadBlob(
        new Blob(['name,email,role,jobTitle,department,managerEmail,password\nJane Doe,jane.doe@example.com,EMPLOYEE,Developer,Engineering,manager@skillbridge.com,ChangeMe123\n'], { type: 'text/csv' }),
        'employee-import-template.csv');

    // Check if manager selection should be shown
    const shouldShowManagerSelection = formData.role === 'EMPLOYEE' || formData.role === 'MANAGER';

    return (
        <Container maxWidth="lg">
            <PageHeader
                title="Employee management"
                subtitle="Add, edit and import employee accounts"
                actions={<>
                    <Tooltip title="CSV columns: name, email, role, jobTitle, department, managerEmail, password">
                        <Button variant="outlined" onClick={downloadTemplate}>CSV template</Button>
                    </Tooltip>
                    <Button variant="outlined" onClick={() => fileInput.current?.click()} disabled={importing}>{importing ? 'Importing…' : 'Import CSV'}</Button>
                    <input ref={fileInput} type="file" accept=".csv,text/csv" hidden onChange={handleImport} />
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>Add employee</Button>
                </>}
            />
            <Paper sx={{ mb: 3 }}>
                <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <TextField size="small" placeholder="Search name, email, title, department" value={query}
                        onChange={(e) => setQuery(e.target.value)} sx={{ minWidth: 300 }} inputProps={{ 'aria-label': 'Search employees' }} />
                    <TextField select size="small" label="Role" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 160 }}>
                        <MenuItem value="ALL">All roles</MenuItem>
                        <MenuItem value="EMPLOYEE">Employee</MenuItem>
                        <MenuItem value="MANAGER">Manager</MenuItem>
                        <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
                    </TextField>
                </Box>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Name</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Job Title</strong></TableCell>
                                <TableCell><strong>Role</strong></TableCell>
                                <TableCell><strong>Department</strong></TableCell>
                                <TableCell><strong>Reports To</strong></TableCell>
                                <TableCell align="right"><strong>Actions</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {visible.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <EmptyState
                                            title={employees.length === 0 ? 'No employees yet' : 'No employees match'}
                                            message={employees.length === 0 ? 'Add one, or import a CSV.' : 'Try a different search or role.'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paging.pageRows.map((employee) => (
                                    <TableRow key={employee.id} hover>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Person fontSize="small" color="action" />
                                                {employee.name}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Email fontSize="small" color="action" />
                                                {employee.email}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Work fontSize="small" color="action" />
                                                {employee.jobTitle || 'Not Set'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={getRoleLabel(employee.role)}
                                                color={getRoleColor(employee.role)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Work fontSize="small" color="action" />
                                                {employee.department || 'N/A'}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            {employee.managerId ? getManagerName(employee.managerId) : '-'}
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton
                                                size="small"
                                                color="primary"
                                                onClick={() => handleOpenDialog(employee)}
                                            >
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                color="error"
                                                onClick={() => handleDeleteEmployee(employee.id)}
                                            >
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination {...paging.props} />
            </Paper>

            <Dialog open={Boolean(importResult)} onClose={() => setImportResult(null)} fullWidth maxWidth="sm">
                <DialogTitle>Import finished</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 1 }}>
                        <strong>{importResult?.created}</strong> created, <strong>{importResult?.skipped}</strong> skipped.
                    </DialogContentText>
                    {importResult?.errors?.length > 0 && (
                        <Alert severity="warning" sx={{ maxHeight: 220, overflow: 'auto' }}>
                            {importResult.errors.map((m) => <div key={m}>{m}</div>)}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions><Button onClick={() => setImportResult(null)}>Done</Button></DialogActions>
            </Dialog>

            {/* Add/Edit Employee Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </Grid>
                            {!editingEmployee && (
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        helperText="Minimum 6 characters"
                                    />
                                </Grid>
                            )}
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value, managerId: '' })}
                                    required
                                >
                                    <MenuItem value="EMPLOYEE">Employee</MenuItem>
                                    <MenuItem value="MANAGER">Manager</MenuItem>
                                    <MenuItem value="HR_ADMIN">HR Admin</MenuItem>
                                </TextField>
                            </Grid>

                            {/* Conditional Manager Selection */}
                            {shouldShowManagerSelection && (
                                <Grid size={{ xs: 12 }}>
                                    <TextField
                                        select
                                        fullWidth
                                        label="Reports To (Manager)"
                                        value={formData.managerId}
                                        onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
                                        required
                                        helperText={
                                            formData.role === 'EMPLOYEE'
                                                ? "Select the manager this employee reports to"
                                                : "Select the HR/Senior Manager this manager reports to"
                                        }
                                    >
                                        {managers.length === 0 ? (
                                            <MenuItem disabled>No managers available</MenuItem>
                                        ) : (
                                            managers.map((manager) => (
                                                <MenuItem key={manager.id} value={manager.id}>
                                                    {manager.name} ({getRoleLabel(manager.role)}) - {manager.department}
                                                </MenuItem>
                                            ))
                                        )}
                                    </TextField>
                                </Grid>
                            )}

                            {formData.role === 'HR_ADMIN' && (
                                <Grid size={{ xs: 12 }}>
                                    <Alert severity="info">
                                        HR Admins are top-level and don't report to anyone.
                                    </Alert>
                                </Grid>
                            )}

                            <Grid size={{ xs: 12 }}>
                                <Autocomplete
                                    freeSolo
                                    options={departments}
                                    value={formData.department}
                                    onChange={(event, newValue) => {
                                        setFormData({ ...formData, department: newValue || '' });
                                    }}
                                    onInputChange={(event, newInputValue) => {
                                        setFormData({ ...formData, department: newInputValue });
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Department"
                                            placeholder="Select or type a department"
                                            helperText="Choose from existing departments or type a new one"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth
                                    label="Job Title"
                                    value={formData.jobTitle}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    placeholder="e.g., Senior Software Engineer, Product Manager"
                                    helperText="Specific job title/position"
                                />
                            </Grid>
                        </Grid>

                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSaveEmployee} variant="contained">
                        {editingEmployee ? 'Update' : 'Add'} Employee
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default EmployeeManagement;
