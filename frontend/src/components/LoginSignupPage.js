import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
      // Save access token in localStorage
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
          

          // Define backend URLs for patient and doctor
          const backendUrl = userType === "doctor"
            ? "http://localhost:5000/doctor_google_login"
            : "http://localhost:5000/google_login";

          // Send user profile data to the respective backend
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
              console.log("Backend Response:", response.data);

              cached_user_data.user_id = response.data.data.user_id;
              cached_user_data.user_type = userType;
              console.log("Cached User Data:", cached_user_data);
              localStorage.setItem("user", JSON.stringify(cached_user_data));

              // Redirect based on user type
              if (userType === "doctor") {
                navigate("/doctor");
              } else {
                navigate("/dashboard");
              }
            })
            .catch((err) => console.log("Backend Error:", err));
        })
        .catch((err) => console.log("Google Profile Fetch Error:", err));
    }
  }, [user, navigate, setProfile, setIsAuthenticated, userType]);

  return (
    <div className="login-wrapper">
      <button className="back-button" onClick={() => navigate("/")}>
        Back
      </button>
      <div className="info-container">
        <div className="login-steps">
          <h2>Steps to Login</h2>
          <ol>
            {userType === "doctor" ? (
              <>
                <li>Click on the "Sign in with Google" button.</li>
                <li>Authorize access to your Google account.</li>
                <li>Fill in your doctor profile details if prompted.</li>
                <li>You will be redirected to your doctor dashboard.</li>
              </>
            ) : (
              <>
                <li>Click on the "Sign in with Google" button.</li>
                <li>Authorize access to your Google account.</li>
                <li>Fill in your patient profile details if prompted.</li>
                <li>You will be redirected to your patient dashboard.</li>
              </>
            )}
          </ol>
        </div>

        <div className="user-type-selection">
          <h3>Select User Type</h3>
          <label>
            <input
              type="radio"
              value="patient"
              checked={userType === "patient"}
              onChange={() => setUserType("patient")}
            />
            Patient
          </label>
          <label>
            <input
              type="radio"
              value="doctor"
              checked={userType === "doctor"}
              onChange={() => setUserType("doctor")}
            />
            Doctor
          </label>
        </div>
      </div>

      <div className="auth-container">
        <div className="login-option">
          <h2>Login with Google</h2>
          <button onClick={() => login()}>
            <img src="/google-logo.png" alt="Google Logo" />
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupPage;
