import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { isConfigured } from './lib/supabaseClient'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Home } from './pages/Home'
import { SetEditor } from './pages/SetEditor'
import { StudySelect } from './pages/StudySelect'
import { StudySession } from './pages/StudySession'
import { Stats } from './pages/Stats'
import { SetupNeeded } from './pages/SetupNeeded'

export default function App() {
  if (!isConfigured) {
    return <SetupNeeded />
  }

  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/" element={<Home />} />
            <Route
              path="/sets/new"
              element={
                <ProtectedRoute>
                  <SetEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sets/:id"
              element={
                <ProtectedRoute>
                  <SetEditor />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study"
              element={
                <ProtectedRoute>
                  <StudySelect />
                </ProtectedRoute>
              }
            />
            <Route
              path="/study/session"
              element={
                <ProtectedRoute>
                  <StudySession />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stats"
              element={
                <ProtectedRoute>
                  <Stats />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  )
}
