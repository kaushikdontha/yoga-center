const plans = [
  {
    name: 'Monthly',
    price: '₹1,500',
    period: 'month',
    features: [
      { name: 'Unlimited Regular Classes', included: true },
      { name: 'All Class Styles', included: true },
      { name: 'Basic Amenities Access', included: true },

    ]
  },
  {
    name: 'Quarterly',
    price: '₹3,000',
    period: 'quarter',
    popular: true,
    features: [
      { name: 'Unlimited Regular Classes', included: true },
      { name: 'All Class Styles', included: true },
      { name: 'Basic Amenities Access', included: true},

    ]
  },

];

const Pricing = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-4">Membership Plans</h2>
        <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
          Choose the perfect plan for your yoga journey. All plans include access to our state-of-the-art facilities and expert guidance.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg transition-transform hover:scale-105 ${
                plan.popular ? 'border-2 border-orange-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white 
                              px-4 py-1 rounded-full text-sm font-medium">
                  🔥 Most Popular
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-semibold mb-2 text-center">{plan.name}</h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">/{plan.period}</span>
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="flex items-center text-gray-700"
                  >
                    <span className="mr-2 text-lg">
                      {feature.included ? '✅' : '❌'}
                    </span>
                    {feature.name}
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'bg-orange-400 hover:bg-orange-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                }`}
              >
                Choose {plan.name} Plan
              </button>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-gray-600 max-w-2xl mx-auto">
            All plans include access to our community events and basic amenities. 
            Quarterly and Yearly plan members get priority booking for special workshops and events.
          </p>
          <p className="text-orange-500 font-medium">
            ✨ Try a free class before committing to any plan!
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing; 