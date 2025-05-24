import React, { useState } from "react";

const ContactForm = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to send message");
      setSubmitted(true);
    } catch (err) {
      setError(
        "There was a problem sending your message. Please try again later."
      );
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-100 text-green-800 p-4 rounded shadow mb-4 animate-fade-in">
        <h2 className="text-xl font-bold mb-2">Thank you for reaching out!</h2>
        <p>
          We'll get back to you soon. Meanwhile, follow us on social media for
          updates and offers!
        </p>
        <div className="flex space-x-4 mt-4 justify-center">
          <a
            href="https://www.instagram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <img
              src="/logo.png"
              alt="Instagram"
              className="w-8 h-8 rounded-full"
            />
          </a>
          <a
            href="https://www.facebook.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:scale-110 transition-transform"
          >
            <img
              src="/logo.png"
              alt="Facebook"
              className="w-8 h-8 rounded-full"
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-8 rounded-xl shadow-lg space-y-6 max-w-lg mx-auto border border-blue-100 animate-fade-in"
    >
      <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">
        Send Us a Message
      </h2>
      <p className="text-center text-gray-500 mb-4">
        We'd love to hear from you! Fill out the form and our team will get in
        touch.
      </p>
      <div>
        <label
          className="block mb-1 font-semibold text-blue-700"
          htmlFor="name"
        >
          Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Your Name"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        />
      </div>
      <div>
        <label
          className="block mb-1 font-semibold text-blue-700"
          htmlFor="email"
        >
          Email
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          placeholder="you@email.com"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        />
      </div>
      <div>
        <label
          className="block mb-1 font-semibold text-blue-700"
          htmlFor="message"
        >
          Message
        </label>
        <textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          required
          rows={4}
          placeholder="How can we help you?"
          className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-blue-50"
        ></textarea>
      </div>
      {error && (
        <div className="text-red-600 text-center mb-2">{error}</div>
      )}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-600 to-green-400 text-white py-3 rounded-lg hover:from-blue-700 hover:to-green-500 transition font-semibold shadow-md text-lg"
      >
        Send Message
      </button>
      <div className="text-center text-xs text-gray-400 mt-2">
        We respect your privacy. Your information will not be shared.
      </div>
    </form>
  );
};

export default ContactForm;
