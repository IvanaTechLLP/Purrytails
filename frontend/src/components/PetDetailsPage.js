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
  const [dob, setDob] = useState(""); // New state for date of birth
  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const [foodBrand, setFoodBrand] = useState(""); // New state for pet type selection
  const [quantity, setQuantity] = useState(0);
      const [isOpen, setIsOpen] = useState(false);
      const [menuOpen, setMenuOpen] = useState(false);

      const imageSrc = petType === "dog" ? "dog2.png" : "cat6.png";

  // UseEffect to fetch data from a backend or state
    useEffect(() => {
      fetchPetDetails();
    }, []);
      
    const toggleMobileMenu = () => {
      setMenuOpen(prev => !prev);
      console.log("Menu Toggle");
    };
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
        setDob(matchingPet.dob);
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
      dob: dob,
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
        navigate("/profile-new");
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

  const calculateAgeFromDob = (dobStr) => {
    const dob = new Date(dobStr);
    const now = new Date();
  
    let years = now.getFullYear() - dob.getFullYear();
    let months = now.getMonth() - dob.getMonth();
  
    if (months < 0) {
      years--;
      months += 12;
    }
  
    return { years, months };
  };
  
  

  return (
    
    <div className="dashboard-wrapper-1">
      <nav className="home-nav">
  <div className="home-logo">
    <a href="#">
      <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
    </a>
  </div>

  <ul className="home-nav-links">
  <li onClick={() => { navigate("/home-new");closeMenu();}}><a>Home</a></li>
    <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline");closeMenu();}}><a>Timeline</a></li>
    
    <li>
    <a className="current-link">Profile</a>
  </li>
  </ul>

</nav>
<nav className="phone-mobile-nav">
      <div className="phone-nav-logo">
      <a href="#" className="phone-logo-link">
        <img src="/PT.png" alt="Doctor Dost Logo" className="phone-logo-image" />
      </a>
        </div>

        <button className="phone-hamburger" onClick={toggleMobileMenu}>
          {/* Conditionally render Hamburger or Cross icon */}
          {menuOpen ? '×' : '☰'}
        </button>

       
      </nav>
      <div className={`phone-mobile-menu ${menuOpen ? 'open' : ''}`}>
        <ul className="home-nav-links">
        <li onClick={() => { navigate("/home-new");closeMenu();}}><a>Home</a></li>
      
        <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline");closeMenu();}}><a>Timeline</a></li>
    <li>
    <a className="current-link">Profile</a>
  </li>

          
        </ul>
      </div>
      <div className="heading-with-image-1">
     
  <h4 className="form-heading">Pet Details </h4>
</div>
<div className="left-section-wrapper">
    {/* Left section with pet image and details */}
    <div className="left-pet-container">
      <img src={imageSrc} alt="Pet" className="pet-image" />
      <h2 className="heading-one">{petName}</h2>
      <h3 className="heading-two">{breed}</h3>
    </div>

    {/* Vertical line separating left and right sections */}
    <div className="vertical-line-1"></div>

    {/* Right section with pet details */}
    <div className="right-side-wrapper">
      <div className="right-side-container">
      <p className="pet-detail">
      <span className="age-label">Age : </span>
      <div className="age-container">
        {isEditable ? (
          <>
            <div className="input-box">
              <input
                type="date"
                className="input-dob"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  const age = calculateAgeFromDob(e.target.value);
                  setAgeYears(age.years);
                  setAgeMonths(age.months);
                }}
              />
              <span className="label-text">Date of Birth</span>
            </div>
          </>
        ) : (
          <>
            <span className="age-number">{ageYears}</span>
            <span className="age-unit"> Years</span>
            <span className="age-number">{ageMonths}</span>
            <span className="age-unit"> Months</span>
          </>
        )}
      </div>

      </p>

      <p className="pet-detail">
  <span className="age-label">Sex : </span>
  <span className="age-container">
    {isEditable ? (
      <select
        value={sex}
        onChange={(e) => setSex(e.target.value)}
        className="sex-dropdown"
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
      </select>
    ) : (
      <span className="age-number">{sex}</span>
    )}
  </span>
</p>

<p className="pet-detail">
  <span className="age-label">Weight : </span>
  <span className="age-container">
    <span className="age-number">{weight}</span>
    <span className="age-unit"> Kgs</span>
    <span className="age-number">{ageMonths}</span>
    <span className="age-unit"> Grams</span>
  </span>
</p>

<p className="pet-detail">
  <span className="age-label">Food Brand : </span>
  <span className="age-container">
    {isEditable ? (
      <input
        type="text"
        value={foodBrand}
        onChange={(e) => setFoodBrand(e.target.value)}
        className="text-input"
        placeholder="Enter Food Brand"
      />
    ) : (
      <span className="age-number">{foodBrand}</span>
    )}
  </span>
</p>

<p className="pet-detail">
  <span className="age-label">Quantity : </span>
  <span className="age-container">
    {isEditable ? (
      <input
        type="number"
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        className="text-input"
        placeholder="Enter Quantity"
        min="0"
      />
    ) : (
      <span className="age-number">{quantity}</span>
    )}
  </span>
</p>
{/*}
<p className="pet-detail">
  <span className="age-label">Notes : </span>
  <span className="age-container">
    {isEditable ? (
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-input"
        placeholder="Enter Notes"
      />
    ) : (
      <span className="age-number">{notes || "No Notes"}</span>
    )}
  </span>
</p>
*/}

<div className="edit-button-container">
      <button
        className="edit-button"
        onClick={() => {
          if (isEditable) {
            handleSave(); // Trigger save action when in edit mode
          } else {
            handleEdit(); // Toggle edit mode when not in edit mode
          }
        }}
      >
        {isEditable ? 'Save' : 'Edit Details'}
      </button>
      </div>
      </div>
    </div>
  </div>




    <div className="profile-page" onClick={() => {closeMenu(); }}>
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
      Date of Birth:
      <input
        type="date"
        value={dob}
        onChange={(e) => {
          setDob(e.target.value);
          const age = calculateAgeFromDob(e.target.value);
          setAgeYears(age.years);
          setAgeMonths(age.months);
        }}
        disabled={!isEditable}
      />
    </label>
    <label>
      Age
      <div style={{ display: "flex", alignItems: "center" }}>
        {ageYears && <span>years</span>}
      </div>
      <div style={{ display: "flex", alignItems: "center", marginTop: "5px" }}>
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
