import { useState } from "react";
import pythonAPI from "../axios/pythonAPI"; 
import { Lightbulb } from "lucide-react";

const SmartSuggestionBox = () => {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    if (!category || !amount) {
      alert("⚠️ Please enter both category and amount.");
      return;
    }

    setLoading(true);
    try {
      const res = await pythonAPI.post("/suggest", { category, amount });
      setSuggestions(res.data.suggestions || []);
    } catch (err) {
      console.error("Smart suggestion error:", err);
      alert("❌ Failed to fetch suggestions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 md:p-8 max-w-3xl mx-auto border border-gray-200 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <Lightbulb className="text-yellow-500 animate-pulse" size={28} />
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Smart Spending Suggestions
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Enter category (e.g., groceries)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <input
          type="number"
          placeholder="Enter amount (₹)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        onClick={handleSuggest}
        disabled={loading}
        className={`w-full md:w-auto px-6 py-2 rounded-lg font-semibold transition duration-200 ${
          loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white"
        }`}
      >
        {loading ? "Fetching..." : "💡 Get Suggestions"}
      </button>

      {suggestions.length > 0 && (
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-5 rounded-md shadow-sm">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            💬 Suggestions based on your input:
          </h3>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            {suggestions.map((suggestion, idx) => (
              <li key={idx}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SmartSuggestionBox;
