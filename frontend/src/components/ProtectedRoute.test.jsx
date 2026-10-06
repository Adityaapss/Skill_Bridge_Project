import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
import { useAuth } from '../context/AuthContext';

const renderAt = (roles) => render(
    <MemoryRouter initialEntries={['/secret']}>
        <Routes>
            <Route path="/secret" element={<ProtectedRoute roles={roles}><div>secret page</div></ProtectedRoute>} />
            <Route path="/dashboard" element={<div>dashboard</div>} />
            <Route path="/login" element={<div>login</div>} />
        </Routes>
    </MemoryRouter>,
);

describe('ProtectedRoute', () => {
    it('sends anonymous users to login', () => {
        useAuth.mockReturnValue({ user: null, loading: false });
        renderAt();
        expect(screen.getByText('login')).toBeInTheDocument();
    });

    it('blocks users without the required role', () => {
        useAuth.mockReturnValue({ user: { role: 'EMPLOYEE' }, loading: false });
        renderAt(['HR_ADMIN']);
        expect(screen.getByText('dashboard')).toBeInTheDocument();
    });

    it('lets permitted roles through', () => {
        useAuth.mockReturnValue({ user: { role: 'HR_ADMIN' }, loading: false });
        renderAt(['HR_ADMIN']);
        expect(screen.getByText('secret page')).toBeInTheDocument();
    });
});
