import { useState } from "react";

const faqs = [
  {
    q: "I'm new to yoga. Where should I begin?",
    a: "We recommend starting with our Beginner's Yoga classes or our Foundations of Yoga workshop. These classes focus on basic postures, breathing techniques, and alignment, providing a solid foundation for your yoga journey. Our instructors are experienced in guiding beginners.",
  },
  {
    q: "What types of yoga do you offer?",
    a: (
      <ul className="list-disc ml-6">
        <li>
          <b>Hatha Yoga:</b> A gentle, slower-paced practice focusing on basic
          postures and breath.
        </li>
        <li>
          <b>Vinyasa Flow:</b> Dynamic and flowing sequences linking breath with
          movement.
        </li>
        <li>
          <b>Ashtanga Yoga:</b> A traditional, athletic, and structured series
          of postures.
        </li>
        <li>
          <b>Restorative Yoga:</b> Gentle, supported poses held for longer
          durations to promote deep relaxation.
        </li>
        <li>
          <b>Yin Yoga:</b> Long-held passive stretches to target connective
          tissues.
        </li>
        <li>
          <b>Prenatal Yoga:</b> Safe and beneficial classes for expectant
          mothers.
        </li>
        <li>
          <b>Meditation & Pranayama:</b> Dedicated classes for breathwork and
          mindfulness.
        </li>
      </ul>
    ),
  },
  {
    q: "Do I need to be flexible to do yoga?",
    a: "Absolutely not! Yoga is for everyone, regardless of current flexibility. In fact, many people start yoga to improve their flexibility. Consistent practice will naturally increase your range of motion over time.",
  },
  {
    q: "What should I wear to a yoga class?",
    a: "Wear comfortable clothing that allows for a full range of motion. Athletic wear, leggings, or shorts and a t-shirt or tank top are ideal. Avoid anything too restrictive or baggy that might get in the way.",
  },
  {
    q: "Do I need to bring my own yoga mat?",
    a: "While we have mats available for rent/use at the studio, we highly recommend bringing your own for hygiene and comfort. If you're just starting out, you can borrow one of ours, and we can help you choose one for purchase when you're ready.",
  },
  {
    q: "What other props do I need?",
    a: "We provide all necessary props such as blocks, straps, blankets, and bolsters. You just need to bring yourself!",
  },
  {
    q: "Should I eat before class?",
    a: "It's best to practice yoga on an empty stomach, or at least 2-3 hours after a light meal. If you need a little something, a small piece of fruit or a few nuts about an hour before class is fine.",
  },
  {
    q: "How early should I arrive for class?",
    a: "Please arrive at least 10-15 minutes before your first class to check in, get settled, and speak with the instructor if you have any questions or concerns. For subsequent classes, 5-10 minutes is usually sufficient.",
  },
];

const FAQ = () => {
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <div className="container mx-auto py-12">
      <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((faq, idx) => (
          <div key={idx} className="border rounded-lg bg-white shadow">
            <button
              className="w-full text-left px-6 py-4 flex justify-between items-center focus:outline-none"
              onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            >
              <span className="font-semibold text-lg">{faq.q}</span>
              <span
                className={`ml-4 transition-transform duration-200 ${
                  openIdx === idx ? "rotate-180" : "rotate-0"
                }`}
              >
                ▼
              </span>
            </button>
            {openIdx === idx && (
              <div className="px-6 pb-4 text-gray-700 animate-fade-in">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
