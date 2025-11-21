import React, { useContext } from "react";
import { ThemeContext } from "../App"; // adjust path as needed

const Settings = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Settings</h2>
      <div className="flex items-center gap-4 mb-4">
        <span className="font-medium">Theme:</span>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={`px-4 py-2 rounded transition ${
            theme === "dark"
              ? "bg-gray-800 text-white"
              : "bg-yellow-300 text-gray-900"
          }`}
        >
          {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
        </button>
      </div>
    </div>
  );
};

export default Settings;
