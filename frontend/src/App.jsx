// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuth } from './hooks/useAuth'

// Layout
import Layout from './components/layout/Layout'

// Pages
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
import ContentModeration from './pages/admin/ContentModeration' // ✅ NEW

// Profile
import UserProfile from './pages/profile/UserProfile'
import Settings from './pages/profile/Settings'

// Components
import ChatBot from './components/chat/ChatBot'
import LoadingSpinner from './components/common/LoadingSpinner'

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`Access denied. User role: ${user?.role}, Required: ${allowedRoles.join(', ')}`)
    return <Navigate to="/dashboard" replace />
  }

  return children
}

// Role-based Route Component
const RoleRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth()

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    console.warn(`Access denied. User role: ${user?.role}, Required: ${allowedRoles.join(', ')}`)
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  const { isAuthenticated } = useAuth()

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '12px',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pet/:qrCode" element={<PublicPetProfile />} />

        {/* Protected Routes with Layout */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard Routes */}
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

          {/* Admin Routes */}
          <Route
            path="admin/users"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Users />
              </RoleRoute>
            }
          />

          {/* ✅ NEW: Content Moderation Route */}
          <Route
            path="admin/content-moderation"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <ContentModeration />
              </RoleRoute>
            }
          />

          {/* Pet Routes */}
          <Route path="pets" element={<MyPets />} />
          <Route path="pets/add" element={<AddPet />} />
          <Route path="pets/:id" element={<PetDetails />} />
          <Route path="pets/:id/edit" element={<EditPet />} />

          {/* Health Routes */}
          <Route path="health/:petId" element={<HealthPassport />} />
          <Route path="health/:petId/history" element={<MedicalHistory />} />
          <Route path="health/:petId/add-record" element={<AddRecord />} />
          <Route path="health/:petId/vaccinations" element={<Vaccinations />} />

          {/* AI Scan Routes */}
          <Route path="scan" element={<ScanPage />} />
          <Route path="scan/history" element={<ScanHistory />} />

          {/* Vet Connect Routes */}
          <Route path="vets" element={<FindVet />} />
          <Route path="vets/:id" element={<VetProfile />} />
          <Route path="appointments" element={<Appointments />} />

          {/* QR Routes */}
          <Route path="qr" element={<QRManagement />} />

          {/* Community Routes */}
          <Route path="community" element={<CommunityHome />} />
          <Route path="community/create" element={<CreatePost />} />
          <Route path="community/edit/:id" element={<EditPost />} />
          <Route path="community/post/:id" element={<PostDetails />} />

          {/* Profile Routes */}
          <Route path="profile" element={<UserProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>

      {/* Floating ChatBot */}
      {isAuthenticated && <ChatBot />}
    </>
  )

  
}

export default App