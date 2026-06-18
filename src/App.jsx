import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import AdminPanel from './pages/AdminPanel'
import AdminLogin from './pages/AdminLogin'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorLogin from './pages/DoctorLogin'
import DoctorProfile from './pages/DoctorProfile'
import HomePage from './pages/HomePage'
import PacienteVerCita from './pages/PacienteVerCita'
import RegistrarPaciente from './pages/RegistrarPaciente'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="relative min-h-screen overflow-x-hidden bg-teal-50 text-slate-900 selection:bg-teal-200 selection:text-teal-950">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.28),_transparent_36%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.18),_transparent_34%)]" />
          <Navbar />
          <main className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-7xl flex-col px-4 py-8 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/doctor/login" element={<DoctorLogin />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/registrar" element={<RegistrarPaciente />} />
              <Route path="/paciente/ver-cita" element={<PacienteVerCita />} />
              <Route
                path="/doctor/perfil"
                element={(
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorProfile />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/doctor/dashboard"
                element={(
                  <ProtectedRoute allowedRole="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                )}
              />
              <Route
                path="/admin"
                element={(
                  <ProtectedRoute allowedRole="admin">
                    <AdminPanel />
                  </ProtectedRoute>
                )}
              />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
