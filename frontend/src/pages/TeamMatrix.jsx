import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    MenuItem,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { employeeSkillsAPI, skillsAPI } from '../services/api';

const TeamMatrix = () => {
    const { user } = useAuth();
    const [teamSkills, setTeamSkills] = useState([]);
    const [allSkills, setAllSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterCategory, setFilterCategory] = useState('ALL');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // For demo, we'll show skills for employees 3 and 4
            const [skillsResponse, emp3Skills, emp4Skills] = await Promise.all([
                skillsAPI.getAll(true),
                employeeSkillsAPI.getByEmployee(3),
                employeeSkillsAPI.getByEmployee(4),
            ]);

            setAllSkills(skillsResponse.data);

            // Combine employee skills
            const combined = [
                { employeeId: 3, employeeName: 'John Doe', skills: emp3Skills.data },
                { employeeId: 4, employeeName: 'Jane Smith', skills: emp4Skills.data },
            ];

            setTeamSkills(combined);
        } catch (err) {
            setError('Failed to load team matrix');
        } finally {
            setLoading(false);
        }
    };

    const getProficiencyLabel = (level) => {
        const labels = ['None', 'Beginner', 'Intermediate', 'Advanced'];
        return labels[level] || '-';
    };

    const getProficiencyColor = (level) => {
        const colors = ['default', 'error', 'warning', 'success'];
        return colors[level] || 'default';
    };

    const getEmployeeSkillLevel = (employeeSkills, skillId) => {
        const skill = employeeSkills.find(s => s.skillId === skillId);
        return skill ? skill.proficiencyLevel : 0;
    };

    const filteredSkills = filterCategory === 'ALL'
        ? allSkills
        : allSkills.filter(s => s.category === filterCategory);

    const categories = ['ALL', ...new Set(allSkills.map(s => s.category))];

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Paper sx={{ p: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" gutterBottom>
                        Team Skill Matrix
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Overview of team members' skills and proficiency levels
                    </Typography>
                </Box>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ mb: 3 }}>
                    <TextField
                        select
                        label="Filter by Category"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        sx={{ minWidth: 200 }}
                    >
                        {categories.map((cat) => (
                            <MenuItem key={cat} value={cat}>
                                {cat}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Skill</strong></TableCell>
                                <TableCell><strong>Category</strong></TableCell>
                                {teamSkills.map((emp) => (
                                    <TableCell key={emp.employeeId} align="center">
                                        <strong>{emp.employeeName}</strong>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredSkills.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={2 + teamSkills.length} align="center">
                                        No skills found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredSkills.map((skill) => (
                                    <TableRow key={skill.id}>
                                        <TableCell>{skill.name}</TableCell>
                                        <TableCell>{skill.category}</TableCell>
                                        {teamSkills.map((emp) => {
                                            const level = getEmployeeSkillLevel(emp.skills, skill.id);
                                            return (
                                                <TableCell key={emp.employeeId} align="center">
                                                    <Chip
                                                        label={getProficiencyLabel(level)}
                                                        color={getProficiencyColor(level)}
                                                        size="small"
                                                    />
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="caption" display="block" gutterBottom>
                        <strong>Legend:</strong>
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Chip label="None" color="default" size="small" />
                        <Chip label="Beginner" color="error" size="small" />
                        <Chip label="Intermediate" color="warning" size="small" />
                        <Chip label="Advanced" color="success" size="small" />
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
};

export default TeamMatrix;
