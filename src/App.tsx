import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/protected-route";

import Landing from "@/routes/index";
import Login from "@/routes/auth.login";
import Signup from "@/routes/auth.signup";
import ForgotPassword from "@/routes/auth.forgot-password";
import VerifyEmail from "@/routes/auth.verify";
import Onboarding from "@/routes/onboarding";

import Home from "@/routes/home";
import Optimizer from "@/routes/optimize";
import VaultIndex from "@/routes/vault.index";
import VaultDetail from "@/routes/vault.promptId";
import Templates from "@/routes/templates";
import Analytics from "@/routes/analytics";
import Pricing from "@/routes/pricing";
import Teams from "@/routes/teams";
import ProfileSettings from "@/routes/settings.profile";
import ExtensionSettings from "@/routes/settings.extension";
import BillingSettings from "@/routes/settings.billing";
import Privacy from "@/routes/privacy";
import Terms from "@/routes/terms";
import NotFound from "@/routes/not-found";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing & Auth Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* User Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/optimize"
          element={
            <ProtectedRoute>
              <Optimizer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <VaultIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vault/:promptId"
          element={
            <ProtectedRoute>
              <VaultDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <ProtectedRoute>
              <Templates />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <Pricing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/profile"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/extension"
          element={
            <ProtectedRoute>
              <ExtensionSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/billing"
          element={
            <ProtectedRoute>
              <BillingSettings />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="bottom-right" richColors closeButton />
    </AuthProvider>
  );
}
