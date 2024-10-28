import React, { useState, useEffect } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom"; 
import "./Login.css"; 
import { FaArrowLeft } from "react-icons/fa"; 

const Login = ({ setProfile, setIsAuthenticated }) => {
  const [isDoctor, setIsDoctor] = useState(false); 
  const [isSignup, setIsSignup] = useState(false); 
  const [phoneEmail, setPhoneEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [captchaImage, setCaptchaImage] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [user, setUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const navigate = useNavigate(); 

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => setUser(codeResponse),
    onError: (error) => setErrorMessage("Google Login Failed: " + error.message),
  });

  useEffect(() => {
    if (user) {
      axios
        .get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
            Accept: "application/json",
          },
        })
        .then((res) => {
          setProfile(res.data);
          setIsAuthenticated(true);
          localStorage.setItem("user", JSON.stringify(res.data));
          axios.post("http://localhost:5000/google_login", {
            email: res.data.email,
            name: res.data.name,
          })
          .then((response) => {
            console.log("Backend Response:", response.data);
            navigate("/dashboard");
          })
          .catch((err) => setErrorMessage("Backend Error: " + err.message));
        })
        .catch((err) => setErrorMessage("Google Profile Fetch Error: " + err.message));
    }
  }, [user, setProfile, setIsAuthenticated, navigate]);

  const handleLogin = () => {
    if (otp && captcha) {
      axios
        .post("http://localhost:5000/verify_login", { phoneEmail, otp, captcha })
        .then((response) => {
          console.log("Login Success", response.data);
          navigate("/dashboard"); // Redirect to dashboard on successful login
        })
        .catch((err) => setErrorMessage("Login Error: " + err.message));
    } else {
      setErrorMessage("Please enter both OTP and CAPTCHA.");
    }
  };

  const sendOtp = () => {
    if (phoneEmail) {
      axios
        .post("http://localhost:5000/send_otp", { phoneEmail })
        .then((response) => {
          console.log("OTP Sent", response.data);
          setOtpSent(true);
        })
        .catch((err) => setErrorMessage("OTP Error: " + err.message));
    } else {
      setErrorMessage("Please enter your phone number or email.");
    }
  };

  const refreshCaptcha = () => {
    axios
      .get("http://localhost:5000/captcha")
      .then((response) => {
        setCaptchaImage(response.data.image);
      })
      .catch((err) => setErrorMessage("CAPTCHA Error: " + err.message));
  };

  return (
    <div className="body">
      <div className="back-icon" onClick={() => navigate("/")}>
        <FaArrowLeft size={24} />
        <span>Back to Home</span>
      </div>

      {/* Flex container for side-by-side layout */}
      <div className="login-container">
        <div className="instructions">
          <p>
            As a {isDoctor ? "doctor" : "patient"}, please enter your registered phone number or email to receive an OTP. 
            Make sure to have your credentials ready.
          </p>
        </div>

        <div className="auth-container">
          <div className="user-toggle">
            <button
              className={`toggle-button ${!isDoctor ? "active" : ""}`}
              onClick={() => setIsDoctor(false)}
            >
              Patient
            </button>
            <button
              className={`toggle-button ${isDoctor ? "active" : ""}`}
              onClick={() => setIsDoctor(true)}
            >
              Doctor
            </button>
          </div>

          <h2>{isDoctor ? "Doctor" : "Patient"} {isSignup ? "Sign Up" : "Login"}</h2>

          {errorMessage && <div className="error-message">{errorMessage}</div>} {/* Error message display */}

          <div className="form-group">
            <label htmlFor="phoneEmail">Phone/Email:</label>
            <input
              type="text"
              id="phoneEmail"
              value={phoneEmail}
              onChange={(e) => setPhoneEmail(e.target.value)}
              placeholder="Enter phone number or email"
              required
            />
          </div>

          {otpSent && (
            <div className="form-group">
              <label htmlFor="otp">OTP:</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />
            </div>
          )}

          <div className="form-group captcha-container">
            <label htmlFor="captcha">CAPTCHA:</label>
            {captchaImage ? (
              <img src={`data:image/png;base64,${captchaImage}`} alt="captcha" />
            ) : (
              <button onClick={refreshCaptcha}>Load CAPTCHA</button>
            )}
            <input
              type="text"
              id="captcha"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              placeholder="Enter CAPTCHA"
              required
            />
          </div>

          <div className="button-group">
            {!otpSent ? (
              <button onClick={sendOtp} disabled={!phoneEmail}>
                Send OTP
              </button>
            ) : (
              <button onClick={handleLogin} disabled={!otp || !captcha}>
                Verify OTP and {isSignup ? "Sign Up" : "Login"}
              </button>
            )}
          </div>

          <div className="divider"></div>

          <h3>{isSignup ? "Sign Up" : "Login"} with Google</h3>
          <button onClick={() => login()}>
            <img src="/google-logo.png" alt="Google Logo" /> {isSignup ? "Sign Up" : "Login"} with Google
          </button>

          <p className="toggle-auth">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button onClick={() => setIsSignup(!isSignup)}>
              {isSignup ? "Login" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
