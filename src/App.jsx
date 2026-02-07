import "./App.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, Navigate } from "react-router-dom";

import LoginForm from "./components/forms/loginForm";
import Home from "./components/home/HomePage";
import ComposeMail from "./components/showMail/ComposeMail";
import Inbox from "./components/showMail/Inbox";
import Sent from "./components/showMail/Sent";
import { useAuthSession } from "./components/customhooks/useAuthSession";

function App() {
  
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  useAuthSession();

  return (
    <Routes>
      {/* Root → always go to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login page */}
      <Route
        path="/login"
        element={
          !isLoggedIn ? <LoginForm /> : <Navigate to="/home" replace />
        }
      />

      {/* Protected routes */}
      <Route
        path="/home"
        element={isLoggedIn ? <Home /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/compose"
        element={isLoggedIn ? <ComposeMail /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/inbox"
        element={isLoggedIn ? <Inbox /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/sent"
        element={isLoggedIn ? <Sent /> : <Navigate to="/login" replace />}
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
