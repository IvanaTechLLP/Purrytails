import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./LoginSignupPage.css";

const LoginSignupPage = ({ setProfile, setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("patient"); // Default to patient
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
      localStorage.setItem("access_token", codeResponse.access_token);
    },
    onError: (error) => console.log("Login Failed:", error),
    scope: "openid profile email https://www.googleapis.com/auth/calendar",
  });

  useEffect(() => {
    if (user) {
      axios
        .get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${user.access_token}`,
              Accept: "application/json",
            },
          }
        )
        .then((res) => {
          setProfile(res.data);
          setIsAuthenticated(true);
          const cached_user_data = res.data;

          const backendUrl =
            userType === "doctor"
              ? "/doctor_google_login"
              : "/google_login";

          axios
            .post(backendUrl, {
              email: res.data.email,
              name: res.data.name,
            })
            .then((response) => {
              setProfile((prevProfile) => ({
                ...prevProfile,
                user_id: response.data.data.user_id,
                user_type: userType,
              }));
              cached_user_data.user_id = response.data.data.user_id;
              cached_user_data.user_type = userType;
              localStorage.setItem("user", JSON.stringify(cached_user_data));

              if (userType === "doctor") {
                navigate("/doctor");
              } else {
                navigate("/home");
              }
            })
            .catch((err) => console.log("Backend Error:", err));
        })
        .catch((err) => console.log("Google Profile Fetch Error:", err));
    }
  }, [user, navigate, setProfile, setIsAuthenticated, userType]);

  // Toggle function to switch between patient and doctor
  const toggleUserType = (type) => {
    setUserType(type);
  };

  return (
    <div className="login-page">
      <Link to="/">
        <img src="PT.png" alt="Purry Tails Logo" className="logo" />
      </Link>
      <div className="login-container">
        <div className="login-form">
          <h1>Welcome back</h1>
          <p>Please enter your details</p>

          {/* User type toggle using radio buttons */}
          <div className="toggle-container">
            <label>
              <input
                type="radio"
                value="patient"
                checked={userType === "patient"}
                onChange={() => toggleUserType("patient")}
              />
              Patient
            </label>
            <label>
              <input
                type="radio"
                value="doctor"
                checked={userType === "doctor"}
                onChange={() => toggleUserType("doctor")}
              />
              Doctor
            </label>
          </div>

          <input type="email" placeholder="Email address" />
          <input type="password" placeholder="Password" />
          <div className="options">
            <label>
              <input type="checkbox" />
              Remember me
            </label>
            <a href="/forgot-password">Forgot password</a>
          </div>
          <button className="signin-button">Sign in</button>
          <button className="google-signin-button" onClick={login}>
            <img src="/google-logo.png" alt="Google Logo" />
            Sign in with Google
          </button>
          <p>
            Don’t have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
      <div className="illustration">
        <img src="login.png" alt="Illustration" />
      </div>
    </div>
  );
};

export default LoginSignupPage;
