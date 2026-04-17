import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import EditorPage from './pages/EditorPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />

          {/* Protected Routes (Paid Member Only) */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute requirePaid>
                <EditorPage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin>
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
