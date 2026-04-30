// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'
import { PetProvider } from './context/PetContext'
import { HealthProvider } from './context/HealthContext'

// Layout
import Layout from './components/layout/Layout'

// Pages - Public
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Dashboard
import OwnerDashboard from './pages/dashboard/OwnerDashboard'
import VetDashboard from './pages/dashboard/VetDashboard'
import AdminDashboard from './pages/dashboard/AdminDashboard'

// Pets
import MyPets from './pages/pets/MyPets'
import AddPet from './pages/pets/AddPet'
import PetDetails from './pages/pets/PetDetails'
import EditPet from './pages/pets/EditPet'

// Health
import HealthPassport from './pages/health/HealthPassport'
import MedicalHistory from './pages/health/MedicalHistory'
import AddRecord from './pages/health/AddRecord'
import Vaccinations from './pages/health/Vaccinations'

// AI Scan
import ScanPage from './pages/ai-scan/ScanPage'
import ScanHistory from './pages/ai-scan/ScanHistory'

// Vet Connect
import FindVet from './pages/vet-connect/FindVet'
import VetProfile from './pages/vet-connect/VetProfile'
import Appointments from './pages/vet-connect/Appointments'
import VetAppointments from './pages/vet-connect/VetAppointments'

// QR
import QRManagement from './pages/qr/QRManagement'
import PublicPetProfile from './pages/qr/PublicPetProfile'

// Community
import CommunityHome from './pages/community/CommunityHome'
import CreatePost from './pages/community/CreatePost'
import EditPost from './pages/community/EditPost'
import PostDetails from './pages/community/PostDetails'

// Admin
import Users from './pages/admin/Users'
import ContentModeration from './pages/admin/ContentModeration'
import VetClinics from './pages/admin/VetClinics'

// Profile
import UserProfile from './pages/profile/UserProfile'
import Settings from './pages/profile/Settings'

// Components
import ChatBot from './components/chat/ChatBot'
import LoadingSpinner from './components/common/LoadingSpinner'

// ─── Protected Route ────────────────────────────────────────────────────────
// Checks authentication + optional role restriction
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  // Show spinner while auth state is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner size="xl" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Authenticating...
          </p>
        </div>
      </div>
    )
  }

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Logged in but wrong role → redirect to their dashboard
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(
      `Access denied. User role: ${user?.role}, Required: ${allowedRoles.join(', ')}`
    )
    // Redirect to role-appropriate dashboard
    if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />
    if (user?.role === 'VET') return <Navigate to="/vet-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ─── Role Route ─────────────────────────────────────────────────────────────
// Only checks role (used inside already-protected routes)
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(
      `Access denied. User role: ${user?.role}, Required: ${allowedRoles.join(', ')}`
    )
    if (user?.role === 'ADMIN') return <Navigate to="/admin-dashboard" replace />
    if (user?.role === 'VET') return <Navigate to="/vet-dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// ─── App ────────────────────────────────────────────────────────────────────
function App() {
  const { isAuthenticated } = useAuth()

  return (
    <PetProvider>
      <HealthProvider>
        {/* ── Toast Notifications ─────────────────────────────────── */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
            },
            success: {
              style: {
                background: '#f0fdf4',
                color: '#166534',
                border: '1px solid #bbf7d0',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #fecaca',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
            loading: {
              style: {
                background: '#eff6ff',
                color: '#1e40af',
                border: '1px solid #bfdbfe',
              },
            },
          }}
        />

        <Routes>
          {/* ── Public Routes ──────────────────────────────────────── */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Public QR Profile - accessible without login */}
          <Route path="/pet/:qrCode" element={<PublicPetProfile />} />

          {/* ── Protected Routes with Layout ───────────────────────── */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* ── Dashboard Routes ─────────────────────────────────── */}
            <Route path="dashboard" element={<OwnerDashboard />} />

            <Route
              path="vet-dashboard"
              element={
                <RoleRoute allowedRoles={['VET', 'ADMIN']}>
                  <VetDashboard />
                </RoleRoute>
              }
            />

            <Route
              path="admin-dashboard"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            {/* ── Admin Routes ─────────────────────────────────────── */}
            <Route
              path="admin/users"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <Users />
                </RoleRoute>
              }
            />
            <Route
              path="admin/content-moderation"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <ContentModeration />
                </RoleRoute>
              }
            />
            <Route
              path="admin/vet-clinics"
              element={
                <RoleRoute allowedRoles={['ADMIN']}>
                  <VetClinics />
                </RoleRoute>
              }
            />

            {/* ── Pet Routes ───────────────────────────────────────── */}
            <Route path="pets" element={<MyPets />} />
            <Route path="pets/add" element={<AddPet />} />
            <Route path="pets/:id" element={<PetDetails />} />
            <Route path="pets/:id/edit" element={<EditPet />} />

            {/* ── Health Routes ────────────────────────────────────── */}
            {/*
              IMPORTANT: Route parameter names must match useParams() calls
              in each page component:
                HealthPassport  → useParams() = { petId }
                MedicalHistory  → useParams() = { petId }
                AddRecord       → useParams() = { petId, recordId? }
                Vaccinations    → useParams() = { petId }
            */}
            <Route path="health/:petId" element={<HealthPassport />} />
            <Route path="health/:petId/history" element={<MedicalHistory />} />

            {/* AddRecord handles both CREATE and EDIT */}
            {/* CREATE: /health/:petId/records/add */}
            <Route
              path="health/:petId/records/add"
              element={<AddRecord />}
            />

            {/* ✅ EDIT - recordId must match useParams() in AddRecord.jsx */}
            <Route
              path="health/:petId/records/:recordId/edit"
              element={<AddRecord />}
            />

            {/* Legacy route - keep for backwards compat */}
            <Route
              path="health/:petId/add-record"
              element={<AddRecord />}
            />

            <Route
              path="health/:petId/vaccinations"
              element={<Vaccinations />}
            />

            {/* ── AI Scan Routes ───────────────────────────────────── */}
            <Route path="scan" element={<ScanPage />} />
            <Route path="scan/history" element={<ScanHistory />} />
            
            {/* ── Vet Connect Routes ───────────────────────────────── */}
            <Route path="vets" element={<FindVet />} />
            <Route path="vets/:id" element={<VetProfile />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="vet/appointments" element={<VetAppointments />} />  

            {/* ── QR Routes ────────────────────────────────────────── */}
            <Route path="qr" element={<QRManagement />} />

            {/* ── Community Routes ─────────────────────────────────── */}
            <Route path="community" element={<CommunityHome />} />
            <Route path="community/create" element={<CreatePost />} />
            <Route path="community/edit/:id" element={<EditPost />} />
            <Route path="community/post/:id" element={<PostDetails />} />

            {/* ── Profile Routes ───────────────────────────────────── */}
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />

            {/* ── Catch-all inside protected layout ────────────────── */}
            <Route
              path="*"
              element={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <p className="text-6xl mb-4">🐾</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Page Not Found
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    The page you're looking for doesn't exist.
                  </p>
                  <a
                    href="/dashboard"
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
                  >
                    Go to Dashboard
                  </a>
                </div>
              }
            />
          </Route>

          {/* ── Global Catch-all ─────────────────────────────────────── */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {/* ── ChatBot - Only shown when authenticated ───────────────── */}
        {isAuthenticated && <ChatBot />}
      </HealthProvider>
    </PetProvider>
  )
}

export default App