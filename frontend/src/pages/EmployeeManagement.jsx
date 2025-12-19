import React, { useState, useEffect } from 'react';
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

const EmployeeManagement = () => {
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
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchEmployees();
        fetchManagers();
    }, []);

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
            setError('Failed to load employees');
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
        setError('');
        setSuccess('');
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
        setError('');
    };

    const handleSaveEmployee = async () => {
        // Validation
        if (!formData.name || !formData.email || (!editingEmployee && !formData.password)) {
            setError('Please fill in all required fields');
            return;
        }

        if (!formData.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (!editingEmployee && formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        // Validate manager selection for EMPLOYEE and MANAGER roles
        if ((formData.role === 'EMPLOYEE' || formData.role === 'MANAGER') && !formData.managerId) {
            setError('Please select a manager for this employee');
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
                setSuccess('Employee updated successfully!');
                fetchEmployees(); // Refresh list
            } else {
                // Create new employee
                await employeesAPI.create(dataToSend);
                setSuccess('Employee added successfully!');
                fetchEmployees(); // Refresh list
                fetchManagers(); // Refresh managers list (in case we added a new manager)
            }

            setTimeout(() => {
                handleCloseDialog();
                setSuccess('');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save employee');
        }
    };

    const handleDeleteEmployee = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) {
            return;
        }

        try {
            await employeesAPI.delete(id);
            setEmployees(employees.filter(emp => emp.id !== id));
            setSuccess('Employee deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to delete employee');
            setTimeout(() => setError(''), 3000);
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

    // Check if manager selection should be shown
    const shouldShowManagerSelection = formData.role === 'EMPLOYEE' || formData.role === 'MANAGER';

    return (
        <Container maxWidth="lg">
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">
                            👥 Employee Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Add, edit, and manage employee accounts
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={() => handleOpenDialog()}
                        size="large"
                    >
                        Add Employee
                    </Button>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

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
                            {employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                                            No employees found. Click "Add Employee" to get started.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                employees.map((employee) => (
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
            </Paper>

            {/* Add/Edit Employee Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </Grid>
                            <Grid item xs={12}>
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
                                <Grid item xs={12}>
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
                            <Grid item xs={12}>
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
                                <Grid item xs={12}>
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
                                <Grid item xs={12}>
                                    <Alert severity="info">
                                        HR Admins are top-level and don't report to anyone.
                                    </Alert>
                                </Grid>
                            )}

                            <Grid item xs={12}>
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

                            <Grid item xs={12}>
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

                        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
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
