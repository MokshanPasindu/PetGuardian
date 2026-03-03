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
import PostDetails from './pages/community/PostDetails'

// Profile
import UserProfile from './pages/profile/UserProfile'
import Settings from './pages/profile/Settings'

// Components
import ChatBot from './components/chat/ChatBot'

// ⚠️ PREVIEW MODE - Set to false in production!
const PREVIEW_MODE = true

// Mock user for preview mode
const mockUser = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'OWNER',
  avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
}

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth()

  // 🔓 PREVIEW MODE: Skip authentication
  if (PREVIEW_MODE) {
    return children
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
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
        }}
      />

      {/* Preview Mode Banner 
      {PREVIEW_MODE && (
        <div className="fixed top-0 left-0 right-0 z-[100] bg-yellow-500 text-yellow-900 text-center py-1 text-sm font-medium">
          ⚠️ PREVIEW MODE - Authentication disabled for testing
        </div>
      )} */}

      <div className={PREVIEW_MODE ? 'pt-7' : ''}>
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
            <Route path="vet-dashboard" element={<VetDashboard />} />
            <Route path="admin-dashboard" element={<AdminDashboard />} />

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
            <Route path="community/post/:id" element={<PostDetails />} />

            {/* Profile Routes */}
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>

      {/* Floating ChatBot */}
      {(isAuthenticated || PREVIEW_MODE) && <ChatBot />}
    </>
  )
}

export default App