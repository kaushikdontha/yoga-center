import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import ClassStyles from "./pages/ClassStyles";
import Pricing from "./pages/Pricing";
// import Instructors from "./pages/Instructors";
// import Workshops from "./pages/Workshops";
import Gallery from "./pages/Gallery";
import Contact from "./pages/Contact";
import Testimonials from "./pages/Testimonials";
import FAQ from "./pages/FAQ";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQueries from "./pages/AdminQueries";
import AdminLogin from "./pages/AdminLogin";

function App() {
  useEffect(() => {
    const handleScroll = () => {
      const elements = document.querySelectorAll(".scroll-fade");
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 100) {
          el.classList.add("opacity-100", "translate-y-0");
          el.classList.remove("opacity-0", "translate-y-8");
        } else {
          el.classList.remove("opacity-100", "translate-y-0");
          el.classList.add("opacity-0", "translate-y-8");
        }
      });
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function PrivateRoute({ children }) {
    const isAdmin = localStorage.getItem("isAdmin") === "true";
    return isAdmin ? children : <Navigate to="/admin-login" replace />;
  }

  return (
    <Router>
      <Navbar />
      <main className="min-h-screen bg-gray-50 overflow-y-auto max-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/class-styles" element={<ClassStyles />} />
          <Route path="/pricing" element={<Pricing />} />
          {/* <Route path="/instructors" element={<Instructors />} /> */}
          {/* <Route path="/workshops" element={<Workshops />} /> */}
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin-queries"
            element={
              <PrivateRoute>
                <AdminQueries />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;
