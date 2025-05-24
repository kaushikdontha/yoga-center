const ClassCard = ({ title, description, image }) => (
  <div className="bg-white rounded-lg shadow p-4 text-center">
    <img src={image} alt={title} className="w-full h-32 object-cover rounded mb-2" />
    <h3 className="font-semibold text-lg mb-1">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

export default ClassCard;
