import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { RootState } from '../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role?: 'admin' | 'client';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  // Si l'utilisateur n'est pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle
  if (role && user?.role !== role) {
    // Rediriger vers le dashboard approprié selon le rôle de l'utilisateur
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;