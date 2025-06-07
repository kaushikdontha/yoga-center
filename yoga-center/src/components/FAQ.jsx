import { useState } from 'react';

const faqs = [
  {
    question: 'What should I bring to my first class?',
    answer: 'Please bring a yoga mat (or rent one from us), comfortable clothing, a water bottle, and a small towel. Arrive 10-15 minutes early to complete registration.'
  },
  {
    question: 'Are the classes suitable for beginners?',
    answer: 'Yes! We offer classes for all levels, including dedicated beginner sessions. Our instructors provide modifications for different skill levels.'
  },
  {
    question: 'How often should I practice yoga?',
    answer: 'For beginners, we recommend 2-3 classes per week. As you build strength and flexibility, you can increase frequency based on your goals and schedule.'
  },
  {
    question: 'Do you offer private sessions?',
    answer: 'Yes, we offer one-on-one sessions with our experienced instructors. These can be booked directly through our reception or website.'
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'Classes can be cancelled up to 4 hours before the scheduled time for a full refund or class credit. Late cancellations may be charged.'
  }
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleQuestion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-playfair text-center mb-12">
          Frequently Asked Questions
        </h2>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="mb-4 bg-white rounded-lg shadow-sm overflow-hidden"
            >
              <button
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                onClick={() => toggleQuestion(index)}
              >
                <span className="font-medium text-gray-800">{faq.question}</span>
                <span className="text-orange-500 text-xl transform transition-transform duration-200"
                      style={{
                        transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)'
                      }}
                >
                  ▼
                </span>
              </button>

              <div
                className={`px-6 overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-48 py-4' : 'max-h-0'
                }`}
              >
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            Still have questions?{' '}
            <a
              href="#contact"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ; 