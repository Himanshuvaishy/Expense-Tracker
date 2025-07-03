import { useEffect, useState } from "react";
import pythonAPI from "../axios/pythonAPI"; // ✅ Use Flask backend

const ReportHistory = ({ userId }) => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await pythonAPI.get(`/reports/${userId}`);
        setReports(res.data);
      } catch (err) {
        console.error("Failed to fetch reports:", err);
      }
    };

    if (userId) fetchReports();
  }, [userId]);

  return (
    <div className="bg-white shadow p-4 rounded mt-6">
      <h2 className="text-lg font-semibold mb-3">📊 Past 3 Monthly Reports</h2>
      {reports.length === 0 ? (
        <p className="text-gray-500">No reports found.</p>
      ) : (
        <ul className="space-y-3">
          {reports.map((report, idx) => (
            <li key={idx} className="border-b pb-2">
              <p><strong>{report.month} {report.year}</strong></p>
              <p>🧾 Total Spent: ₹{report.total_spent}</p>
              <p>🏆 Top Category: {report.top_category}</p>
              <p>
                ⚠️ Overbudget:{" "}
                {report.overbudget_categories?.length
                  ? report.overbudget_categories.join(", ")
                  : "None"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReportHistory;
