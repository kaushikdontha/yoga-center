import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import ClassStyles from "./pages/ClassStyles";
import Pricing from "./pages/Pricing";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQueries from "./pages/AdminQueries";
import AdminLogin from "././pages/AdminLogin";
import AdminEvents from "./pages/AdminEvents";
import EventGallery from './pages/EventGallery';
import AdminPhotos from "./pages/AdminPhotos";
import AdminVideos from "./pages/AdminVideos";
import AdminContacts from "./pages/AdminContacts";
import Events from "./pages/Events";
import Videos from "./pages/Videos";
import NotFound from "./pages/NotFound";
import PrivateRoute from "./components/PrivateRoute";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/class-styles" element={<ClassStyles />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/events" element={
              <ErrorBoundary>
                <Events />
              </ErrorBoundary>
            } />
            <Route path="/event-gallery" element={<EventGallery />} />
            <Route path="/videos" element={<Videos />} />
            
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={<Navigate to="/admin/events" replace />} 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/queries" 
              element={
                <PrivateRoute>
                  <AdminQueries />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                <PrivateRoute>
                  <ErrorBoundary>
                    <AdminEvents />
                  </ErrorBoundary>
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/photos" 
              element={
                <PrivateRoute>
                  <AdminPhotos />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/videos" 
              element={
                <PrivateRoute>
                  <AdminVideos />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/admin/contacts" 
              element={
                <PrivateRoute>
                  <AdminContacts />
                </PrivateRoute>
              } 
            />

            {/* Redirect /admin-login to /admin/login */}
            <Route 
              path="/admin-login" 
              element={<Navigate to="/admin/login" replace />} 
            />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
