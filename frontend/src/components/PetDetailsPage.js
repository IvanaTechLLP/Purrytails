import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ParentDeatilsPage.css"; // Ensure your CSS is imported
import {

    FaHome,
    FaTachometerAlt,
    FaFileUpload,
    FaCalendarAlt,
  } from "react-icons/fa";
  import { MdTimeline } from "react-icons/md";


const ParentDetailsPage = () => {
  const navigate = useNavigate();

  // State to hold the input values and whether the fields are editable

  const [isEditable, setIsEditable] = useState(false);
   const [petName, setPetName] = useState( "");
    const [breed, setBreed] = useState("");
    const [sex, setSex] = useState( "");
    const [weight, setWeight] = useState(0); // Initial weight state
    const [petType, setPetType] = useState(""); // New state for pet type selection
    const [ageYears, setAgeYears] = useState(0);
    const [ageMonths, setAgeMonths] = useState(0);
    const [foodBrand, setFoodBrand] = useState(""); // New state for pet type selection
    const [quantity, setQuantity] = useState(0);

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

      <h4 className="h4-heading">PET DETAILS</h4>

      {/* Fields */}
      <label>
      Pet Name :
      <input
        type="text"
        value={petName}
        onChange={(e) => setPetName(e.target.value)}
        placeholder="Enter pet's name"
        disabled={!isEditable}
      />
    </label>
      <label>
        Age
        <input
          type="tel"
          value={ageYears}
          onChange={(e) => setAgeYears(e.target.value)}
          placeholder="Enter phone number"
          disabled={!isEditable}
        />
        <input
          type="tel"
          value={ageMonths}
          onChange={(e) => setAgeMonths(e.target.value)}
          placeholder="Enter phone number"
          disabled={!isEditable}
        />
      </label>
     
      <label>
        Pet Type:
        <input
          type="text"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>
      <label>
        Sex:
        <input
          type="text"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>
      <label>
        Breed:
        <input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>
      <label>
        Weight:
        <input
          type="text"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>
      <label>
        Food Brand:
        <input
          type="text"
          value={foodBrand}
          onChange={(e) => setFoodBrand(e.target.value)}
          placeholder="Enter address"
          disabled={!isEditable}
        />
      </label>
      <label>
        Quantity:
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
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
