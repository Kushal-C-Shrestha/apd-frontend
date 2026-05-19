import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            background: '#0f172a',
            color: '#fff',
          },
          success: {
            style: {
              background: '#0f172a',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#be123c',
              color: '#fff',
            },
          },
        }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
)