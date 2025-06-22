import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { ThemeProvider } from './theme/ThemeProvider';
import { Layout, ProtectedRoute, ErrorBoundary } from './components';
import { LoginPage, RegisterPage, DashboardPage, LandingPage, ProfilePage, CoursePage, TeacherDashboardPage } from './pages';

function App() {  return (
    <ErrorBoundary>
      <ThemeProvider>
        <CssBaseline />
        <Box sx={{ minHeight: '100vh', width: '100%' }}>
          <Router>
            <Routes>
          {/* Public Routes with Navigation */}
          <Route
            path="/"
            element={
              <Layout>
                <LandingPage />
              </Layout>
            }
          />

          {/* Auth Routes without Navigation */}
          <Route
            path="/login"
            element={
              <ProtectedRoute requireAuth={false}>
                <Layout showNavigation={false}>
                  <LoginPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/register"
            element={
              <ProtectedRoute requireAuth={false}>
                <Layout showNavigation={false}>
                  <RegisterPage />
                </Layout>
              </ProtectedRoute>
            }
          />          {/* Protected Routes with Navigation */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            }
          />          <Route
            path="/course/:courseId"
            element={
              <ProtectedRoute>
                <Layout>
                  <CoursePage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherDashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}<Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>        </Box>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
