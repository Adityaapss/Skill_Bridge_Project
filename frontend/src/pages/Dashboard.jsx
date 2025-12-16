import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Paper,
    Typography,
    Box,
    Card,
    CardContent,
    CardActions,
    Button,
} from '@mui/material';
import {
    Person,
    School,
    Assessment,
    TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const employeeCards = [
        {
            title: 'My Skills',
            description: 'View and manage your skill profile',
            icon: <Person sx={{ fontSize: 40 }} />,
            color: '#1976d2',
            path: '/my-skills',
        },
        {
            title: 'Skill Gaps',
            description: 'Analyze your skills against target roles',
            icon: <Assessment sx={{ fontSize: 40 }} />,
            color: '#ed6c02',
            path: '/my-gaps',
        },
        {
            title: 'Learning Recommendations',
            description: 'Get personalized learning suggestions',
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#2e7d32',
            path: '/recommendations',
        },
    ];

    const managerCards = [
        {
            title: 'Team Matrix',
            description: 'View team skill coverage',
            icon: <TrendingUp sx={{ fontSize: 40 }} />,
            color: '#9c27b0',
            path: '/team-matrix',
        },
        {
            title: 'Roles & Projects',
            description: 'Manage role requirements',
            icon: <Assessment sx={{ fontSize: 40 }} />,
            color: '#0288d1',
            path: '/roles-projects',
        },
    ];

    const hrCards = [
        {
            title: 'Skill Catalog',
            description: 'Manage organization skills',
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#d32f2f',
            path: '/skill-catalog',
        },
        {
            title: 'Learning Resources',
            description: 'Manage learning materials',
            icon: <School sx={{ fontSize: 40 }} />,
            color: '#388e3c',
            path: '/learning-resources',
        },
    ];

    const getCards = () => {
        let cards = [...employeeCards];
        if (user.role === 'MANAGER' || user.role === 'HR_ADMIN') {
            cards = [...cards, ...managerCards];
        }
        if (user.role === 'HR_ADMIN') {
            cards = [...cards, ...hrCards];
        }
        return cards;
    };

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h4" gutterBottom>
                    Welcome, {user.name}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Role: {user.role.replace('_', ' ')} | Department: {user.department || 'N/A'}
                </Typography>
            </Paper>

            <Grid container spacing={3}>
                {getCards().map((card, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                                    <Box sx={{ color: card.color }}>
                                        {card.icon}
                                    </Box>
                                </Box>
                                <Typography variant="h6" component="h2" gutterBottom align="center">
                                    {card.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" align="center">
                                    {card.description}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'center', pb: 2 }}>
                                <Button
                                    variant="contained"
                                    onClick={() => navigate(card.path)}
                                    sx={{ bgcolor: card.color }}
                                >
                                    Open
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default Dashboard;
