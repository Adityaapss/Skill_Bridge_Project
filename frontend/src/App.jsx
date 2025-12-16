import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MySkills from './pages/MySkills';
import MyGaps from './pages/MyGaps';
import Recommendations from './pages/Recommendations';
import TeamMatrix from './pages/TeamMatrix';
import RolesProjects from './pages/RolesProjects';
import SkillCatalog from './pages/SkillCatalog';
import LearningResources from './pages/LearningResources';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
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
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="my-skills" element={<MySkills />} />
              <Route path="my-gaps" element={<MyGaps />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="team-matrix" element={<TeamMatrix />} />
              <Route path="roles-projects" element={<RolesProjects />} />
              <Route path="skill-catalog" element={<SkillCatalog />} />
              <Route path="learning-resources" element={<LearningResources />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
