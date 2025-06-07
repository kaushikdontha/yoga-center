const days = ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const batches = [
  { name: "Batch 1", time: "6 to 7" },
  { name: "Batch 2", time: "7 to 8" },
];

const Schedule = () => (
  <div className="container mx-auto py-12 px-4">
    <h1 className="text-4xl font-bold mb-6 text-center text-green-700 drop-shadow">Class Schedule</h1>
    <p className="mb-8 text-center text-lg text-gray-700">Join us for morning yoga sessions, Tuesday to Sunday!</p>
    <div className="flex justify-center">
      <div className="w-full max-w-4xl bg-white/80 rounded-2xl shadow-xl p-6">
        <table className="min-w-full rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-green-100">
              <th className="py-3 px-4 border-b font-bold text-lg text-green-800">Batch</th>
              {days.map((day) => (
                <th key={day} className="py-3 px-4 border-b font-bold text-green-800">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {batches.map((batch, i) => (
              <tr key={batch.name} className={i % 2 === 0 ? "bg-green-50 hover:bg-green-100 transition" : "bg-white hover:bg-green-50 transition"}>
                <td className="py-3 px-4 font-semibold text-green-700 text-lg border-b-2 border-green-100">{batch.name} <span className="block text-xs text-gray-500 font-normal">{batch.time}</span></td>
                {days.map((day) => (
                  <td key={day} className="py-3 px-4 border-b-2 border-green-100">
                    <span className="inline-block bg-green-200 text-green-900 rounded-full px-3 py-1 text-sm font-medium shadow-sm">Yoga Class</span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    <p className="mt-8 text-center text-gray-500 italic">* No classes on Mondays. All levels welcome!</p>
  </div>
);

export default Schedule;
