import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Gallery from "./pages/Gallery";
import Training from "./pages/Training";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/Login";
// Lazy-loaded: pulls in recharts, which public-site visitors never need to download.
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

export default function App() {
  const location = useLocation();
  // The admin dashboard renders its own full-bleed operational layout
  // (sidebar + topbar), so the public site chrome is skipped there.
  const isAdminConsole = location.pathname.startsWith("/admin/dashboard");

  if (isAdminConsole) {
    return (
      <Routes>
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Suspense fallback={<div className="grid min-h-screen place-items-center text-navy-400">Loading dashboard…</div>}>
                <AdminDashboard />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/training" element={<Training />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}