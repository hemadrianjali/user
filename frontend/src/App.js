import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignupLogin from "./components/SignupLogin";
import Dashboard from "./components/Dashboard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SignupLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
};

export default App;