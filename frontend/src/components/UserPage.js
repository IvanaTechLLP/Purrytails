import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./UserPage.css"; // Ensure your CSS is imported
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";
import {
  FaSignOutAlt,
  FaComments,
  FaHome,
  FaTachometerAlt,
  FaFileUpload,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdTimeline } from "react-icons/md";

const UserProfilePage = ({ profile, logOut, setSelectedPetId, selectedPetId }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );

  const [profilePicture, setProfilePicture] = useState(profile?.picture);
  const [petName, setPetName] = useState(profile?.petName || "");
  const [breed, setBreed] = useState(profile?.breed || "");
  const [sex, setSex] = useState(profile?.sex || "");
  const [ownerName, setOwnerName] = useState(profile?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || "");
  const [ownerAddress, setOwnerAddress] = useState(profile?.address || "");
  const [hasPet, setHasPet] = useState(false);
  const [isAddingPet, setIsAddingPet] = useState(false);
  const [petDetails, setPetDetails] = useState(null);
  const [weight, setWeight] = useState(0); // Initial weight state
  const [petType, setPetType] = useState(""); // New state for pet type selection
  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const totalSteps = 5;
  const [petPhoto, setPetPhoto] = useState(null); // Original uploaded image
  const [croppedPhoto, setCroppedPhoto] = useState(null); // Final cropped photo
  const imageRef = useRef(null); // Reference for the uploaded image element
  const cropperRef = useRef(null); // Reference for Cropper instance
  const [isOpen, setIsOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [foodBrand, setFoodBrand] = useState(""); // New state for pet type selection
  const [quantity, setQuantity] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [sharePetId, setSharePetId] = useState(null);

  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    console.log("Dropdown is open:", isDropdownOpen);
  };

  // Handle selection of pet from dropdown
  const handleDropdownSelect = (event) => {
    const petId = event.target.value; // Get petId from dropdown value
    setSelectedPetId(petId); // Close dropdown after selection
    console.log("Selected pet ID:", petId);
  };
  

  const [currentStep, setCurrentStep] = useState(1); // New state to track the step

  const maxYears = 25; // Adjust the maximum age as needed
  const maxMonths = 12;
  const yearScrollerRef = useRef(null);
  const monthScrollerRef = useRef(null);

  const handlePetTypeSelection = (type) => {
    setPetType(type);
    setBreed("");
  };

  const handleSave = async () => {
    const newPetDetails = {
      petName,
      breed,
      petType,
      sex,
      weight,
      ageYears,
      ageMonths,
      phoneNumber,
      ownerAddress,
      foodBrand,
      quantity,
      profilePicture,
    };
    setPetDetails(newPetDetails);

    try {
      // Send details to backend API
      const response = await fetch(
        "http://localhost:5000/api/store_pet_details",
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
          "Pet and owner details saved successfully and sent to the database!"
        );
        window.location.reload();
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

  const handleDeletePet = async (petId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete_pet_details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_id: profile.user_id,
          pet_id: petId, 
        }),
      });
  
      if (response.ok) {
        console.log(`Pet with ID ${petId} deleted successfully.`);
        // Optionally refresh the pet list or remove the pet locally
        setPetDetails((prevPets) => prevPets.filter((pet) => pet.petId !== petId));
      } else {
        const errorData = await response.json();
        console.error(`Failed to delete pet: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  const openSharePopup = (petId) => {
    setSharePetId(petId);
    setIsSharePopupOpen(true);
  };

  const closeSharePopup = () => {
    setShareEmail("");
    setSharePetId(null);
    setIsSharePopupOpen(false);
  };

  const handleSharePet = async () => {
    if (!shareEmail || !sharePetId) {
      alert("Please enter a valid email.");
      return;
    }
  
    try {
      const response = await fetch(`http://localhost:5000/api/share_pet_profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          user_id: profile.user_id,
          pet_id: sharePetId, 
          email: shareEmail,
        }),
      });
  
      if (response.ok) {
        console.log("Pet profile shared successfully!");
        alert("Pet profile shared successfully!");
        closeSharePopup();
        window.location.reload();
      } else {
        const errorData = await response.json();
        console.error(`Failed to share pet profile: ${errorData.message}`);
        alert("Failed to share pet profile.");
      }
    } catch (error) {
      console.error("Error sharing pet profile:", error);
      alert("Error sharing pet profile.");
    }
  };
  
  

  const handleBreedSelection = (selectedBreed) => {
    setBreed(selectedBreed);
  };
  const dogBreeds = [
    { name: "Golden Retriever", imgSrc: "goldenretriever.png" },
    { name: "Chow Chow", imgSrc: "chowchow.png" },
    { name: "Cocker Spaniel", imgSrc: "cockerspaniel.png" },
    { name: "Dachshund", imgSrc: "Dachshund.png" },
    { name: "German Shepherd", imgSrc: "germanshepherd.png" },
    { name: "Husky", imgSrc: "husky.png" },
    { name: "Pomeranian", imgSrc: "pomeranian.png" },
    { name: "Shihtzu ", imgSrc: "shihtzu.png" },
    { name: "Beagle ", imgSrc: "beagle.png" },
    { name: "Pug ", imgSrc: "pug.png" },
    { name: "Labrador", imgSrc: "labrador.png" },
  ];

  const catBreeds = [
    { name: "Siamese", imgSrc: "siamese.png" },
    { name: "Persian", imgSrc: "persiancat.png" },
    { name: "Maine Coon", imgSrc: "mainecoon.png" },
    { name: "Bengal", imgSrc: "bengalcat.png" },
    { name: "Abyssinian", imgSrc: "abyssinian.png" },
    { name: "Himalayan", imgSrc: "himalayancat.png" },
    { name: "Sphynx", imgSrc: "sphynxcat.png" },
    { name: "Egyptian Mau", imgSrc: "egyptianmau.png" },
    { name: "Tonkinese ", imgSrc: "tonkinesecat.png" },
    { name: "Indie", imgSrc: "indiecat.png" },
  ];

  const scrollToSelected = (scrollerRef, selectedIndex) => {
    const scroller = scrollerRef.current;
    if (scroller) {
      const item = scroller.children[selectedIndex];
      if (item) {
        const offset =
          item.offsetLeft - scroller.clientWidth / 2 + item.clientWidth / 2;
        scroller.scrollTo({
          left: offset,
          behavior: "smooth",
        });
      }
    }
  };

  // Simulating an API call to check if the user has a registered pet
  const fetchUserPetStatus = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/get_pet_details/${profile.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Pet data:", data.pet_details);
        if (data && data.pet_details && data.pet_details.length > 0) {
          console.log("User has a pet!");
          setHasPet(true);
          setPetDetails(data.pet_details);
          setSelectedPetId(data.pet_details[0].petId);
        } else {
          setHasPet(false);
        }
      } else {
        console.error("Failed to fetch pet data.");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };

  const fetchUserDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/user_dashboard/${profile.user_id}`
      );
      const data = await response.json();
      setOwnerName(data.name);
      // Set phone number only if it is not empty
      if (data.phone_number) {
        setPhoneNumber(data.phone_number);
      }

      // Set owner address only if it is not empty
      if (data.owner_address) {
        setOwnerAddress(data.owner_address);
      }
      console.log("User details fetched:", data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    if (!accessToken) {
      console.log("No access token found. Redirect to login.");
      return;
    }

    if (profile?.user_id) {

      fetchUserPetStatus();
      fetchUserDetails();
      // Scroll the year scroller
      scrollToSelected(yearScrollerRef, ageYears);

      // Scroll the month scroller
      scrollToSelected(monthScrollerRef, ageMonths);

      setProfilePicture(profile.picture);
    }
  }, [ageYears, ageMonths, accessToken, profile?.user_id]);

  // Handle Step Navigation
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 5)); // Assuming you have 5 steps
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1)); // Prevent going below 1
  };
  // Calculate the progress as a percentage
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPetPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initializeCropper = () => {
    if (petPhoto && cropperRef.current) {
      cropperRef.current = new Cropper(cropperRef.current, {
        aspectRatio: 1,
        viewMode: 1,
        movable: false,
        zoomable: false,
        scalable: false,
      });
    }
  };

  const handleCrop = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 300,
        height: 300,
      });
      const croppedDataUrl = canvas.toDataURL("image/png");
      setCroppedPhoto(croppedDataUrl);
      setProfilePicture(croppedDataUrl); // Update immediately
    }
  };

  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };
  const validateFields = () => {
    const newErrors = {};
  
    if (currentStep === 1) {
      if (!ownerName.trim()) newErrors.ownerName = "Owner's name is required.";
      if (!phoneNumber.trim()) newErrors.phoneNumber = "Phone number is required.";
      if (!ownerAddress.trim()) newErrors.ownerAddress = "Address is required.";
    }
  
    if (currentStep === 2) {
      if (!petName.trim()) newErrors.petName = "Pet name is required.";
      if (!ageYears || !ageMonths) newErrors.age = "Please select both age and months.";
      if (!petType) newErrors.petType = "Please select a pet type.";
    }
    if (currentStep === 3) {
      if (!sex) newErrors.sex = "Please select a sex.";
      if (!breed.trim()) newErrors.breed = "Please select or enter a breed.";
      if (!weight || weight <= 0) newErrors.weight = "Please select a valid weight.";
    }
  
    setErrors(newErrors);
  
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };
  
  const handleNextStep = () => {
    if (validateFields()) {
      
      setCurrentStep(currentStep + 1);
    }
  };

  if (hasPet && petDetails && petDetails.length > 0 && !isAddingPet) {
    return (
      <div className="dashboard-wrapper">
        
        <div classname="dashboard-left">
        <div className="header">
 
 <button className="hamburger" onClick={handleToggle}>
                 &#9776;
               </button>
               <h1 className="calendar-title">Profile</h1>
</div>
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
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
          <div className="logout-container-dash">
            <ul>
              <li
                onClick={() => {
                  logOut();
                  closeMenu();
                }}
                className="logout-button"
              >
                <FaSignOutAlt />
              </li>
            </ul>
          </div>
        </div>
      </div>
    
  
      <div className="pet-details-page">
      <h1 className="image-upload-title">Profile</h1>
        
 
  <div className="profile-page">
  <div className="pet-list">
  {petDetails.map((pet, index) => (
      <div 
        key={index} 
        className={`pet-item-container ${
        selectedPetId === pet.petId ? "selected" : ""
        }`}
        onClick={() => navigate(`/pet-details`, { state: { petId: pet.petId } })}   >
        <div className="pet-item">
          <img src={pet.profilePicture} alt={pet.name} className="pet-photo" />
          <div className="pet-info">
            <h2>{pet.petName}</h2>
            <p> {pet.breed}</p>
          </div>
          {/* Highlight selected pet */}
          {selectedPetId === pet.petId && <span className="selected-text">Selected Pet</span>}
          {/* Delete Button */}
          <button
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation on delete
              handleDeletePet(pet.petId);
            }}
          >
            Delete
          </button>

          {/* Share Button */}
          <button
            className="share-button"
            onClick={(e) => {
              e.stopPropagation(); // Prevent navigation
              openSharePopup(pet.petId);
            }}
          >
            Share
          </button>

          {/* <button
            className="select-button"
            onClick={() => handleSelectPet(pet.petId)}
          >
            Select
          </button>
          {selectedPetId === pet.petId && <span className="selected-text">Selected Pet</span>} */}
        </div>
      </div>
    ))}

    {/* Share Popup */}
    {isSharePopupOpen && (
      <div className="share-popup">
        <div className="share-popup-content">
          <h3>Share Pet Profile</h3>
          <input
            type="email"
            placeholder="Enter email ID"
            value={shareEmail}
            onChange={(e) => setShareEmail(e.target.value)}
            className="share-email-input"
          />
          <div className="share-popup-actions">
            <button onClick={handleSharePet}>Send</button>
            <button onClick={closeSharePopup}>Cancel</button>
          </div>
        </div>
      </div>
    )}

    
    {/* Universal dropdown */}
    <div className="dropdown-container">
        <select
          className="pet-dropdown"
          value={selectedPetId || ""}
          onChange={(event) => handleDropdownSelect(event)}
        >
          <option value="" disabled>
            Select a Pet
          </option>
          {petDetails.map((pet) => (
            <option key={pet.petId} value={pet.petId}>
              {pet.petName}
            </option>
          ))}
        </select>
      </div>
  </div>

  {/* Add Pet Button */}
  <button
    className="add-pet-button"
    onClick={() => {
      setIsAddingPet(true); // This assumes you have a state to manage adding a pet
    }}
  >
    Add Pet
  </button>

  <div className="options-list">
  <div
  className="option-container"
  onClick={() => navigate("/parent-details")}  // Wrap navigate inside an anonymous function
>
  <span className="option-text">View Parent Details</span>
  <span className="arrow-button">→</span>
</div>
        {/*
       
        <div 
          className="option-container"
          
        >
          <span className="option-text">Change Payment Method</span>
          <span className="arrow-button">→</span>
        </div>
        <div 
          className="option-container"
          
        >
          <span className="option-text">Get Help</span>
          <span className="arrow-button">→</span>
        </div>
        */}
        <div 
          className="option-container"
          onClick={() => {
            logOut();
          
          }}
        >
          <span className="option-text-logout">Logout</span>
          <span className="arrow-button-logout" >→</span>
        </div>
      </div>
      </div>
    </div>
    </div>
    );
  }
  
  return (
    <div className="dashboard-wrapper">
      
      <div classname="dashboard-left">
      <div className="header">
        <button className="hamburger" onClick={handleToggle}>
                 &#9776;
               </button>
 
  <h1 className="calendar-title">Profile</h1>
</div>
        <div className={`sidebar ${isOpen ? "open" : ""}`}>
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
          <div className="logout-container-dash">
            <ul>
              <li
                onClick={() => {
                  logOut();
                  closeMenu();
                }}
                className="logout-button"
              >
                <FaSignOutAlt />
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="profile-page">
        <div className="header">
        <h1 className="calendar-title">Profile</h1></div>
        <div className="profile-header"></div>
        <div class="profile-image-container">
          <img src={profilePicture} alt="user" className="profile-image" />
        </div>

        <div className="additional-details">
          <div className="progress-bar-container">
            <div
              className="progress-bar"
              style={{ width: `${progress}%` }}
            ></div>
            <div className="paw-icons-container">
              {Array.from({ length: totalSteps }).map((_, index) => (
                <div
                  key={index}
                  className={`paw-icon ${
                    index < currentStep ? "completed" : ""
                  }`}
                >
                  <img
                    src={index < currentStep ? "paw.png" : "paw.png"}
                    alt="paw"
                    className="paw-icon-img"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

    {currentStep === 1 && (
      <div className="form-container">
        <h4 className="h4-heading">PET PARENT DETAILS</h4>
        <label>
          Owner's Name *: 
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Enter name"
          />
        </label>
        {errors.ownerName && <p className="error-text">{errors.ownerName}</p>}
        <label>
          Phone Number *:
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Enter phone number"
          />
        </label>
        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
        <label>
          Address *:
          <input
            type="text"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            placeholder="Enter address"
          />
        </label>
        {errors.ownerAddress && <p className="error-text">{errors.ownerAddress}</p>}
      
        
      </div>
    )}

{currentStep === 2 && (
  <div>
    <h4 className="h4-heading">COMPANION DETAILS</h4>

    {/* Pet Name Field */}
    <label>
      Pet Name *:
      <input
        type="text"
        value={petName}
        onChange={(e) => setPetName(e.target.value)}
        placeholder="Enter pet's name"
      />
    </label>
    {errors.petName && <p className="error-text">{errors.petName}</p>}
    </div>
  )}
  {currentStep === 2 && (
      <div>
    {/* Age Field */}
    <label>Age *:</label>
    <div className="age-picker">
      <div className="scroller-container">
        <div className="year-scroller" ref={yearScrollerRef}>
          {Array.from({ length: maxYears + 1 }, (_, i) => i).map(
            (year, index) => (
              <div
                key={index}
                className={`scroller-item ${
                  ageYears === year ? "selected" : ""
                }`}
                onClick={() => setAgeYears(year)}
              >
                {year} {year === 1 ? "Year" : "Years"}
              </div>
            )
          )}
        </div>

        <div className="month-scroller" ref={monthScrollerRef}>
          {Array.from({ length: maxMonths }, (_, i) => i).map(
            (month, index) => (
              <div
                key={index}
                className={`scroller-item ${
                  ageMonths === month ? "selected" : ""
                }`}
                onClick={() => setAgeMonths(month)}
              >
                {month} {month === 1 ? "Month" : "Months"}
              </div>
            )
          )}
        </div>
      </div>

      <div className="age-display">
        {ageYears} years and {ageMonths} months
      </div>
    </div>
    {(!ageYears || !ageMonths) && (
      <p className="error-text">Please select both age and months.</p>
    )}

    {/* Pet Type Field */}
    <label>Select Your Loyal Companion *:</label>
    <div className="pet-type-selection">
      <div
        className={`pet-option ${petType === "dog" ? "selected" : ""}`}
        onClick={() => handlePetTypeSelection("dog")}
      >
        <img src="dog.png" alt="Dog" />
      </div>
      <div
        className={`pet-option ${petType === "cat" ? "selected" : ""}`}
        onClick={() => handlePetTypeSelection("cat")}
      >
        <img src="cat.png" alt="Cat" />
      </div>
    </div>
    {!petType && <p className="error-text">Please select a pet type.</p>}
  </div>
)}

{currentStep === 3 && (
  <div>
    {/* Sex Selection */}
    <label>Sex *:</label>
    <div className="sex-selection">
      <div
        className={`sex-option male ${sex === "Male" ? "selected" : ""}`}
        onClick={() => setSex("Male")}
      >
        <img src="male.png" alt="Male" />
      </div>
      <div
        className={`sex-option female ${sex === "Female" ? "selected" : ""}`}
        onClick={() => setSex("Female")}
      >
        <img src="female.png" alt="Female" />
      </div>
    </div>
    {!sex && <p className="error-text">Please select a sex.</p>}

    {/* Breed Field */}
    <label>Breed *:</label>
    <input
      type="text"
      value={breed}
      onChange={(e) => setBreed(e.target.value)}
      placeholder="Other"
    />
    <div className="breed-container">
      {(petType === "dog" ? dogBreeds : catBreeds).map((breedObj, index) => (
        <div
          key={index}
          className={`breed-option ${
            breed === breedObj.name ? "selected" : ""
          }`}
          onClick={() => handleBreedSelection(breedObj.name)}
          style={{
            borderColor:
              breed === breedObj.name
                ? sex === "Male"
                  ? "blue"
                  : "pink"
                : "transparent",
            backgroundColor:
              breed === breedObj.name
                ? sex === "Male"
                  ? "#e0f7ff"
                  : "#fff3fa"
                : "#f9f9f9",
          }}
        >
          <img src={breedObj.imgSrc} alt={breedObj.name} />
          <p>{breedObj.name}</p>
        </div>
      ))}
    </div>
    {!breed && <p className="error-text">Please select or enter a breed.</p>}

    {/* Weight Field */}
    <label>Weight (kg) *:</label>
    <div className="weight-picker">
      <div className="scroller-container">
        <div className="year-scroller">
          {/* Before decimal (integer part) scroller */}
          {[...Array(101)].map((_, index) => (
            <div
              key={index}
              className={`scroller-item ${
                weight === index ? "selected" : ""
              }`}
              onClick={() => setWeight(index)}
            >
              {index} kg
            </div>
          ))}
        </div>
        <div className="month-scroller">
          {/* After decimal (fractional part) scroller */}
          {[...Array(9)].map((_, index) => (
            <div
              key={index}
              className={`scroller-item ${
                weight === index + 0.1 ? "selected" : ""
              }`}
              onClick={() =>
                setWeight((prev) => Math.floor(prev) + (index + 1) / 10)
              }
            >
              {`0.${index + 1}`} g
            </div>
          ))}
        </div>
      </div>
      <div className="weight-display">{weight} kg</div>
    </div>
    {(!weight || weight <= 0) && (
      <p className="error-text">Please select a valid weight.</p>
    )}
  </div>
)}


        {currentStep === 4 && (
          <div>
            <label>
          Food Brand :
          <input
            type="text"
            value={foodBrand}
            onChange={(e) => setFoodBrand(e.target.value)}
            placeholder="Enter Food Brand"
          />
        </label>
        {errors.ownerName && <p className="error-text">{errors.ownerName}</p>}
        <label>
          Quantity(by day) :
          <input
            type="tel"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter food quantity"
          />
        </label>
        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
            <label className="image-heading">
              UPLOAD A CUTE PHOTO OF YOUR PET:
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>

            {petPhoto && !croppedPhoto && (
              <div>
                <h4>Adjust your photo:</h4>
                <div>
                  <img
                    ref={cropperRef}
                    src={petPhoto}
                    alt="Pet Preview"
                    onLoad={initializeCropper}
                    style={{ maxWidth: "100%" }}
                  />
                </div>
                <button onClick={handleCrop}>Crop Image</button>
              </div>
            )}

            {croppedPhoto && (
              <div>
                <h4>Cropped Image:</h4>
                <img src={croppedPhoto} alt="Cropped Pet" />
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="step-navigation">
          {currentStep > 1 && (
            <span className="arrow prev-arrow" onClick={prevStep}>
              &#8592; {/* Left arrow */}
            </span>
          )}
          {currentStep < 4 ? (
            <span className="arrow next-arrow" onClick={handleNextStep}>
              &#8594; {/* Right arrow */}
            </span>
          ) : (
            <button className="save-button" onClick={handleSave}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
