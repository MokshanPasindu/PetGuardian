// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { PetProvider } from './context/PetContext'
import { NotificationProvider } from './context/NotificationContext'  // ADD THIS IMPORT
import './styles/index.css'  

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PetProvider>
            <NotificationProvider>   {/* ADD THIS WRAPPER */}
              <App />
            </NotificationProvider>   {/* ADD THIS CLOSING TAG */}
          </PetProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)