import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { BusinessProvider } from '@/context/BusinessContext';
import { ToastProvider } from '@/components/Toast';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { BusinessSetupPage } from '@/pages/BusinessSetupPage';
import { CatalogPage } from '@/pages/CatalogPage';
import { ContentPage } from '@/pages/ContentPage';
import { PreviewPage } from '@/pages/PreviewPage';
import { PublicPage } from '@/pages/PublicPage';
import { ExamplePage } from '@/pages/ExamplePage';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/signup" element={<AuthPage mode="signup" />} />
            <Route path="/b/example" element={<ExamplePage />} />
            <Route path="/b/:businessId" element={<PublicPage />} />

            {/* Owner app */}
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <BusinessProvider>
                    <DashboardPage />
                  </BusinessProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/setup"
              element={
                <ProtectedRoute>
                  <BusinessProvider>
                    <BusinessSetupPage />
                  </BusinessProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/catalog"
              element={
                <ProtectedRoute>
                  <BusinessProvider>
                    <CatalogPage />
                  </BusinessProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/content"
              element={
                <ProtectedRoute>
                  <BusinessProvider>
                    <ContentPage />
                  </BusinessProvider>
                </ProtectedRoute>
              }
            />
            <Route
              path="/app/preview"
              element={
                <ProtectedRoute>
                  <BusinessProvider>
                    <PreviewPage />
                  </BusinessProvider>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
