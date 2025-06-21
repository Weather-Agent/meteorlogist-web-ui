import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext'
import AuthWall from './components/AuthWall'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AuthWall>
        <App />
      </AuthWall>
    </AuthProvider>
  </StrictMode>,
)
