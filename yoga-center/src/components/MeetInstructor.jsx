import { useState } from 'react';
import SafeIframe from './SafeIframe';

const MeetInstructor = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">Meet Your Instructor</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Instructor Info */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold">Ravi Sharma</h3>
            <p className="text-gray-600 leading-relaxed">
              With over 15 years of experience in yoga practice and teaching, 
              Ravi Sharma brings a wealth of knowledge and passion to every class. 
              His approach combines traditional yoga philosophy with modern teaching 
              methods, making yoga accessible and beneficial for practitioners of all levels.
            </p>
            <ul className="space-y-3 text-gray-600">
              <li>✓ Certified Yoga Teacher (RYT-500)</li>
              <li>✓ Specialization in Hatha and Vinyasa Yoga</li>
              <li>✓ Meditation and Mindfulness Expert</li>
              <li>✓ Therapeutic Yoga Practitioner</li>
            </ul>
            <div className="pt-4">
              <a 
                href="#schedule" 
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Book a Class
              </a>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <SafeIframe
              src="https://www.youtube.com/embed/your-video-id"
              title="Meet Your Instructor - Ravi Sharma"
              className="w-full aspect-video"
              allowFullScreen={true}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetInstructor; 