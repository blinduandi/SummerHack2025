import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { theme } from './theme';
import { Layout, ProtectedRoute, ApiStatus } from './components';
import { LoginPage, RegisterPage, DashboardPage, LandingPage } from './pages';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', width: '100%' }}>
        <ApiStatus />
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
          />

          {/* Protected Routes with Navigation */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <DashboardPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Box>
  </ThemeProvider>
);
}

export default App;
