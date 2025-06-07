const features = [
  {
    icon: '🧘‍♀️',
    title: 'Diverse Styles',
    description: 'From gentle Hatha to dynamic Vinyasa, find the perfect practice for your journey.'
  },
  {
    icon: '👨‍🏫',
    title: 'Expert Guidance',
    description: 'Personalized attention and adjustments to help you progress safely and effectively.'
  },
  {
    icon: '🤝',
    title: 'Inclusive Community',
    description: 'A welcoming space where everyone can grow, connect, and thrive together.'
  }
];

const Features = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-12">
          Why Choose Ravi Yoga Center?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 
                       transition-all duration-300 group"
            >
              {/* Icon */}
              <div className="text-5xl mb-4 group-hover:animate-bounce">
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features; 