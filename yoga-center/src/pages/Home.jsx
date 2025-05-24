import CTAButton from "../components/CTAButton";
import Carousel from "../components/Carousel";
import { useState, useEffect } from "react";
import axios from "axios";

const offerings = [
  {
    title: "Diverse Classes",
    desc: "From Vinyasa to Hatha, find the style that suits you best.",
    image: "/classes/vinyasa.jpg",
  },
  {
    title: "Expert Guidance",
    desc: "Personalized attention from certified instructor Ravi.",
    image: "/instructors/ravi.jpg",
  },
  {
    title: "Welcoming Community",
    desc: "Join a supportive, inclusive, and vibrant yoga family.",
    image: "/studio/community.jpg",
  },
];

const testimonials = [
  {
    name: "Aarav P.",
    text: "Ravi's classes are transformative! I feel stronger, calmer, and more connected every week.",
  },
  {
    name: "Priya S.",
    text: "The community here is so warm and welcoming. I always leave class with a smile!",
  },
  {
    name: "Vikram R.",
    text: "I never thought yoga could be this fun and challenging. Highly recommend Ravi Yoga Center!",
  },
];

const Home = () => {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/api/video").then((res) => {
      setVideoUrl(res.data.url ? `http://localhost:5000${res.data.url}` : "");
    });
  }, []);

  const nextTestimonial = () =>
    setTestimonialIdx((testimonialIdx + 1) % testimonials.length);
  const prevTestimonial = () =>
    setTestimonialIdx(
      (testimonialIdx - 1 + testimonials.length) % testimonials.length
    );

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-100 to-green-300 min-h-[60vh] flex flex-col justify-center items-center text-center overflow-hidden">
        <img
          src="/studio/hero-bg.jpg"
          alt="Yoga Studio"
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
        <div className="relative z-10 py-20 px-4">
          <h1 className="text-5xl md:text-6xl font-extrabold text-green-900 mb-4 animate-bounce">
            Find Your Balance
          </h1>
          <p className="text-xl md:text-2xl text-green-800 mb-8 max-w-2xl mx-auto drop-shadow">
            Experience peace, strength, and community. Classes for all levels,
            led by passionate instructor Ravi.
          </p>
          <CTAButton text="Join a Free Trial Class" link="/pricing" />
        </div>
      </section>
      {/* Carousel Section */}
      <section className="py-10 bg-white">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">
          Our Yoga Moments
        </h2>
        <Carousel />
      </section>
      {/* Video Section */}
      <section className="py-10 bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center">
        <h2 className="text-3xl font-bold text-center mb-6 text-green-700">
          Welcome to Ravi Yoga Center
        </h2>
        <div className="w-full max-w-2xl rounded-xl overflow-hidden shadow-lg border border-green-100">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              poster="/studio/hero-bg.jpg"
              className="w-full h-64 object-cover bg-black"
            >
              Sorry, your browser does not support embedded videos.
            </video>
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 text-gray-500">
              No intro video uploaded yet.
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-gray-600 max-w-xl">
          Meet your instructor and get a glimpse of our classes, community, and
          the peaceful environment that awaits you. Watch this short video to
          see what makes Ravi Yoga Center special!
        </p>
      </section>

      {/* Offerings Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-green-800">
          Why Choose Ravi Yoga Center?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {offerings.map((item) => (
            <div
              key={item.title}
              className="group bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:scale-105 hover:shadow-2xl transition-transform cursor-pointer"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-28 h-28 object-cover rounded-full mb-4 border-4 border-green-100 group-hover:border-green-400 transition"
              />
              <h3 className="text-xl font-semibold text-green-700 mb-2 group-hover:text-green-900 transition">
                {item.title}
              </h3>
              <p className="text-gray-600 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quick Schedule/Booking Section */}
      <section className="bg-green-50 py-12 px-4">
        <h2 className="text-2xl font-bold text-center mb-6 text-green-800">
          Morning Batches
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[220px] text-center">
            <h4 className="font-semibold text-green-700 mb-2">Batch 1</h4>
            <p className="text-lg">6:00 AM - 7:00 AM</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 flex-1 min-w-[220px] text-center">
            <h4 className="font-semibold text-green-700 mb-2">Batch 2</h4>
            <p className="text-lg">7:00 AM - 8:00 AM</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <CTAButton text="Book Your Spot" link="/schedule" />
        </div>
      </section>

      {/* Pricing Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-blue-700">
          Membership Plans
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-center gap-10">
          <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-xs text-center border-2 border-blue-100 hover:border-blue-400 transition">
            <h3 className="text-xl font-bold text-green-700 mb-2">
              Monthly Plan
            </h3>
            <div className="text-4xl font-extrabold text-blue-700 mb-2">
              ₹1500
            </div>
            <div className="text-gray-600 mb-4">
              Perfect for those who want flexibility and short-term commitment.
            </div>
            <ul className="text-left text-gray-700 mb-6 space-y-1">
              <li>✔ Unlimited classes for 1 month</li>
              <li>✔ Access to all class styles</li>
              <li>✔ Free trial class included</li>
              <li>✔ No joining fee</li>
            </ul>
            <CTAButton text="Join Monthly" link="/contact" />
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-xs text-center border-2 border-green-100 hover:border-green-400 transition">
            <h3 className="text-xl font-bold text-green-700 mb-2">
              Quarterly Plan
            </h3>
            <div className="text-4xl font-extrabold text-green-700 mb-2">
              ₹3000
            </div>
            <div className="text-gray-600 mb-4">
              Best value for regular practitioners—save more with a 3-month
              commitment!
            </div>
            <ul className="text-left text-gray-700 mb-6 space-y-1">
              <li>✔ Unlimited classes for 3 months</li>
              <li>✔ Access to all class styles</li>
              <li>✔ Free trial class included</li>
              <li>✔ No joining fee</li>
              <li>✔ Priority booking for workshops</li>
            </ul>
            <CTAButton text="Join Quarterly" link="/contact" />
          </div>
        </div>
        <div className="text-center text-gray-500 mt-8">
          <span className="font-semibold text-green-700">Special Offer:</span>{" "}
          Refer a friend and get 10% off your next renewal!
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-10 text-green-800">
          What Our Students Say
        </h2>
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8 text-center relative">
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-green-100 hover:bg-green-200 rounded-full p-2 text-green-700 shadow transition"
            aria-label="Previous testimonial"
          >
            &#8592;
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-green-100 hover:bg-green-200 rounded-full p-2 text-green-700 shadow transition"
            aria-label="Next testimonial"
          >
            &#8594;
          </button>
          <p className="text-lg italic mb-4 text-gray-700">
            "{testimonials[testimonialIdx].text}"
          </p>
          <div className="font-semibold text-green-800">
            - {testimonials[testimonialIdx].name}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
