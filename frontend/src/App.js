import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./App.css";
import ImageProcessingForm from "./components/ImageProcessingForm";
import LoginSignupPage from "./components/LoginSignupPage";
import ErrorBoundary from "./components/ErrorBoundary";
import Dashboard from "./components/Dashboard";
import LandingPage from "./components/LandingPage";
import QR_Dashboard from "./components/QR_Dashboard";
import UserProfilePage from "./components/UserPage";
import Doctor from "./components/Doctor";
import Calendar from "./components/Calendar";
import QrScanner from "./components/QrScanner";
import Home from "./components/Home";
import ChatWindow from "./components/ChatWindow";
import Timeline from "./components/Timeline";
import ParentDetailsPage from "./components/ParentDetailsPage";
import PetDetailsPage from './components/PetDetailsPage'; 



function FileUploadPage({ profile, selectedPetId }) {
  return (
    
    <div className="app-container">
      <div className="left-panel">
        <ImageProcessingForm profile={profile} selectedPetId={selectedPetId}/>
      </div>
    </div>
  );
}

function DashboardPage({ profile, logOut, reports, setReports, selectedPetId }) {
  return (
    <div className="app-container">
      <div className="left-panel">
        <Dashboard
          profile={profile}
          logOut={logOut}
          reports={reports}
          setReports={setReports}
          selectedPetId={selectedPetId}
        />
      </div>
    </div>
  );
}

function HomePage({ profile, logOut, reports, setReports, selectedPetId }) {
  return (
    <div className="app-container">
      <div className="left-panel">
        <Home
          profile={profile}
          logOut={logOut}
          reports={reports}
          setReports={setReports}
          selectedPetId={selectedPetId}
        />
      </div>
    </div>
  );
}

function QR_DashboardPage({ reports, setReports, profile, setProfile }) {
  return (
    <div className="app-container">
      <div className="left-panel">
        <QR_Dashboard reports={reports} setReports={setReports} profile={profile} setProfile={setProfile} />
      </div>
    </div>
  );
}

function App() {
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState([]);
  const [reports, setReports] = useState([]);
  const [selectedPetId, setSelectedPetId] = useState("");
  

  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "undefined") {
      console.log("User found in localStorage:", storedUser); // Add this line
      setProfile(JSON.parse(storedUser));
      setIsAuthenticated(true);
    } else {
      console.log("No user in localStorage"); // Add this line
    }
  }, [setProfile, setIsAuthenticated]);

  const logOut = () => {
    console.log("Logging out...");
    localStorage.removeItem("user");
    setProfile(null);
    setIsAuthenticated(false);
    window.location.href = "/"; // Redirect to landing page after logout
  };

  console.log(isAuthenticated);
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <LandingPage/>
              }
              
            />
            <Route
              path="/parent-details"
              element={
                isAuthenticated ? (
                  <ParentDetailsPage />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/parent-details"
              element={
                isAuthenticated ? (
                  <ParentDetailsPage /> // Render this if the user is authenticated
                ) : (
                  <Navigate to="/" /> // Redirect to landing page if not authenticated
                )
              }
            />
           
            <Route
              path="/login"
              element={
                <LoginSignupPage
                  setProfile={setProfile}
                  setIsAuthenticated={setIsAuthenticated}
                />
              }
            />
            
            <Route
              path="/file_upload"
              element={
                isAuthenticated ? (
                  <FileUploadPage profile={profile} logOut={logOut} selectedPetId={selectedPetId} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/dashboard"
              element={
                isAuthenticated ? (
                  <DashboardPage
                    profile={profile}
                    logOut={logOut}
                    reports={reports}
                    setReports={setReports}
                    selectedPetId={selectedPetId}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/home"
              element={
                isAuthenticated ? (
                  <Home
                    profile={profile}
                    logOut={logOut}
                    reports={reports}
                    setReports={setReports}
                    selectedPetId={selectedPetId}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/calendar"
              element={
                isAuthenticated ? (
                  <Calendar 
                    logOut = {logOut}
                    profile = {profile}
                  />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/qr_dashboard/:user_id"
              element={
                <QR_DashboardPage
                  reports={reports}
                  setReports={setReports}
                  profile={profile}
                  setProfile={setProfile}
                />
              }
            />
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <UserProfilePage profile={profile} logOut={logOut} selectedPetId={selectedPetId} setSelectedPetId={setSelectedPetId}/>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/timeline"
              element={
                isAuthenticated ? (
                  <Timeline profile={profile} logOut={logOut} selectedPetId={selectedPetId} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/chat"
              element={
                isAuthenticated ? (
                  <ChatWindow profile={profile} logOut={logOut} selectedPetId={selectedPetId} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/doctor"
              element={
                isAuthenticated ? (
                  <Doctor profile={profile} logOut={logOut} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            {/* QR Scanner route - Only accessible by doctors */}
              <Route
              path="/qrscanner"
              element={
                isAuthenticated ? (
                  <QrScanner /> // Render the QR scanner if the user is a doctor
                ) : (
                  <Navigate to="/" /> // Redirect non-doctors to the home page
                )
              }
            />

          </Routes>
        </Router>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  );
}

export default App;
