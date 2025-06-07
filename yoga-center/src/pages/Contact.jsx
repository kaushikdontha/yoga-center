import { FaPhoneAlt, FaMapMarkerAlt, FaWhatsapp } from "react-icons/fa";
import ContactForm from "../components/ContactForm";
import SafeIframe from '../components/SafeIframe';

const Contact = () => {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Contact Us</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Form */}
        <div>
          <ContactForm />
        </div>

        {/* Map and Contact Info */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <SafeIframe
              src="https://maps.google.com/maps?q=24.585445,73.712479&z=15&output=embed"
              title="Yoga Center Location"
              className="w-full h-[400px] border-0"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Visit Us</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900">Address</h3>
                <p className="text-gray-600">
                  123 Yoga Street<br />
                  Udaipur, Rajasthan 313001<br />
                  India
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Contact</h3>
                <p className="text-gray-600">
                  Phone: +91 98765 43210<br />
                  Email: info@raviyoga.com
                </p>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Hours</h3>
                <p className="text-gray-600">
                  Monday - Saturday: 6:00 AM - 8:00 PM<br />
                  Sunday: 7:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
