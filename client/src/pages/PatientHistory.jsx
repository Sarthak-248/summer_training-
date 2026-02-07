import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import { FaArrowLeft, FaNotesMedical } from 'react-icons/fa';

export default function PatientHistory() {
  const { id } = useParams(); // patient ID from URL
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false); // Toggle for edit form visibility
  const [newHistory, setNewHistory] = useState(''); // State for new history input

  // Fetch the patient history from the server
  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/patient-history/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setHistory(res.data.history);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient history.');
    } finally {
      setLoading(false);
    }
  };

  // Handle saving the new or updated history
  const handleSaveHistory = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!newHistory.trim()) {
      alert('Please provide your medical history');
      return;
    }

    setLoading(true); // Indicate that we're saving the data

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/doctors/patient-history/${id}`,
        { history: newHistory }, // Send the new history
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setHistory(res.data.history); // Update the history state with the newly saved data
      setNewHistory(''); // Reset the form input
      setIsEditing(false); // Close the form after saving
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save medical history.');
    } finally {
      setLoading(false);
    }
  };

  // Load patient history when the component is mounted
  useEffect(() => {
    fetchHistory();
  }, [id]);

  return (
    <div className="w-full p-10 pt-28">
      <div className="max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl p-10">
        <button
          className="mb-8 flex items-center gap-3 text-blue-300 hover:text-white transition-colors duration-300 font-semibold"
          onClick={() => navigate(-1)}
          aria-label="Back to Appointments"
        >
          <FaArrowLeft className="text-lg" />
          Back to Appointments
        </button>

        <h1 className="text-4xl font-extrabold mb-6 flex items-center gap-4 text-white drop-shadow-md">
          <FaNotesMedical className="text-indigo-400 text-3xl" />
          Patient Medical History
        </h1>

        {loading ? (
          <p className="text-center text-indigo-300 font-medium text-lg animate-pulse">
            Loading patient history...
          </p>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-5 rounded-lg shadow-md font-semibold text-center">
            {error}
          </div>
        ) : history.length === 0 ? (
          <>
            {/* If no history exists, show a form to input the history */}
            <p className="text-center text-gray-400 italic text-lg mt-10">
              No medical history found. Please provide your medical history below.
            </p>

            {isEditing ? (
              <div className="mt-8">
                <form onSubmit={handleSaveHistory}>
                  <textarea
                    value={newHistory}
                    onChange={(e) => setNewHistory(e.target.value)}
                    className="w-full h-40 p-4 border border-white/10 rounded-lg text-lg bg-black/40 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="Enter your medical history..."
                    required
                  />
                  <div className="mt-4 text-center">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300"
                    >
                      Save History
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setIsEditing(true)} // Show form when clicked
                  className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 transition-all duration-300"
                >
                  Add Your Medical History
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            <ul className="space-y-8">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="relative bg-white/5 border border-white/10 rounded-2xl p-10 shadow-lg hover:bg-white/10 transition-all duration-300 cursor-default overflow-visible"
                >
                  <div className="absolute top-0 left-0 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-full w-14 h-14 flex items-center justify-center font-bold text-xl shadow-lg select-none ring-4 ring-black/40">
                    Q{index + 1}
                  </div>
                  <p className="text-lg px-2 font-semibold text-indigo-300 mb-4">
                    Q: {item.question}
                  </p>
                  <p className="text-gray-300 px-2 text-base leading-relaxed whitespace-pre-wrap">
                    A: {item.answer}
                  </p>
                  <p className="mt-5 text-sm text-gray-500 italic tracking-wide">
                    {moment(item.createdAt).format('MMMM Do YYYY, h:mm A')}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
