const Footer = () => (
  <footer className="bg-gray-800 text-white py-8 mt-12">
    <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
      <div>
        <img src="/logo.png" alt="Yoga Center Logo" className="h-8 mb-2" />
        <p>© {new Date().getFullYear()} Yoga Center. All rights reserved.</p>
      </div>
      <div className="space-x-4">
        <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">FB</a>
        <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">IG</a>
        <a href="https://youtube.com" aria-label="YouTube" target="_blank" rel="noopener noreferrer">YT</a>
      </div>
      <div className="space-x-4 mt-4 md:mt-0">
        <a href="/privacy-policy">Privacy Policy</a>
        <a href="/terms">Terms of Service</a>
      </div>
    </div>
  </footer>
);

export default Footer;
