import { useState, useEffect } from 'react';

const testimonials = [
  {
    id: 1,
    name: 'Priya S.',
    avatar: '/images/testimonials/priya.jpg',
    quote: 'The morning classes have transformed my daily routine. I feel more energetic and focused throughout the day.',
    duration: '2 months',
    rating: 5
  },
  {
    id: 2,
    name: 'Rahul M.',
    avatar: '/images/testimonials/rahul.jpg',
    quote: 'As a beginner, I was nervous at first, but Ravi\'s patient guidance made me feel comfortable and confident.',
    duration: '6 months',
    rating: 5
  },
  {
    id: 3,
    name: 'Anjali K.',
    avatar: '/images/testimonials/anjali.jpg',
    quote: 'The community here is amazing. I\'ve made great friends while improving my practice.',
    duration: '1 year',
    rating: 5
  }
];

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  // Generate star rating
  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('');
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-2">
          Hear it from our Yogis 💚
        </h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Join our growing community of mindful practitioners
        </p>

        <div className="relative max-w-4xl mx-auto">
          {/* Testimonial Cards */}
          <div className="relative h-[400px]">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id}
                className={`absolute w-full transition-all duration-500 transform ${
                  index === currentSlide
                    ? 'opacity-100 translate-x-0'
                    : index < currentSlide
                    ? 'opacity-0 -translate-x-full'
                    : 'opacity-0 translate-x-full'
                }`}
                style={{ zIndex: index === currentSlide ? 1 : 0 }}
              >
                <div className="bg-white rounded-2xl p-8 shadow-lg">
                  {/* Avatar */}
                  <div className="flex justify-center mb-6">
                    {testimonial.avatar ? (
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-500 
                                    flex items-center justify-center text-2xl font-semibold">
                        {getInitials(testimonial.name)}
                      </div>
                    )}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-center mb-6">
                    <p className="text-xl text-gray-700 italic mb-4">
                      "{testimonial.quote}"
                    </p>
                    <footer>
                      <div className="font-semibold text-gray-800 mb-1">
                        {testimonial.name}
                      </div>
                      <div className="text-orange-500 mb-2">
                        {renderStars(testimonial.rating)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Practicing for {testimonial.duration}
                      </div>
                    </footer>
                  </blockquote>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? 'bg-orange-400 w-4' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials; 