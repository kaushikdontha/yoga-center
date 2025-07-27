import { Link } from 'react-router-dom';

const batches = [
  {
    id: 1,
    time: '6:00 AM to 7:00 AM',
    style: 'Power style',
    popular: true
  },
  {
    id: 2,
    time: '7:00AM to 8:00AM',
    style: 'Power Yoga'
  }
];

const BatchSelector = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-4">Morning Batches</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Start your day with mindfulness and energy. Choose the batch that fits your schedule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all duration-300 
                hover:scale-105 ${batch.popular ? 'border-2 border-orange-400' : ''}`}
            >
              {batch.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white 
                              px-4 py-1 rounded-full text-sm font-medium">
                  🌅 Most Popular
                </div>
              )}

              {/* Time */}
              <h3 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
                {batch.time}
              </h3>

              {/* Style */}
              <div className="text-center mb-8">
                <span className="text-lg font-medium text-orange-500">
                  {batch.style}
                </span>
              </div>

              {/* Book Button */}
              <Link
                to={`/book/${batch.id}`}
                className={`block w-full py-3 px-4 text-center rounded-lg font-semibold transition-colors
                  ${batch.popular 
                    ? 'bg-orange-400 hover:bg-orange-500 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
              >
                Book Your Spot
              </Link>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600 max-w-2xl mx-auto">
            All batches include access to our state-of-the-art facilities and expert guidance.
            Join our morning community for an energizing start to your day!
          </p>
          <p className="text-orange-500 font-medium">
            ✨ First class is free for new members!
          </p>
        </div>
      </div>
    </section>
  );
};

export default BatchSelector; 