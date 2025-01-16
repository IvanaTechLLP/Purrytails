import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./ParentDeatilsPage.css"; // Ensure your CSS is imported
import {

    FaHome,
    FaTachometerAlt,
    FaFileUpload,
    FaCalendarAlt,
  } from "react-icons/fa";
  import { MdTimeline } from "react-icons/md";
import { set } from "date-fns";


const ParentDetailsPage = ( {profile} ) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { petId } = location.state || {}; // Access the passed petId

  // State to hold the input values and whether the fields are editable

  const [isEditable, setIsEditable] = useState(false);
  const [petName, setPetName] = useState("");
  const [profilePicture, setProfilePicture] = useState(profile?.picture);
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState( "");
  const [weight, setWeight] = useState(0); // Initial weight state
  const [petType, setPetType] = useState(""); // New state for pet type selection
  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const [foodBrand, setFoodBrand] = useState(""); // New state for pet type selection
  const [quantity, setQuantity] = useState(0);

  // UseEffect to fetch data from a backend or state
    useEffect(() => {
      fetchPetDetails();
    }, []);
      
  
    const fetchPetDetails = async () => {
      if (!profile?.user_id) return;
  
      try {
        const response = await fetch(`http://localhost:5000/api/get_pet_details/${profile.user_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        const matchingPet = data.pet_details.find((pet) => pet.petId === petId);

        setPetName(matchingPet.petName);
        setProfilePicture(matchingPet.profilePicture);
        setBreed(matchingPet.breed);
        setSex(matchingPet.sex);
        setWeight(matchingPet.weight);
        setPetType(matchingPet.petType);
        setAgeYears(matchingPet.ageYears);
        setAgeMonths(matchingPet.ageMonths);
        setFoodBrand(matchingPet.foodBrand);
        setQuantity(matchingPet.quantity);

        
      } catch (error) {
        console.error("Error fetching pet details:", error);
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
    // Here you can add logic to save changes to a backend or state
    const newPetDetails = {
      petId: petId,
      petName: petName,
      profilePicture: profilePicture,
      breed: breed,
      sex: sex,
      weight: weight,
      petType: petType,
      ageYears: ageYears,
      ageMonths: ageMonths,
      foodBrand: foodBrand,
      quantity: quantity,
    };

    try {
      // Send details to backend API
      const response = await fetch(
        "http://localhost:5000/api/update_pet_details",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: profile.user_id, // Replace with actual user ID
            petDetails: newPetDetails,
          }),
        }
      );

      if (response.ok) {
        alert(
          "Pet details saved successfully and sent to the database!"
        );
        navigate("/profile");
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
      <img src={profilePicture} alt={petName} className="pet-photo" />
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
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="tel"
          value={ageYears}
          onChange={(e) => setAgeYears(e.target.value.replace(/[^0-9]/g, ""))} // Keep only numbers
          placeholder="Enter years"
          disabled={!isEditable}
          style={{ marginRight: "5px" }}
        />
        {ageYears && <span>years</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
        <input
          type="tel"
          value={ageMonths}
          onChange={(e) => setAgeMonths(e.target.value.replace(/[^0-9]/g, ""))} // Keep only numbers
          placeholder="Enter months"
          disabled={!isEditable}
          style={{ marginRight: "5px" }}
        />
        {ageMonths && <span>months</span>}
      </div>
    </label>
     
      <label>
        Pet Type:
        <input
          type="text"
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          placeholder="Enter pet type"
          disabled={!isEditable}
        />
      </label>
      <label>
        Sex:
        <input
          type="text"
          value={sex}
          onChange={(e) => setSex(e.target.value)}
          placeholder="Enter sex"
          disabled={!isEditable}
        />
      </label>
      <label>
        Breed:
        <input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Enter breed"
          disabled={!isEditable}
        />
      </label>
      <label>
        Weight (in kg):
        <input
          type="text"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Enter weight"
          disabled={!isEditable}
        />
      </label>
      <label>
        Food Brand:
        <input
          type="text"
          value={foodBrand}
          onChange={(e) => setFoodBrand(e.target.value)}
          placeholder="Enter food brand"
          disabled={!isEditable}
        />
      </label>
      <label>
        Quantity:
        <input
          type="text"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Enter food quantity"
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
