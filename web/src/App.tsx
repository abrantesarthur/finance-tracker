import { useEffect, useState } from "react";

function App() {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:3000/")
      .then((res) => res.json())
      .then((data) => setStatus(data.status))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Finance Tracker
        </h1>
        {error ? (
          <p className="text-red-600">Error: {error}</p>
        ) : status ? (
          <p className="text-green-600">Server status: {status}</p>
        ) : (
          <p className="text-gray-500">Connecting...</p>
        )}
      </div>
    </div>
  );
}

export default App;
