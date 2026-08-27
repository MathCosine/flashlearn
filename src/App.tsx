import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Layout } from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { SetEditor } from './pages/SetEditor'
import { StudySelect } from './pages/StudySelect'
import { StudySession } from './pages/StudySession'

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  )
}
