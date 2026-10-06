import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ColorModeProvider } from './context/ColorModeContext';
import { UiProvider } from './context/UiContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import PageSkeleton from './components/PageSkeleton';
import Login from './pages/Login';

// Route-level code splitting keeps the initial bundle small
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MySkills = lazy(() => import('./pages/MySkills'));
const MyGaps = lazy(() => import('./pages/MyGaps'));
const TeamMatrix = lazy(() => import('./pages/TeamMatrix'));
const RolesProjects = lazy(() => import('./pages/RolesProjects'));
const SkillCatalog = lazy(() => import('./pages/SkillCatalog'));
const LearningResources = lazy(() => import('./pages/LearningResources'));
const EmployeeManagement = lazy(() => import('./pages/EmployeeManagement'));
const Insights = lazy(() => import('./pages/Insights'));
const Profile = lazy(() => import('./pages/Profile'));

const MANAGERS = ['MANAGER', 'HR_ADMIN'];
const HR = ['HR_ADMIN'];

const guard = (element, roles) => <ProtectedRoute roles={roles}>{element}</ProtectedRoute>;

function App() {
    return (
        <ColorModeProvider>
            <UiProvider>
                <AuthProvider>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/"
                                element={
                                    <ProtectedRoute>
                                        <Layout />
                                    </ProtectedRoute>
                                }
                            >
                                <Route index element={<Navigate to="/dashboard" replace />} />
                                <Route
                                    element={
                                        <Suspense fallback={<PageSkeleton />}>
                                            <RouteOutlet />
                                        </Suspense>
                                    }
                                >
                                    <Route path="dashboard" element={<Dashboard />} />
                                    <Route path="my-skills" element={<MySkills />} />
                                    <Route path="my-gaps" element={<MyGaps />} />
                                    <Route path="profile" element={<Profile />} />
                                    <Route path="team-matrix" element={guard(<TeamMatrix />, MANAGERS)} />
                                    <Route path="roles-projects" element={guard(<RolesProjects />, MANAGERS)} />
                                    <Route path="insights" element={guard(<Insights />, HR)} />
                                    <Route path="skill-catalog" element={guard(<SkillCatalog />, HR)} />
                                    <Route path="learning-resources" element={guard(<LearningResources />, HR)} />
                                    <Route path="employee-management" element={guard(<EmployeeManagement />, HR)} />
                                </Route>
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Route>
                        </Routes>
                    </BrowserRouter>
                </AuthProvider>
            </UiProvider>
        </ColorModeProvider>
    );
}

// Thin wrapper so a single Suspense boundary covers every lazy child route
import { Outlet } from 'react-router-dom';
const RouteOutlet = () => <Outlet />;

export default App;
