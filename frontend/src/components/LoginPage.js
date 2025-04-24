import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import "./LoginPage.css";

const LoginPage = ({ setProfile, setIsAuthenticated }) => {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState("patient"); // Default to patient
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => {
      setUser(codeResponse);
      localStorage.setItem("access_token", codeResponse.access_token);
    },
    onError: (error) => console.log("Login Failed:", error),
    scope: "openid profile email",
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
              ? "http://localhost:5000/doctor_google_login"
              : "http://localhost:5000/google_login";

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
                navigate("/profile");
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
    <div className="loginpage-1">
      <Link to="/">
        <img src="PT.png" alt="Purry Tails Logo" className="logo-10" />
      </Link>

      <h1 className="login-heading-1">
  <span className="login-heading-large-1">Purry Tails – Making Tails Wag & Hearts Purr! 🐶🐱</span>
  <span className="login-heading-small-1">
    <span className="login-title">Purry Tails</span> <br />
    - Making Tails Wag & Hearts Purr!
</span>
</h1>

      
      <p className="login-subtext-1">Welcome to the future of pet care! Track vet visits, manage health records, and even help strays find loving homes—all with a single tap!</p>
      <p className="login-subtext-2">Paw-some care made easy. Let’s get started! 🐾
      </p>

      <button className="login-new-button-1" onClick={login}>Sign in with Google</button>
                <div className="image-container-login">
            <img src="/image 67.png" alt="Pet Care" className="side-image-1" />
            
            <div className="image-overlay-login">
                <img src="/47 1.png" alt="Adoption" className="side-image-2" />
                <p className="overlay-text-login">
        <span className="overlay-highlight-login">Oops! Lost your pet's health reports?</span><br />
        Upload, track, and simplify your pet’s health journey while spreading love to every tail in need.
        Your pet’s happiness starts here!
    </p>
            </div>
            </div>



         
    
    </div>
  );
};

export default LoginPage;
