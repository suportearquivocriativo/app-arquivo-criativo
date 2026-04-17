import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute: React.FC<{ children: React.ReactNode; requirePaid?: boolean; requireAdmin?: boolean }> = ({ 
  children, 
  requirePaid = false, 
  requireAdmin = false 
}) => {
  const { user, isPaid, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="flex items-center justify-center h-screen bg-black text-white">Carregando...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requirePaid && !isPaid && !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <p className="text-text-muted mb-8">Seu acesso ainda não foi liberado.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-accent text-black px-6 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity"
        >
          Verificar Novamente
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
