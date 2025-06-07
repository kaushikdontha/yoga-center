import { Link } from 'react-router-dom';

const batches = [
  {
    id: 1,
    time: '6:00AM to 8:00AM',
    name: 'Early Bird Flow',
    spots: 4,
    intensity: 'Moderate',
    style: 'Vinyasa'
  },
  {
    id: 2,
    time: '7:00AM to 8:00AM',
    name: 'Morning Energize',
    spots: 6,
    intensity: 'High',
    style: 'Power Yoga'
  }
];

const BatchSelector = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-4">Morning Batches</h2>
        <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Start your day with mindfulness and energy. Choose the batch that fits your schedule.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-lg hover:shadow-xl 
                       transition-all duration-300"
            >
              {/* Sunrise Icon */}
              <div className="text-4xl mb-4">🌅</div>

              {/* Time */}
              <h3 className="text-2xl font-semibold mb-2 text-gray-800">
                {batch.time}
              </h3>

              {/* Batch Name */}
              <h4 className="text-lg font-medium text-orange-500 mb-4">
                {batch.name}
              </h4>

              {/* Details */}
              <div className="space-y-2 mb-6 text-gray-600">
                <p>Style: {batch.style}</p>
                <p>Intensity: {batch.intensity}</p>
                <p className="font-medium text-green-600">
                  {batch.spots} spots left
                </p>
              </div>

              {/* Book Button */}
              <Link
                to={`/book/${batch.id}`}
                className="block w-full py-3 px-4 bg-orange-400 hover:bg-orange-500 
                         text-white text-center rounded-lg font-semibold transition-colors"
              >
                Book Your Spot
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BatchSelector; 