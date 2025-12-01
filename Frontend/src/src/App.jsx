import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import { Schemes } from "./pages/Schemes";
import { CreateScheme } from "./pages/CreateScheme";
import SchemeDetails from "./pages/SchemeDetails";
import EnrollPage from "./pages/EnrollPage";
import BrowseSchemes from "./pages/BrowseSchemes";
import { Milestones } from "./pages/Milestones";
import MilestoneTemplates from "./pages/MilestoneTemplates";
import { Disbursements } from "./pages/Disbursements";
import Payments from "./pages/Payments";
import { Audit } from "./pages/Audit";
import { Settings } from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Producers from "./pages/Producers";
import DisbursementsGov from "./pages/DisbursementsGov";
import Analytics from "./pages/Analytics";
import AuditGov from "./pages/AuditGov";
import SettlementBank from "./pages/SettlementBank";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/schemes" element={<Schemes />} />
            <Route path="/schemes/create" element={<CreateScheme />} />
            <Route path="/schemes/:id" element={<SchemeDetails />} />
            <Route path="/schemes/:id/enroll" element={<EnrollPage />} />
            <Route
              path="/browse-schemes"
              element={
                <ProtectedRoute roles={["PRODUCER"]}>
                  <BrowseSchemes />
                </ProtectedRoute>
              }
            />
            <Route path="/milestones" element={<Milestones />} />
            <Route
              path="/milestones/templates"
              element={<MilestoneTemplates />}
            />
            <Route path="/disbursements" element={<Disbursements />} />
            <Route
              path="/payments"
              element={
                <ProtectedRoute roles={["PRODUCER"]}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route path="/audit" element={<Audit />} />
            <Route
              path="/producers"
              element={
                <ProtectedRoute roles={["GOV"]}>
                  <Producers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gov/disbursements"
              element={
                <ProtectedRoute roles={["GOV"]}>
                  <DisbursementsGov />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gov/analytics"
              element={
                <ProtectedRoute roles={["GOV"]}>
                  <Analytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gov/audit"
              element={
                <ProtectedRoute roles={["GOV"]}>
                  <AuditGov />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bank/settlements"
              element={
                <ProtectedRoute roles={["BANK"]}>
                  <SettlementBank />
                </ProtectedRoute>
              }
            />
            <Route path="/settings" element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
