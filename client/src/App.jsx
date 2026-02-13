import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LabPage from './pages/LabPage';
import RecipeBookPage from './pages/RecipeBookPage';
import ServicePage from './pages/ServicePage';
import ShopPage from './pages/ShopPage';
import DashboardPage from './pages/DashboardPage';
import './styles/global.css';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <GameProvider>
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
                  <Route path="/service" element={
                    <ProtectedRoute><ServicePage /></ProtectedRoute>
                  } />
                  <Route path="/shop" element={
                    <ProtectedRoute><ShopPage /></ProtectedRoute>
                  } />
                  <Route path="/dashboard" element={
                    <ProtectedRoute><DashboardPage /></ProtectedRoute>
                  } />
                  <Route path="*" element={<Navigate to="/lab" />} />
                </Routes>
              </main>
            </DndProvider>
          </GameProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
