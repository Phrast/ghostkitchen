import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LabPage from './pages/LabPage';
import RecipeBookPage from './pages/RecipeBookPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DndProvider backend={HTML5Backend}>
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/lab" element={
                <ProtectedRoute><LabPage /></ProtectedRoute>
              } />
              <Route path="/recipes" element={
                <ProtectedRoute><RecipeBookPage /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/lab" />} />
            </Routes>
          </main>
        </DndProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
