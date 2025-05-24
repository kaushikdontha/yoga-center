const ScheduleTable = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white rounded shadow">
      <thead>
        <tr>
          <th className="py-2 px-4">Day</th>
          <th className="py-2 px-4">Time</th>
          <th className="py-2 px-4">Class</th>
          <th className="py-2 px-4">Instructor</th>
          <th className="py-2 px-4">Book</th>
        </tr>
      </thead>
      <tbody>
        {/* Map your schedule data here */}
        <tr>
          <td className="py-2 px-4">Monday</td>
          <td className="py-2 px-4">8:00 AM</td>
          <td className="py-2 px-4">Hatha Yoga</td>
          <td className="py-2 px-4">Jane Doe</td>
          <td className="py-2 px-4">
            <a href="#" className="text-green-600 underline">Book</a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default ScheduleTable;
