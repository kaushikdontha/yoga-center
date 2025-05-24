import { Link } from "react-router-dom";

const Navbar = () => (
  <nav className="bg-white shadow sticky top-0 z-50">
    <div className="container mx-auto flex items-center justify-between py-4 px-6">
      <Link to="/" className="flex items-center">
        <img src="/logo.png" alt="Yoga Center Logo" className="h-10 mr-2" />
        <span className="font-bold text-xl text-green-700">Yoga Center</span>
      </Link>
      <div className="space-x-6 flex whitespace-nowrap py-2 px-1">
        <Link to="/about">About</Link>
        <Link to="/schedule">Schedule</Link>
        <Link to="/class-styles">Class Styles</Link>
        <Link to="/pricing">Pricing</Link>
        <Link to="/gallery">Gallery</Link>
        <Link to="/testimonials">Testimonials</Link>
        <Link to="/faq">FAQ</Link>
        <Link to="/contact">
          <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Contact
          </button>
        </Link>
      </div>
    </div>
  </nav>
);

export default Navbar;
