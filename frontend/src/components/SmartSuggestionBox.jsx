import { useState } from "react";
import axios from "axios";
import { Lightbulb } from "lucide-react"; // Optional icon

const SmartSuggestionBox = () => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!category || !amount) return alert("Please enter category and amount.");

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/api/suggest", {
        category,
        amount,
      });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("Smart suggestion error:", err);
      alert("❌ Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl mx-auto mt-10 border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="text-yellow-500" />
        <h2 className="text-2xl font-semibold text-gray-800">Smart Suggestions</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input
          type="text"
          placeholder="Enter category (e.g. food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleSuggest}
        className="bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700 transition w-full md:w-auto"
        disabled={loading}
      >
        {loading ? "Fetching..." : "Get Suggestions"}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-6 bg-gray-50 p-4 rounded border-l-4 border-blue-600">
          <h3 className="text-lg font-medium text-blue-700 mb-2">💡 Suggestions:</h3>
          <ul className="list-disc pl-5 space-y-1 text-gray-800">
            {suggestions.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestionBox;
