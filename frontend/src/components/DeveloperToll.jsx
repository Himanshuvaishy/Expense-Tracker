// src/pages/DeveloperTools.jsx
import React from "react";
import { toast } from "react-toastify";

import { useAuth } from "../context/AutoContext";

const DeveloperTools = () => {
  const { user } = useAuth();

  const handleClearReportCache = () => {
    const prefix = `report_saved_${user?.id}_`;
    const keysToRemove = Object.keys(localStorage).filter((key) =>
      key.startsWith(prefix)
    );
    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
    toast.info("🧹 Report cache cleared for this user.");
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">🛠️ Developer Tools</h1>
      <p className="text-sm text-gray-600 mb-4">
        Only visible to authorized users (like Admin or Developer).
      </p>

      {["admin@gmail.com", "your@email.com"].includes(user?.email) ?(
        <button
          onClick={handleClearReportCache}
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
        >
          🧹 Clear Report Cache
        </button>
      ) : (
        <p className="text-red-500">🚫 You are not authorized to use this tool.</p>
      )}
    </div>
  );
};

export default DeveloperTools;
