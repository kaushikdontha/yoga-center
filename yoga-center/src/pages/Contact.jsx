import { FaPhoneAlt, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import ContactForm from "../components/ContactForm";

const Contact = () => (
  <div className="container mx-auto py-12">
    <h1 className="text-3xl font-bold mb-4 text-center">Contact Us</h1>
    <div className="mb-8 flex flex-col md:flex-row md:space-x-8 items-start">
      <div className="md:w-1/2 mb-8 md:mb-0">
        <div className="mb-6 bg-white p-6 rounded shadow">
          <p className="mb-2 flex items-center gap-2">
            <FaPhoneAlt className="text-green-600 text-lg" />
            <span className="font-semibold">Phone:</span>{" "}
            <a href="tel:+9247842715" className="text-blue-600 hover:underline">
              9247842715
            </a>
          </p>
          <p className="mb-2 flex items-center gap-2">
            <FaMapMarkerAlt className="text-red-500 text-lg" />
            <span className="font-semibold">Location:</span>
          </p>
          <iframe
            title="Google Maps"
            src="https://maps.google.com/maps?q=24.585445,73.712479&z=15&output=embed"
            width="100%"
            height="200"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="rounded mb-2"
          ></iframe>
          <div className="mt-2">
            <a
              href="https://maps.app.goo.gl/mbhVcehDd6Sv9Xew6?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-1"
            >
              <FaMapMarkerAlt className="text-red-500" />
              View on Google Maps
            </a>
          </div>
          <a
            href="https://wa.me/9247842715"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition mt-4 shadow"
          >
            <FaWhatsapp className="text-xl" />
            Chat with us on WhatsApp
          </a>
        </div>
      </div>
      <div className="md:w-1/2">
        <ContactForm />
      </div>
    </div>
  </div>
);

export default Contact;
