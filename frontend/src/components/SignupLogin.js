
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SignupLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isSignup ? "/api/auth/register" : "/api/auth/login";
    try {
      const { data } = await axios.post(endpoint, { username, password });
      if (!isSignup) {
        localStorage.setItem("authToken", data.token);
        navigate("/dashboard");
      } else {
        alert("User registered successfully");
      }
    } catch (err) {
      console.error(err);
      alert("Authentication failed");
    }
  };

  return (
    <div>
      <h2>{isSignup ? "Sign Up" : "Log In"}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">{isSignup ? "Sign Up" : "Log In"}</button>
      </form>
      <button onClick={() => setIsSignup(!isSignup)}>
        Switch to {isSignup ? "Log In" : "Sign Up"}
      </button>
    </div>
  );
};

export default SignupLogin;
