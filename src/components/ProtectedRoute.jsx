import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token) {
        // Agar token nahi hai toh Login page par bhejo
        return <Navigate to="/login" />;
    }

    if (allowedRole && role !== allowedRole) {
        // Agar role match nahi karta toh access mana kar do
        return <div className="text-center mt-20 font-bold text-red-600">Access Denied: Unauthorized Role</div>;
    }

    return children;
};

export default ProtectedRoute;