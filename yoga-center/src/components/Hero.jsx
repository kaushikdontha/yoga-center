import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative h-screen min-h-[600px] w-full">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/classes/vinyasa.jpg"
          alt="People doing yoga outdoors"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.onerror = null; // Prevent infinite loop
            e.target.src = 'https://placehold.co/1920x1080?text=Yoga+Center'; // Fallback image
          }}
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center items-center text-center text-white px-4 max-w-4xl mx-auto">
        {/* Headline */}
        <h1 className="font-playfair text-5xl md:text-6xl lg:text-7xl mb-4 font-bold">
          Find Your Balance
        </h1>
        <h2 className="font-playfair text-2xl md:text-3xl mb-6">
          🧘‍♂️ Peace. Strength. Community.
        </h2>

        {/* Subtext */}
        <p className="font-opensans text-lg md:text-xl mb-8 max-w-2xl">
          Join instructor Ravi and discover yoga that fits your lifestyle.
        </p>

        {/* CTA Buttons */}
        <div className="space-y-4 md:space-y-0 md:space-x-4 flex flex-col md:flex-row items-center">
          <Link
            to="/contact"
            className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-8 py-3 rounded-lg 
                     transform transition duration-200 hover:scale-105 hover:shadow-lg flex items-center"
          >
            🎁 Book Your Free Trial Class
          </Link>
          <Link
            to="/schedule"
            className="text-white hover:text-orange-200 font-medium transition duration-200"
          >
            View Class Schedule
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Hero; 