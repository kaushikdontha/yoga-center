import React, { useState } from "react";
import api from "../utils/axios";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate form
      if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
        throw new Error("Please fill in all fields");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        throw new Error("Please enter a valid email address");
      }

      const response = await api.post("/api/contact", form);
      
      if (response.data.success) {
        setSubmitted(true);
        setForm({ name: "", email: "", message: "" });
      } else {
        throw new Error(response.data.message || "Failed to send message");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        err.message || 
        "There was a problem sending your message. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow-lg mb-4 animate-fade-in max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-2 text-center">Thank you for reaching out!</h2>
        <p className="text-center mb-4">
          We'll get back to you soon. Meanwhile, follow us on social media for
          updates and offers!
        </p>
        <div className="flex space-x-6 mt-6 justify-center">
          <a
            href="https://www.instagram.com/raviyogacenter"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform p-2"
            aria-label="Follow us on Instagram"
          >
            <img
              src="/logo.png"
              alt="Instagram"
              className="w-10 h-10 rounded-full shadow-md"
            />
          </a>
          <a
            href="https://www.facebook.com/raviyogacenter"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform p-2"
            aria-label="Follow us on Facebook"
          >
            <img
              src="/logo.png"
              alt="Facebook"
              className="w-10 h-10 rounded-full shadow-md"
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto px-4 sm:px-6">
      {error && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md mb-4 text-sm sm:text-base">
          {error}
        </div>
      )}
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base sm:text-lg py-2 px-3"
          required
          disabled={loading}
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base sm:text-lg py-2 px-3"
          required
          disabled={loading}
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 text-base sm:text-lg py-2 px-3"
          required
          disabled={loading}
          placeholder="How can we help you?"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base sm:text-lg font-medium text-white 
          ${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600 active:bg-orange-700'} 
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200
          touch-manipulation`}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sending...
          </>
        ) : (
          'Send Message'
        )}
      </button>
    </form>
  );
};

export default ContactForm;
