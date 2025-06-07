import { useEffect, useState } from "react";

const AdminQueries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/contacts");
        if (!res.ok) throw new Error("Failed to fetch queries");
        const data = await res.json();
        setQueries(data);
      } catch (err) {
        setError("Could not load queries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchQueries();
  }, []);

  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-6 text-blue-700 text-center">
        Contact Queries
      </h1>
      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-600 mb-4">{error}</div>}
      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg">
            <thead>
              <tr className="bg-blue-100">
                <th className="py-2 px-4 text-left">Name</th>
                <th className="py-2 px-4 text-left">Email</th>
                <th className="py-2 px-4 text-left">Message</th>
                <th className="py-2 px-4 text-left">Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {queries.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No queries found.
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q._id} className="border-b hover:bg-blue-50">
                    <td className="py-2 px-4">{q.name}</td>
                    <td className="py-2 px-4">{q.email}</td>
                    <td className="py-2 px-4 max-w-xs break-words">
                      {q.message}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(q.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminQueries;
