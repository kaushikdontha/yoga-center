const plans = [
  {
    name: 'Monthly',
    price: '₹1500',
    features: [
      { name: 'Unlimited Classes', included: true },
      { name: 'All Class Styles', included: true },
      { name: 'Workshop Priority', included: false },
      { name: 'Personal Consultation', included: false },
      { name: 'Free Guest Pass', included: false }
    ]
  },
  {
    name: 'Quarterly',
    price: '₹3000',
    popular: true,
    features: [
      { name: 'Unlimited Classes', included: true },
      { name: 'All Class Styles', included: true },
      { name: 'Workshop Priority', included: true },
      { name: 'Personal Consultation', included: true },
      { name: 'Free Guest Pass', included: true }
    ]
  }
];

const Pricing = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-12">Membership Plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                plan.popular ? 'border-2 border-orange-400' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-400 text-white 
                              px-4 py-1 rounded-full text-sm font-medium">
                  🔥 Popular
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-semibold mb-2 text-center">{plan.name}</h3>

              {/* Price */}
              <div className="text-center mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-600">/quarter</span>
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
        <p className="text-center text-gray-600 mt-8 max-w-2xl mx-auto">
          All plans include access to our community events and basic amenities. 
          Quarterly plan members get priority booking for special workshops and events.
        </p>
      </div>
    </section>
  );
};

export default Pricing; 