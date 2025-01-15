import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ParentDeatilsPage.css"; // Ensure your CSS is imported
import {
    FaSignOutAlt,
    FaComments,
    FaHome,
    FaTachometerAlt,
    FaFileUpload,
    FaCalendarAlt,
  } from "react-icons/fa";
  import { MdTimeline } from "react-icons/md";


const ParentDetailsPage = ( {profile} ) => {
  const navigate = useNavigate();

  // State to hold the input values and whether the fields are editable
  const [ownerName, setOwnerName] = useState("John Doe");
  const [phoneNumber, setPhoneNumber] = useState("123-456-7890");
  const [ownerAddress, setOwnerAddress] = useState("123 Main St, City");
  const [isEditable, setIsEditable] = useState(false);

  // UseEffect to fetch data from a backend or state
  useEffect(() => {
    fetchUserDetails();
  }, []);
    

  const fetchUserDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/user_dashboard/${profile.user_id}`
      );
      const data = await response.json();
      setOwnerName(data.name);
      setPhoneNumber(data.phone_number);
      setOwnerAddress(data.owner_address);
      console.log("User details fetched:", data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Handle back button click to navigate to profile page
  const handleBack = () => {
    navigate("/profile"); // Redirect to profile page
  };
  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };
  // Handle edit and save button functionality
  const handleEdit = () => {
    setIsEditable(true); // Enable editing
  };

  const handleSave = () => {
    setIsEditable(false); // Disable editing
    // Here you can add logic to save changes to a backend or state
  };

  return (
    
    <div className="dashboard-wrapper">
          <div className="bottom-nav">
                            <ul className="nav-menu">
                            <li className="nav-item" onClick={() => { navigate("/home")}}>
                            <FaHome />
                            <p>Home</p>
                          </li>
                          <li className="nav-item" onClick={() => { navigate("/dashboard")}}>
                            <FaTachometerAlt />
                            <p>Dashboard</p>
                          </li>
                        <li className="nav-item" onClick={() => { handleUploadFile()}}>
                              <FaFileUpload />
                              <p>Upload</p>
                            </li>
                          <li className="nav-item" onClick={() => { navigate("/timeline")}}>
                            <MdTimeline />
                            <p>Timeline</p>
                          </li>
                     
                        </ul>
                            </div>
          <div classname="dashboard-left">
            <div className="sidebar">
      
    
              <h2>Menu</h2>
              <ul className="menu-items">
                <li
                  onClick={() => {
                    navigate("/home");
                    
                  }}
                  title="Home"
                >
                  <FaHome className="home-icon" /> <span>Home</span>
                </li>
    
                <li
                  onClick={() => {
                    navigate("/dashboard");
                   
                  }}
                  className="menu-button"
                  title="Dashboard"
                >
                  <FaTachometerAlt className="home-icon" /> <span>Records</span>
                </li>
                <li
                  onClick={() => {
                    handleUploadFile();
                   
                  }}
                  className="menu-button"
                  title="Upload reports"
                >
                  <FaFileUpload className="home-icon" /> <span>Uploads</span>
                </li>
                <li
                  onClick={() => {
                    navigate("/timeline");
                   
                  }}
                  className="menu-button"
                  title="Timeline"
                >
                  <MdTimeline className="home-icon" /> <span>TimeLine</span>
                </li>
    
                        {/*
                    <li onClick={() => { navigate("/calendar"); closeMenu(); }} className='menu-button' title="Calendar">
                      <FaCalendarAlt /> 
                    </li>
                    <li onClick={() => { navigate("/chat"); closeMenu(); }} title="Chat">
                    <FaComments /> 
                  </li>
                    */}
              </ul>
              
            </div>
          </div>
    <div className="profile-page">
    <div className="form-container">
      {/* Back Arrow */}
      <div className="back-arrow" onClick={handleBack} style={{ cursor: "pointer" }}>
        ← 
      </div>

      <h4 className="h4-heading">PET PARENT DETAILS</h4>

      {/* Fields */}
      <label>
        Owner's Name:
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Enter name"
          disabled={!isEditable}
        />
      </label>
      <label>
        Phone Number:
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter phone number"
          disabled={!isEditable}
        />
      </label>
      <label>
        Address:
        <input
          type="text"
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>

      {/* Edit and Save Buttons */}
      <div className="button-container">
        {!isEditable ? (
          <button className="edit-button" onClick={handleEdit}>Edit</button>
        ) : (
          <button className="save-button" onClick={handleSave}>Save</button>
        )}
      </div>
    </div>
    </div>
    </div>
  );
};

export default ParentDetailsPage;
