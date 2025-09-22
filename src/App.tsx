import { Routes, Route, Navigate } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import HostPage from './pages/HostPage'
import ScreenPage from './pages/ScreenPage'
import PackManager from './pages/PackManager'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/host/:gameId" element={<HostPage />} />
        <Route path="/screen/:gameId" element={<ScreenPage />} />
        <Route path="/packs" element={<PackManager />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  )
}

export default App
