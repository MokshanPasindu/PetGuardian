// src/layouts/MainLayout.jsx
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}