const Pricing = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700">
      Pricing & Membership
    </h1>
    <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-xs text-center border-2 border-blue-100 hover:border-blue-400 transition">
        <h3 className="text-xl font-bold text-green-700 mb-2">Monthly Plan</h3>
        <div className="text-4xl font-extrabold text-blue-700 mb-2">₹1500</div>
        <div className="text-gray-600 mb-4">
          Perfect for those who want flexibility and short-term commitment.
        </div>
        <ul className="text-left text-gray-700 mb-6 space-y-1">
          <li>✔ Unlimited classes for 1 month</li>
          <li>✔ Access to all class styles</li>
          <li>✔ Free trial class included</li>
          <li>✔ No joining fee</li>
        </ul>
        <a
          href="/contact"
          className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Join Monthly
        </a>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 flex-1 min-w-[260px] max-w-xs text-center border-2 border-green-100 hover:border-green-400 transition">
        <h3 className="text-xl font-bold text-green-700 mb-2">
          Quarterly Plan
        </h3>
        <div className="text-4xl font-extrabold text-green-700 mb-2">₹3000</div>
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
        <a
          href="/contact"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
        >
          Join Quarterly
        </a>
      </div>
    </div>
    <div className="text-center text-gray-500 mt-8">
      <span className="font-semibold text-green-700">Special Offer:</span> Refer
      a friend and get 10% off your next renewal!
    </div>
    <div className="mt-12 max-w-2xl mx-auto bg-blue-50 rounded-xl p-6 text-center text-blue-900">
      <h2 className="text-2xl font-bold mb-2">Need Help Choosing?</h2>
      <p className="mb-4">
        Contact us for personalized recommendations or to learn more about our
        membership options. We’re here to help you start your yoga journey!
      </p>
      <a
        href="/contact"
        className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        Contact Us
      </a>
    </div>
  </div>
);

export default Pricing;
