"use client";

import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  useNavigate,
  useLocation,
} from "react-router-dom";
import * as echarts from "echarts";
import LoginPage from "@/components/LogInPage";
import Sidebar from "@/components/SideBar";
import TopNavigation from "@/components/TopNavigation";
import ConnectionStatus from "@/components/ConnectionStatus";
import AppRoutes from "./routes/AppRoutes";
import ApiService from "./services/api";
import "@fortawesome/fontawesome-free/css/all.min.css";

// Main App Content Component (inside Router)
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [showConnectionStatus, setShowConnectionStatus] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(5);
  const [date, setDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modal states for error and success
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showSuspendedModal, setShowSuspendedModal] = useState(false);

  // Only show this after a successful login, not page reload
  const [justLoggedIn, setJustLoggedIn] = useState(false);

  // Sidebar controls
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname.slice(1);
    return path || "dashboard";
  };

  // Navigation function
  const setCurrentPage = (page) => {
    navigate(`/${page}`);
  };

  // Only load user session without showing notification
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing saved user data:", error);
        handleLogout();
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log(window.innerWidth);
    }
  }, []);

  // removed global clock to avoid app-wide rerenders; handled in TopNavigation

  // Charts on dashboard only
  useEffect(() => {
    if (isLoggedIn && getCurrentPage() === "dashboard") {
      initCharts();
    }
  }, [isLoggedIn, location.pathname]);

  const initCharts = () => {
    const donutElement = document.getElementById("donutChart");
    const barElement = document.getElementById("barChart");
    const lineElement = document.getElementById("lineChart");
    if (!donutElement || !barElement || !lineElement) return;

    // Donut Chart
    const donutChart = echarts.init(donutElement);
    /* ... chart options as before ... */
    // OMITTED FOR BREVITY
  };

  // Login against Supabase users table (no Supabase Auth)
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");
    setShowErrorModal(false);
    setShowSuccessModal(false);
    setShowSuspendedModal(false);

    try {
      const { data: profile, error: tableErr } = await ApiService.loginTable(
        email,
        password
      );
      if (tableErr || !profile) {
        throw new Error("Invalid email or password");
      }

      // Block login if account is suspended/inactive
      if (profile.is_active === false) {
        const msg = "Your account is suspended. Please contact your administrator.";
        setErrorMessage(msg);
        setShowSuspendedModal(true);
        setLoading(false);
        return;
      }

      const userData = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        role: profile.role || "user",
        is_active: profile.is_active ?? true,
        last_login: profile.last_login || null,
        created_at: profile.created_at || null,
        source: "supabase_table",
      };

      setUser(userData);
      setIsLoggedIn(true);
      localStorage.setItem("user", JSON.stringify(userData));
      setEmail("");
      setPassword("");
      setJustLoggedIn(true);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        setJustLoggedIn(false);
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      setLoginError(error.message || "Login failed. Please try again.");
      setErrorMessage(error.message || "Login failed. Please try again.");
      // If not an explicit suspension, show generic error modal
      if (!showSuspendedModal) {
        setShowErrorModal(true);
        setTimeout(() => setShowErrorModal(false), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    ApiService.logout();
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setUser(null);
    setIsLoggedIn(false);
    setEmail("");
    setPassword("");
    navigate("/");
  };

  // Get user's full name for welcome notification
  const getUserName = () =>
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.first_name ||
        user?.firstName ||
        user?.lastName ||
        user?.email ||
        "User";

  if (!isLoggedIn) {
    return (
      <div>
        <LoginPage
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loginError={loginError}
          handleLogin={handleLogin}
          showErrorModal={showErrorModal}
          setShowErrorModal={setShowErrorModal}
          errorMessage={errorMessage}
          loading={loading}
        />
        {/* Suspended Account Modal */}
        {showSuspendedModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-yellow-800 text-white p-6 rounded-lg shadow-lg w-96 max-w-full flex flex-col items-center text-center animate-fade-in-out">
              <div className="mb-2">⚠️ <strong>Account Suspended</strong></div>
              <div className="mb-4">{errorMessage || 'Your account is suspended. Please contact your administrator.'}</div>
              <button
                onClick={() => setShowSuspendedModal(false)}
                className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-red-800 text-white p-6 rounded-lg shadow-lg w-96 max-w-full flex flex-col items-center text-center animate-fade-in-out">
              <div className="mb-2">
                ❌ <strong>Login Failed</strong>
              </div>
              <div className="mb-4">{errorMessage}</div>
            </div>
          </div>
        )}
        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center">
            <div className="bg-green-700 text-white p-6 rounded-lg shadow-lg w-96 max-w-full flex flex-col items-center text-center animate-fade-in-out">
              <div className="mb-2">
                ✅ <strong>Login Successful!</strong>
              </div>
              <div className="mb-4">Redirecting to Dashboard...</div>
            </div>
          </div>
        )}
        <ConnectionStatus />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-white">
      {/* Top-center Welcome Notification After Login ONLY */}
      {justLoggedIn && (
        <div className="fixed top-8 left-2/3 transform -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
          <div className="bg-green-700 text-white px-8 py-5 rounded-lg shadow-xl font-bold text-2xl text-center pointer-events-auto animate-fade-in-out">
            ✅ Welcome, {getUserName()}! Login Successful.
          </div>
        </div>
      )}

      <ConnectionStatus />
      {showConnectionStatus && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full mx-4">
            <ConnectionStatus detailed={true} />
            <button
              onClick={() => setShowConnectionStatus(false)}
              className="mt-4 w-full bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setShowConnectionStatus(true)}
        className="fixed bottom-16 right-4 bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full z-40"
        title="Show connection details"
      >
        ⚙️
      </button>
      <div className="flex h-screen overflow-hidden">
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
            onClick={closeSidebar}
          />
        )}
        <Sidebar
          currentPage={getCurrentPage()}
          setCurrentPage={setCurrentPage}
          handleLogout={handleLogout}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          user={user}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation
            toggleSidebar={toggleSidebar}
            currentPage={getCurrentPage()}
            showCalendar={showCalendar}
            setShowCalendar={setShowCalendar}
            date={date}
            setDate={setDate}
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            unreadNotifications={unreadNotifications}
            handleLogout={handleLogout}
            setCurrentPage={setCurrentPage}
            user={user}
          />
          <main className="flex-1 overflow-y-auto bg-[#121212]">
            <AppRoutes user={user} />
          </main>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Router
const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;
