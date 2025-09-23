import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoginPage from './pages/LoginPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// Lazy load pages for better performance
const HostPage = lazy(() => import('./pages/HostPage'))
const ScreenPage = lazy(() => import('./pages/ScreenPage'))
const PackManager = lazy(() => import('./pages/PackManager'))

// Loading component for lazy routes
const PageLoader = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-white text-xl">Загрузка...</div>
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/host/:gameId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <HostPage />
              </Suspense>
            } 
          />
          <Route 
            path="/host/:gameId/:mode" 
            element={
              <Suspense fallback={<PageLoader />}>
                <HostPage />
              </Suspense>
            } 
          />
          <Route 
            path="/screen/:gameId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <ScreenPage />
              </Suspense>
            } 
          />
          <Route 
            path="/packs" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PackManager />
              </Suspense>
            } 
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
