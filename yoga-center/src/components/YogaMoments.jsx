import { useState, useEffect } from 'react';
import Carousel from './Carousel'; // Import the dynamic Carousel component

const moments = [
  {
    id: 1,
    image: '/images/sunrise-batch.jpg',
    caption: 'Sunrise Batch 🌄',
    testimonial: '"The morning energy here is incredible. Best way to start my day!"'
  },
  {
    id: 2,
    image: '/images/community-circle.jpg',
    caption: 'Community Circle 🧘',
    testimonial: '"Found my yoga family here. Such a supportive environment!"'
  },
  {
    id: 3,
    image: '/images/beginner-flow.jpg',
    caption: 'Beginner Flow 🔰',
    testimonial: '"Perfect for beginners. Patient guidance and steady progress."'
  }
];

const YogaMoments = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Auto-play functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % moments.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % moments.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + moments.length) % moments.length);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-12">Our Yoga Moments</h2>
        
        {/* Render the dynamic Carousel component */}
        <Carousel />

      </div>
    </section>
  );
};

export default YogaMoments; 