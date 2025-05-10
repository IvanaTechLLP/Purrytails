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
    const [isOpen, setIsOpen] = useState(false);

  // UseEffect to fetch data from a backend or state
  useEffect(() => {
    fetchUserDetails();
  }, []);
    

  const fetchUserDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `/api/user_dashboard/${profile.user_id}`
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

  const handleSave = async () => {
    setIsEditable(false); // Disable editing
    const newUserDetails = {
      name: ownerName,
      phone_number: phoneNumber,
      owner_address: ownerAddress,
    };

    try {
      // Send details to backend API
      const response = await fetch(
        `/api/update_user_details/${profile.user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: profile.user_id, // Replace with actual user ID
            userDetails: newUserDetails,
          }),
        }
      );

      if (response.ok) {
        alert(
          "User details saved successfully and sent to the database!"
        );
      } else {
        const errorData = await response.json();
        console.error("Failed to save data:", errorData);
        alert("Failed to send data to the database. Please try again.");
      }
    } catch (error) {
      console.error("Error sending data to the backend:", error);
      alert("An error occurred while sending data. Please try again.");
    }
  };
  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    
    <div className="dashboard-wrapper">
            <div className="header">
 
 <button className="hamburger" onClick={handleToggle}>
                 &#9776;
               </button>
               <h1 className="calendar-title">Parent Details</h1>
            
</div>
          
          <div classname="dashboard-left">
          <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                 <button className="back-arrow-menu" onClick={closeMenu}>
                   &larr;
                 </button>
      
    
              <h2>Menu</h2>
              <ul className="menu-items">
                <li
                  onClick={() => {
                    navigate("/home");
                    closeMenu();
                    
                  }}
                  title="Home"
                >
                  <FaHome className="home-icon" /> <span>Home</span>
                </li>
    
                <li
                  onClick={() => {
                    navigate("/dashboard");
                    closeMenu();
                   
                  }}
                  className="menu-button"
                  title="Dashboard"
                >
                  <FaTachometerAlt className="home-icon" /> <span>Records</span>
                </li>
                <li
                  onClick={() => {
                    handleUploadFile();
                    closeMenu();
                   
                  }}
                  className="menu-button"
                  title="Upload reports"
                >
                  <FaFileUpload className="home-icon" /> <span>Uploads</span>
                </li>
                <li
                  onClick={() => {
                    navigate("/timeline");
                    closeMenu();
                   
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
    <div className="profile-page" onClick={() => {closeMenu(); }}>
    <div className="form-container">
      {/* Back Arrow */}
      <div className="back-arrow" onClick={handleBack} style={{ cursor: "pointer" }}>
        ← 
      </div>

      <h4 className="h4-heading"> PARENT DETAILS</h4>

      {/* Fields */}
      <label>
        Parent Name:
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
