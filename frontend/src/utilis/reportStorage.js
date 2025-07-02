// utils/reportStorage.js

export const getReportKey = (userId, month, year) =>
  `report_saved_${userId}_${month}_${year}`;

export const isReportSaved = (userId, month, year) => {
  const key = getReportKey(userId, month, year);
  return localStorage.getItem(key) === "true";
};

export const markReportSaved = (userId, month, year) => {
  const key = getReportKey(userId, month, year);
  localStorage.setItem(key, "true");
};

export const clearSavedReport = (userId, month, year) => {
  const key = getReportKey(userId, month, year);
  localStorage.removeItem(key);
};
