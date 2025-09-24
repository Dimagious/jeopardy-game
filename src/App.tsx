import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LoginPage from './pages/LoginPage'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

// Lazy load pages for better performance
const HostPage = lazy(() => import('./pages/HostPage'))
const ScreenPage = lazy(() => import('./pages/ScreenPage'))
const PackManager = lazy(() => import('./pages/PackManager'))
const PlayerPage = lazy(() => import('./pages/PlayerPage'))
const PinRedirectPage = lazy(() => import('./pages/PinRedirectPage'))
const AuthCallbackPage = lazy(() => import('./pages/AuthCallbackPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const GamesListPage = lazy(() => import('./pages/GamesListPage'))
const GameEditor = lazy(() => import('./pages/GameEditor'))
const GameViewPage = lazy(() => import('./pages/GameViewPage'))

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
            path="/auth/callback" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AuthCallbackPage />
              </Suspense>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <Suspense fallback={<PageLoader />}>
                <AdminPage />
              </Suspense>
            } 
          />
                <Route
                  path="/org/:orgId/admin/games"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <GamesListPage />
                    </Suspense>
                  }
                />
                <Route
                  path="/org/:orgId/admin/games/:gameId/edit"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <GameEditor />
                    </Suspense>
                  }
                />
                <Route
                  path="/org/:orgId/admin/games/:gameId/view"
                  element={
                    <Suspense fallback={<PageLoader />}>
                      <GameViewPage />
                    </Suspense>
                  }
                />
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
          <Route 
            path="/p/:pin" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PinRedirectPage />
              </Suspense>
            } 
          />
          <Route 
            path="/player/:sessionId" 
            element={
              <Suspense fallback={<PageLoader />}>
                <PlayerPage />
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
