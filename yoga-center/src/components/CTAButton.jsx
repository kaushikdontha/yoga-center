import { Link } from "react-router-dom";

const CTAButton = ({ text, link }) => (
  <Link to={link}>
    <button className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition">
      {text}
    </button>
  </Link>
);

export default CTAButton;
