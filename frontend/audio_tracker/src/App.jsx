import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import ResultPage from "./pages/ResultPage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = localStorage.getItem("audiomatch_session");
    if (session) setUser(JSON.parse(session));
  }, []);

  const login = (userData) => {
    setUser(userData);
    // Session (including JWT token) is already saved in localStorage by the api service
    localStorage.setItem("audiomatch_session", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("audiomatch_session");
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={user ? <Navigate to="/home" /> : <LandingPage />} />
        <Route path="/login" element={!user ? <LoginPage onLogin={login} /> : <Navigate to="/home" />} />
        <Route path="/signup" element={!user ? <SignupPage onLogin={login} /> : <Navigate to="/home" />} />

        {/* Protected routes */}
        <Route path="/home" element={user ? <HomePage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/result" element={user ? <ResultPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/history" element={user ? <HistoryPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />
        <Route path="/about" element={user ? <AboutPage user={user} onLogout={logout} /> : <Navigate to="/login" />} />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}