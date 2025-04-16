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
import UserPage from "./components/UserPage";
import TermsAndConditions from "./components/TermsAndConditions";
import Home from "./components/Home";
import Timeline from "./components/Timeline";
import ParentDetailsPage from "./components/ParentDetailsPage";
import PetDetailsPage from './components/PetDetailsPage'; 
import LoginPage from "./components/LoginPage";
import HomeNew from './components/HomeNew'; 
import TimelineNew from "./components/TimelineNew";
import DashboardNew from "./components/DashboardNew";
import Upload from "./components/Upload"
import UserProfilePage from "./components/UserProfilePage";
{/*
  import Upload from "./components/Upload"

  function FileUploadPage({ profile, selectedPetId }) {
  return (
    
    <div className="app-container">
      <div className="left-panel">
        <Upload profile={profile} selectedPetId={selectedPetId}/>
      </div>
    </div>
  );
}


  function FileUploadPage({ profile, selectedPetId }) {
    return (
      
      <div className="app-container">
        <div className="left-panel">
          <ImageProcessingForm profile={profile} selectedPetId={selectedPetId}/>
        </div>
      </div>
    );
  }
  */}


  function FileUploadPage({ profile, selectedPetId }) {
  return (
    
    <div className="app-container">
      <div className="left-panel">
        <Upload profile={profile} selectedPetId={selectedPetId}/>
      </div>
    </div>
  );
}



function DashboardPage({ profile, logOut, reports, setReports, selectedPetId }) {
  return (
    <div className="app-container">
      <div className="left-panel">
        <DashboardNew
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
        <HomeNew
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
              path="/termsandconditions"
              element={
                <TermsAndConditions />
              }
            />
            <Route
              path="/parent-details"
              element={
                isAuthenticated ? (
                  <ParentDetailsPage profile={profile} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/pet-details"
              element={
                isAuthenticated ? (
                  <PetDetailsPage profile={profile} /> // Render this if the user is authenticated
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
              path="/loginn"
              element={
                <LoginPage
                  setProfile={setProfile}
                  setIsAuthenticated={setIsAuthenticated}
                />
              }
            />
            {/*
           
              <Route
              path="/upload"
              element={
                isAuthenticated ? (
                  <FileUploadPage profile={profile} logOut={logOut} selectedPetId={selectedPetId} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            */}
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
              path="/dashboardnew"
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
              path="/home-new"
              element={
                isAuthenticated ? (
                  <HomeNew
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
            

            {/*
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
            {/* QR Scanner route - Only accessible by doctors 
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
            */}
            <Route
              path="/profile"
              element={
                isAuthenticated ? (
                  <UserPage profile={profile} logOut={logOut} selectedPetId={selectedPetId} setSelectedPetId={setSelectedPetId}/>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/profile-new"
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
            path="/timeline-new"
            element={isAuthenticated ? (
              <TimelineNew profile={profile} logOut={logOut} selectedPetId={selectedPetId} />
            ) : (
              <Navigate to="/" />
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
