import { useState, useEffect } from 'react';
import axios from 'axios';

const AdminContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      console.log('[Contacts] Fetching contact messages');
      const response = await axios.get('/api/contacts');
      // Sort contacts by submission date (newest first)
      const sortedContacts = response.data.sort((a, b) => 
        new Date(b.submittedAt) - new Date(a.submittedAt)
      );
      setContacts(sortedContacts);
      setLoading(false);
    } catch (err) {
      console.error('[Contacts] Error fetching contacts:', err);
      setError('Failed to fetch contact messages');
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="p-4">Loading contact messages...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Contact Messages</h1>
      {contacts.length === 0 ? (
        <div className="text-center text-gray-500">
          No contact messages received yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {contacts.map((contact) => (
            <div key={contact._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{contact.name}</h3>
                  <a 
                    href={`mailto:${contact.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {contact.email}
                  </a>
                </div>
                <span className="text-sm text-gray-500">
                  {formatDate(contact.submittedAt)}
                </span>
              </div>
              <div className="mt-3">
                <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminContacts;