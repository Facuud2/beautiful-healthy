import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainLayout from './components/layout/MainLayout';
import PatientsList from './components/patients/PatientsList';
import CreatePacienteForm from './components/pacientes/CreatePacienteForm';
import LoginView from './components/LoginSection/LoginView';
import Dashboard from './pages/Dashboard';
import { AuthProvider, useAuth } from './auth/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Register from './components/auth/Register';
import { PropsWithChildren } from 'react';
import Historia from './pages/Historia/HistoriaMain';
import HistoriaClinica from './pages/Historia/HistoriaClinica';
import Tratamientos from './pages/Historia/Tratamientos';
import Profile from './pages/Profile';
import Consultas from './pages/Consultas';
import Mensajeria from './pages/Mensajeria';
import { Toaster } from 'react-hot-toast';
import DeviceSimulator from './components/demo/DeviceSimulator';
import { PatientProvider } from './portal-paciente/context/PatientContext';
import { PatientLoginView } from './portal-paciente/views/PatientLoginView';
import PatientPortalMain from './portal-paciente/PatientPortalMain';
import { LoadingFeedback } from './components/ui/LoadingFeedback';

function PrivateRoute({ children }: PropsWithChildren) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[350px]">
        <LoadingFeedback
          variant="gold"
          message="Accediendo a Beautiful Health Aesthetics..."
          submessage="Preparando agenda, sesiones y canal de acompañamiento..."
        />
      </div>
    );
  }
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal-paciente" replace />} />
      <Route path="/login" element={<LoginView />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <MainLayout>
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/patients"
        element={
          <MainLayout>
            <PrivateRoute>
              <PatientsList />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/patients/new"
        element={
          <MainLayout>
            <PrivateRoute>
              <CreatePacienteForm onSuccess={() => window.location.href = '/patients'} onCancel={() => window.location.href = '/patients'} />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/patients/:id/edit"
        element={
          <MainLayout>
            <PrivateRoute>
              <CreatePacienteForm onSuccess={() => window.location.href = '/patients'} onCancel={() => window.location.href = '/patients'} />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/historia"
        element={
          <MainLayout>
            <Historia />
          </MainLayout>
        }
      />

      <Route
        path="/historia-clinica"
        element={
          <MainLayout>
            <HistoriaClinica />
          </MainLayout>
        }
      />

      <Route
        path="/resultados-analisis"
        element={<Navigate to="/historia" replace />}
      />

      <Route
        path="/tratamientos"
        element={
          <MainLayout>
            <Tratamientos />
          </MainLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <MainLayout>
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/consultas"
        element={
          <MainLayout>
            <PrivateRoute>
              <Consultas />
            </PrivateRoute>
          </MainLayout>
        }
      />
      <Route
        path="/mensajeria"
        element={
          <MainLayout>
            <PrivateRoute>
              <Mensajeria />
            </PrivateRoute>
          </MainLayout>
        }
      />

      {/* Rutas del Portal de Clientas y Pacientes */}
      <Route path="/portal-paciente/login" element={<PatientLoginView />} />
      <Route path="/portal-paciente" element={<PatientPortalMain />} />
      <Route path="/portal-paciente/*" element={<PatientPortalMain />} />

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <PatientProvider>
            <DeviceSimulator>
              <AppRoutes />
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    borderRadius: '14px',
                    background: '#FFFFFF',
                    color: '#2A2421',
                    border: '1px solid #EFE6DF',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 10px 30px -5px rgba(197, 160, 89, 0.14)',
                  },
                  success: {
                    iconTheme: {
                      primary: '#C5A059',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
            </DeviceSimulator>
          </PatientProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
