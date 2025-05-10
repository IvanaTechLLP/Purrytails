import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./UserProfilePage.css"; // Ensure your CSS is imported
import Cropper from "cropperjs";
import "cropperjs/dist/cropper.css";


const UserPageNew = ({ profile, logOut, setSelectedPetId, selectedPetId }) => {
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(
    localStorage.getItem("access_token")
  );
const [menuOpen, setMenuOpen] = useState(false);
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
  const [animateLayers, setAnimateLayers] = useState(false);
   const [dob, setDob] = useState("");
  const [layerOrder, setLayerOrder] = useState([
    'layer-3',
    'layer-2',
    'layer-1',
  ]);
  const [isEditing, setIsEditing] = useState(false);
  const [showPopupTerms, setShowPopupTerms] = useState(false);
  const[email,setEmail]= useState("");

  

  const termsHandlePopup = () => {
    setShowPopupTerms(true);
  };

  const termsHandleClosePopup = () => {
    setShowPopupTerms(false);
  };
  
  // Handle the edit button click
  const handleEditClick = () => {
    setIsEditing(true); // Toggle edit mode
  }
 
  const handleSaveClick = async () => {
    setIsEditing(false); // Disable editing
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
  // Toggle dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
    console.log("Dropdown is open:", isDropdownOpen);
  };

  // Handle selection of pet from dropdown

  const handleSelectPet = (petId) => {
    setSelectedPetId(petId); // Close dropdown after selection
    setIsDropdownOpen(false); // Close the dropdown after selecting a pet
    setAnimateLayers(true);

    const newOrder = [...layerOrder];
    const first = newOrder.shift();
    newOrder.push(first);
    setLayerOrder(newOrder);

    setTimeout(() => {
      setAnimateLayers(false); // Stop the animation
    }, 400);
  };

  const [currentStep, setCurrentStep] = useState(1); 
  const handleDropdownSelect = (event) => {
    const petId = event.target.value; // Get petId from dropdown value
    setSelectedPetId(petId); // Close dropdown after selection
    console.log("Selected pet ID:", petId);
  };
  const maxYears = 30; 
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
      dob,
      //ageYears,
      //ageMonths,
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
        "/api/store_pet_details",
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

  const dropdownVariants = {
    hidden: { scaleY: 0, opacity: 0, transformOrigin: "top" },
    visible: {
      scaleY: 1,
      opacity: 1,
      transformOrigin: "top",
      transition: {
        duration: 0.4,
        ease: [0.34, 1.56, 0.64, 1], // spring bounce effect
      },
    },
    exit: {
      scaleY: 0,
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };
  

  const handleDeletePet = async (petId) => {
    try {
      const response = await fetch(`/api/delete_pet_details`, {
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
      const response = await fetch(`/api/share_pet_profile`, {
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
  
  const toggleMobileMenu = () => {
    setMenuOpen(prev => !prev);
    console.log("Menu Toggle");
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

  const dogBreeds1 = [
    { name: "Golden Retriever", imgSrc: "goldenretriever.png" },
    { name: "Chow Chow", imgSrc: "chowchow.png" },
    { name: "Cocker Spaniel", imgSrc: "cockerspaniel.png" },
    { name: "Dachshund", imgSrc: "Dachshund.png" },
    { name: "German Shepherd", imgSrc: "germanshepherd.png" },
    { name: "Husky", imgSrc: "husky.png" },
    { name: "Pomeranian", imgSrc: "pomeranian.png" },
    { name: "Shihtzu", imgSrc: "shihtzu.png" },
    { name: "Beagle", imgSrc: "beagle.png" },
    { name: "Pug", imgSrc: "pug.png" },
    { name: "Labrador", imgSrc: "labrador.png" },
  
    // Next 10
    { name: "Rottweiler", imgSrc: "anubis1.png" },
    { name: "Boxer", imgSrc: "anubis2.png" },
    { name: "Great Dane", imgSrc: "anubis3.png" },
    { name: "Doberman", imgSrc: "anubis4.png" },
    { name: "Indian Spitz", imgSrc: "anubis5.png" },
    { name: "Lhasa Apso", imgSrc: "anubis6.png" },
    { name: "Saint Bernard", imgSrc: "anubis7.png" },
    { name: "Dalmatian", imgSrc: "anubis8.png" },
    { name: "Indie (Desi)", imgSrc: "anubis9.png" },
    { name: "Bullmastiff", imgSrc: "anubis10.png" },
    { name: "PitBull", imgSrc: "anubis11.png" },
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

  const autoFillPetDetails = async () => {
    const newPetDetails = {
      petName: "Pichku",
      breed: "Pekingese Lion",
      petType: "dog",
      sex: "Male",
      weight: "10.5",
      ageYears: "10",
      ageMonths: "9",
      phoneNumber: "123456789",
      ownerAddress: "Mumbai",
      foodBrand: "Pedigree",
      quantity: "100gm",
      profilePicture
    };
    setPetDetails(newPetDetails);

    try {
      // Send details to backend API
      const response = await fetch(
        "/api/store_pet_details",
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
      const response = await fetch(`/api/get_pet_details/${profile.user_id}`, {
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
        `/api/user_dashboard/${profile.user_id}`
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
      console.log(data.sender);
      setEmail(data.email);
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
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
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
  
      if (!petType) newErrors.petType = "Please select a pet type.";
    }
    
  
    setErrors(newErrors);
  
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  useEffect(() => {
    if (email === "darshthakkar09@gmail.com") {
      handlePetTypeSelection("dog");
    }
  }, [email]);

  const handleNextStep = () => {
    if (validateFields()) {
      
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
    }
  };

  if (hasPet && petDetails && petDetails.length > 0 && !isAddingPet) {
    return (
      <div className="dashboard-wrapper-1">
        
        <nav className="home-nav">
        <div className="home-logo" style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        {(email === "darshthakkar09@gmail.com") && (
  <img src="/anubis-tiger.webp" alt="Anubis Mode" className="logo-image" style={{ height: "60px" }} />
)}

  <a href="#">
    <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
  </a>

</div>


  <ul className="home-nav-links">
  <li onClick={() => { navigate("/home-new");closeMenu();}}><a>Home</a></li>
    <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline-new");closeMenu();}}><a>Timeline</a></li>
    
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
      
        <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline-new");closeMenu();}}><a>Timeline</a></li>
    <li>
    <a className="current-link">Profile</a>
  </li>

          
        </ul>
      </div>
    
  
      <div className="pet-details-page" onClick={() => {closeMenu(); }}>
      <div className="heading-with-image-1">
  
  <h4 className="form-heading">Profile</h4>
</div>
{petDetails
  .filter((pet) => pet.petId === selectedPetId)
  .map((pet) => (
    <div key={pet.petId} className="pet-profile-wrapper"> {/* Wrap both for positioning */}
    
      <div className="side-image-container">
        {/* Overlay content on top of the sidebar image */}
        <button 
          className="edit-button-profile-1"
            onClick={() => {
      setIsAddingPet(true); // This assumes you have a state to manage adding a pet
       }}// You can link to your add pet page
        >
          Add Pet
        </button>
        <button 
  className="edit-button-profile-2"
  onClick={(e) => {
    e.stopPropagation();
    openSharePopup(pet.petId);
  }}
>
  <img 
    src="forward.png" 
    alt="share " 
    className="forward-image"
  />
</button>
        
        <div className="overlay-image">
          <img 
            src={pet.profilePicture} 
            alt={pet.petName} 
            className="top-icon" 
            onClick={() => navigate(`/pet-details`, { state: { petId: pet.petId } })}
          />
         <div className="pet-profile-container-1">
  <div className="name-and-icon">
    <p className="profile-name">{pet.petName}</p>
    <img
      src="/Right.png"
      alt="icon"
      className="right-icon"
      onClick={toggleDropdown}
    />
<AnimatePresence>
  {isDropdownOpen && (
    <motion.div
      className="custom-dropdown"
      variants={dropdownVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {petDetails.map((pet) => (
        <div
          key={pet.petId}
          className="custom-dropdown-option"
          onClick={() => handleSelectPet(pet.petId)}
        >
          {pet.petName}
        </div>
      ))}
    </motion.div>
  )}
</AnimatePresence>


  </div>

  <p className="profile-breed">{pet.breed}</p>

  <button
    className="profile-button"
    onClick={() => navigate(`/pet-details`, { state: { petId: pet.petId } })}
  >
    Pet Details
  </button>
</div>
        </div>

        {/* Background sidebar image */}
        <img
  src="/Vector2.png"
  alt="Sidebar Layer 3"
  className={`side-image ${layerOrder[0]} ${animateLayers ? "animate-layer" : ""}`}
/>
<img
  src="/Vector1.png"
  alt="Sidebar Layer 2"
  className={`side-image ${layerOrder[1]} ${animateLayers ? "animate-layer" : ""}`}
/>
<img
  src="/Vector.png"
  alt="Sidebar Base"
  className={`side-image ${layerOrder[2]} ${animateLayers ? "animate-layer" : ""}`}
/>




      </div>

      {/* Vertical line */}
      <div className="vertical-line"></div>

      <div className="right-container">
        <div className="right-inner-container">
          {/* You can add your nested containers here */}
          <div className="container-1">
          <div className="header-container">
    <h2 className="section-heading">Pet Parent’s Details</h2>
    {!isEditing && (
        <button className="edit-button-profile" onClick={handleEditClick}>
          Edit
        </button>
      )}
      {isEditing && (
        <button className="edit-button-profile" onClick={handleSaveClick}>
          Save
        </button>
      )}

  </div>

  <div className="parent-details-container">
        <div className="detail-field">
          <label>Parent Name: </label>
          {isEditing ? (
            <input
              type="text"
              placeholder={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
            />
          ) : (
            <span className="detail-text">{ownerName}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Phone Number: </label>
          {isEditing ? (
            <input
              type="text"
              placeholder={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          ) : (
            <span className="detail-text">{phoneNumber}</span>
          )}
        </div>

        <div className="detail-field">
          <label>Address: </label>
          {isEditing ? (
            <input
              type="text"
              placeholder={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
            />
          ) : (
            <span className="detail-text">{ownerAddress}</span>
          )}
        </div>
      </div>

      
            
          </div>

{(email === "darshthakkar09@gmail.com" || pet.sender === "darshthakkar09@gmail.com") && (
  <div className="container-2">
    <div className="header-container">
      <h2 className="section-heading">Notes From The Anubis-Tiger Foundation</h2>
      <img
        src="anubis-tiger.webp" // Replace with your actual image path
        alt="Add Note"
        className="anubis-profile"
        style={{ cursor: "pointer", width: "auto", height: "44px" }} // You can customize the size here
      
      />
    </div>
    <div className="notes-container">
  {[
    { name: "Toilet Training", file: "Toilet Training Guide .pdf" },
    { name: "Doggy Don'ts 1", file: "🐾 DOGGY DON’TS! 🚫.pdf.pdf" },
    { name: "Doggy Don'ts 2", file: "DOGGY DON’TS!.pdf" },
    { name: "Big Dog Diets", file: "Big Dog Diet.pdf" }
  ].map((note, index) => (
    <div
      key={index}
      className="note-item"
      onClick={() => window.open(`/api/documents/${note.file}`, "_blank")}
    >
      {note.name}
    </div>
  ))}
</div>




  </div>
)}

<div className="container-2">
          <div className="header-container">
    <h2 className="section-heading">Notes</h2>
    <button className="edit-button-profile">
      Add
    </button>
    
  </div>
  
  

  {/* You can add content for container-2 here */}
</div>


<div className="payment-footer">
  {/*}
  <div className="payment-methods">
    Payment Methods
  </div>
  */}

  <div className="right-links">
    <p className="link-text"  onClick={() => {
            logOut();
          
          }}>Logout</p>
    <p className="link-text" onClick={termsHandlePopup} >Terms and Conditions</p>
  </div>
</div>
{showPopupTerms && (
        <div className="popup-overlay-terms">
          <div className="popup-content-terms">
            <h3>Terms and Conditions</h3>
            <div className="terms-scroll-container">
              <p></p>
              <h6 id='terms&conditions'>1. Introduction</h6>
              <p>Welcome to www.purrytails.in (“Website”), owned and operated by IVANA Tech LLP (“Company”, “we”, “us”, or “our”). By accessing or using our Website, you agree to be bound by these Terms and Conditions (“Terms”). If you do not agree with these Terms, you must refrain from using the Website.
              This platform is intended for pet parents, veterinarians, and NGO owners, offering AI-assisted documentation, query resolution, and reminder services tailored for pet care and management.
              </p>
              <h6>2. Services</h6>
              <p>Our services include, but are not limited to:
•	Digital document management for pets.
•	AI-generated query resolution to assist users with pet-related information.
•	Reminder notifications for vaccinations, check-ups, and other pet-care schedules.
•	Multi-profile creation for managing documents and reminders of multiple pets or pet-related entities.
</p>
<h6>3. AI-Generated Medical Information Disclaimer</h6>
<p>The information provided by our assistant is entirely AI-generated and is meant solely for informational purposes. It should not be considered medical advice, diagnosis, or treatment. Always consult a licensed veterinarian before making any health-related decisions for your pets.
You acknowledge and agree that reliance on any AI-generated response is at your own risk.
</p>
<h6>4. Account Creation & Profile Management</h6>
<p>•	Users may create one or more pet profiles under their primary account.
•	Each user’s first profile is treated as the primary usage.
•	Refunds and cancellations, where applicable, will only be entertained for profiles created after the first one.
</p>
<h6>5. Refund Policy</h6>
<p>•	We offer a 7-day refund window from the date of profile creation or digital service activation.
•	Refunds are only applicable to services linked to additional profiles created after the first.
•	No refund will be issued for the first or primary profile.
•	To initiate a refund, please contact info@purrytails.in with your account details and reason for refund.
</p>
<h6>6. User Responsibilities</h6>
<p>By using our Website, you agree that you will:
•	Provide accurate and up-to-date information.
•	Use the services only for lawful and ethical pet-related management.
•	Not misuse the AI assistant for any illegal, harmful, or inappropriate purpose.
•	Not attempt to reverse-engineer, modify, or duplicate the Website or its features.
</p>
<h6>7. Data Protection and Privacy</h6>
<p>We are committed to safeguarding your data. Please refer to our Privacy Policy for more details on how we collect, use, and protect your personal and pet-related information.</p>
    <h6>8. Intellectual Property</h6>  
    <p>All content, designs, logos, and trademarks displayed on this Website are the property of IVANA Tech LLP unless otherwise stated. Unauthorized use, reproduction, or distribution of any material without written permission is strictly prohibited.</p>
      
      <h6>9. Limitation of Liability</h6>
      <p>To the maximum extent permitted under applicable law, IVANA Tech LLP shall not be liable for:
•	Any harm caused by reliance on AI-generated information.
•	Missed reminders or system delays.
•	Data loss resulting from user error or third-party actions.
</p>
<h6>10. Governing Law</h6>
<p>These Terms shall be governed by and construed in accordance with the laws of India, and any disputes arising shall be subject to the jurisdiction of Mumbai courts.</p>
     
   <h6>11. Amendments</h6>
   <p>We may revise these Terms at any time without prior notice. Continued use of the Website constitutes acceptance of the revised Terms.</p>  
     
     <h6>12. Contact</h6>
     <p>If you have any questions or concerns regarding these Terms, please contact us at:
📧 info@purrytails.in
📍 IVANA Tech LLP, Mumbai, India
</p>

<h3>Privacy Policy</h3>
<h6>1. Introduction</h6>
<p>IVANA Tech LLP (“Company”, “we”, “us”, or “our”) is committed to safeguarding the privacy of all users (“you”, “user”) accessing our website www.purrytails.in (“Website”). This Privacy Policy outlines how we collect, use, store, and protect your data, in accordance with the applicable Indian laws, including the Digital Personal Data Protection (DPDP) Act, 2023.
By using our Website and services, you agree to the terms of this Privacy Policy.
</p>
<h6>2. Data We Collect</h6>
<p>We may collect the following categories of personal and pet-related data:</p>
<h7>A. Personal Data</h7>
<p>•	Name
•	Email address
•	Phone number (if provided)
•	Location (optional or inferred)
•	Login credentials
</p>
<h7>B. Pet Profile Data</h7>
<p>•	Pet name, age, breed, gender
•	Medical documents (e.g., prescriptions, vaccination records)
•	Profile images
</p>
<h7>C. System & Usage Data</h7>
<p>•	IP address
•	Browser/device information
•	Activity logs (such as reminders created, assistant interactions)
</p>
<h6>3. How We Use Your Data</h6>
<p>Your data is used for the following purposes:
•	To provide personalized document management and reminder features
•	To offer AI-generated responses for pet-related queries
•	To process profile upgrades and refunds
•	To send important notifications related to vaccinations, check-ups, and pet care
•	To improve our Website and services
We do not use your data for marketing without explicit consent.
</p>
<h6>4. AI-Generated Responses</h6>
<p>Please note: Our AI assistant provides information based on patterns and available data. It does not replace professional veterinary advice. Any medical action should be confirmed with a licensed veterinarian.</p>
     <h6>5. Legal Basis for Data Processing</h6>
     <p>We process your personal data under the following lawful bases:
•	Your explicit consent upon registration and profile creation
•	Fulfillment of service obligations
•	Compliance with legal requirements (if any)
</p>
<h6>6. Data Retention</h6>
<p>We retain your data as long as:
•	You maintain an active account, or
•	Required for legal or operational purposes
You may request deletion of your data at any time (see Section 8).
</p>
<h6>7. Data Sharing</h6>
<p>We do not sell or rent your personal data.
We may share your data:
•	With third-party service providers (e.g., email or notification systems), strictly for service delivery
•	With legal authorities, if mandated by law
All third-party partners are bound by confidentiality and security obligations.
</p>
     <h6>8. Your Rights</h6>
     <p>Under Indian privacy law, you have the right to:
•	Access your personal data
•	Correct or update inaccuracies
•	Withdraw consent
•	Request deletion of your profile/data
•	Register grievances
To exercise any of the above, email us at info@purrytails.in.
</p>
<h6>9. Data Security</h6>
<p>We implement reasonable technical and organizational measures to secure your data, including:
•	Encryption of stored medical files
•	Secure access tokens for user login
•	Firewalls and malware protection
•	Periodic audits and breach response protocols
</p>
<h6>10. Children’s Data</h6>
<p>Our platform is not intended for use by individuals under the age of 18 without parental supervision. We do not knowingly collect data from minors.</p>
     <h6>11. Updates to This Policy</h6>
     <p>We may update this Privacy Policy from time to time to reflect changes in technology, legal requirements, or service features. Users will be notified of significant changes.</p>
     <h6>12. Contact Information</h6>
     <p>For privacy-related concerns, contact:
📧 info@purrytails.in
📍 IVANA Tech LLP, Mumbai, India
</p>
      </div>
      <div className="terms-checkbox">
        <input type="checkbox" id="acceptTerms" required />
        <label htmlFor="acceptTerms">
          I confirm that I have read and accept the Terms and Conditions and Privacy Policy{" "}
        
        </label>
      </div>

            <button onClick={termsHandleClosePopup} className="close-terms-btn">
              Cancel
            </button>
            <button onClick={termsHandleClosePopup} className="close-terms-btn">
              Accept
            </button>
          </div>
        </div>
      )}

          {/* Add more containers as needed */}
        </div>
      </div>

    </div>
  ))}

 
  

{isSharePopupOpen && (
  <div className="share-popup-overlay">
    <div className="share-popup-wrapper">
    <button className="share-popup-close-btn" onClick={closeSharePopup}>
        &times;
      </button>
      <img src="share-popup.png" alt="Popup background" className="share-popup-background-image" />
      <div className="share-popup-content-over-image">
        <h3>Share your pet’s profile</h3>
        <input
          type="email"
          placeholder="Enter Email ID"
          value={shareEmail}
          onChange={(e) => setShareEmail(e.target.value)}
          className="share-popup-email-input"
        />
        <button className="share-popup-share-btn" onClick={handleSharePet}>Share</button>
      </div>
    </div>
  </div>
)}


    
  
 





        {/*
          <div
  className="option-container"
  onClick={() => navigate("/parent-details")}  // Wrap navigate inside an anonymous function
>
  <span className="option-text">View Parent Details</span>
  <span className="arrow-button">→</span>
</div>
       
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
               <div 
          className="option-container"
          onClick={() => {
            logOut();
          
          }}
        >
          <span className="option-text-logout">Logout</span>
          <span className="arrow-button-logout" >→</span>
        </div>
        */}
 
  
      </div>
    </div>
   
    );
  }
  
  return (
    <div className="profile-wrapper-new">
      
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

      <div className="profile-page-new" onClick={() => {closeMenu(); }}>
       
        

    {currentStep === 1 && (
      <div className="profile-wrapper step active">
        <div className="heading-with-image">
  <img
    src="/pawprints 3.png" // replace with your actual image path
    alt="Companion Icon"
    className="companion-icon"
  />
  <h4 className="form-heading">Parent Details</h4>
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


        <div className="form-row-new">
        <label htmlFor="ownerName">
            <span className="asterisk">*</span> Name :
          </label>
          <input
            type="text"
            value={ownerName}
            onChange={(e) => setOwnerName(e.target.value)}
            placeholder="Enter name"
            name="ownerName"
          />
        
        </div>
        {errors.ownerName && <p className="error-text">{errors.ownerName}</p>}
        <div className="form-row-new">
        <label htmlFor="petName">
            <span className="asterisk">*</span> Phone Number :
          </label>
          <input
  type="tel"
  value={phoneNumber}
  onChange={(e) => {
    const input = e.target.value;
    // Allow only digits and max 10 characters
    if (/^\d{0,10}$/.test(input)) {
      setPhoneNumber(input);
    }
  }}
  placeholder="Enter 10-digit phone number"
  name="phoneNumber"
/>

        </div>
        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}
        <div className="form-row-new">
        <label htmlFor="petName">
            <span className="asterisk">*</span> Address :
          </label>
        
          <input
            type="text"
            value={ownerAddress}
            onChange={(e) => setOwnerAddress(e.target.value)}
            placeholder="Enter address"
            name="ownerAddress"
          />
        </div>
        {errors.ownerAddress && <p className="error-text">{errors.ownerAddress}</p>}
      
        
      </div>
    )}



<div
  className={`profile-wrapper ${currentStep >=2 ? 'step-active' : ''}`}
>

  
{currentStep > 1 && (
  <>
    <div className="heading-with-image">
      <img
        src="/pawprints 3.png" // replace with your actual image path
        alt="Companion Icon"
        className="companion-icon"
      />
      <h4 className="form-heading">Companion Details</h4>
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
  </>
)}



  {currentStep === 2 && (
      <div>
        
    

    {/* Pet Name Field */}
    <div className="form-row-new">
    <label htmlFor="petName">
  <span className="asterisk">*</span> Pet Name :
</label>

  <input
    type="text"
    id="petName"
    value={petName}
    onChange={(e) => setPetName(e.target.value)}
    placeholder="Enter pet's name"
    name="petName"
  />
</div>
{errors.petName && <p className="error-text">{errors.petName}</p>}

  

 
    

<div className="form-row-new">
  <label htmlFor="dob">
    <span className="asterisk">*</span> Date of Birth :
  </label>
  <input
    type="date"
    id="dob"
    name="dob"
    value={dob}
    onChange={(e) => setDob(e.target.value)}
    max={new Date().toISOString().split("T")[0]}
    style={{ width: "100%", maxWidth: "300px", padding: "8px" }}
  />
</div>

    
{email !== "darshthakkar09@gmail.com" && (
  <div className="form-row-new column-on-mobile">
    <label htmlFor="petType">
      <span className="asterisk">*</span> Select your Companion:
    </label>
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
  </div>
)}
  </div>
 
)}

{currentStep === 3 && (
  <div>
     
    {/* Sex Selection */}
    <div className="form-row-new column-on-mobile">
    <label htmlFor="petType">
        <span className="asterisk">*</span> Sex :
      </label>
    <div className="sex-selection">
      <div
        className={`sex-option male ${sex === "Male" ? "selected" : ""}`}
        onClick={() => setSex("Male")}
      >
        <img src="male.png" alt="Male" />
        <span className="sex-label">Male</span>
      </div>
      <div
        className={`sex-option female ${sex === "Female" ? "selected" : ""}`}
        onClick={() => setSex("Female")}
      >
        <img src="female.png" alt="Female" />
        <span className="sex-label">Female</span>
      </div>
      
    </div>
    </div>

    {/* Breed Field */}
    <div className="form-row-new">
    <label htmlFor="petBreed">
        <span className="asterisk">*</span> Breed :
      </label>
    <input
      type="text"
      value={breed}
      onChange={(e) => setBreed(e.target.value)}
      placeholder="Enter a breed or choose from the options below"
      name="breed"
    />
    </div>
    <div className="form-row-new column-on-mobile">
    <div className="breed-container">
      {(email === "darshthakkar09@gmail.com"
  ? dogBreeds1
  : petType === "dog"
  ? dogBreeds
  : catBreeds
).map((breedObj, index) => (
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
    </div>
    
  <div className="form-row-new column-on-mobile">
    {/* Weight Field */}
    <label htmlFor="petWeight">
        <span className="asterisk">*</span> Pet Weight :
      </label>
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
             <span className="inside-scroller-text">{index} kg</span> 
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
              <span className="inside-scroller-text">{`0.${index + 1}`} g</span>

            </div>
          ))}
        </div>
      </div>
      <div className="form-row-new">
        <div className="weight-input-container">
  <div className="input-box">
    <input
      type="number"
      id="kg"
      value={Math.floor(weight)}
      onChange={(e) => {
        const newKg = parseInt(e.target.value) || 0;
        setWeight(newKg + (weight % 1)); // retain the decimal
      }}
      placeholder="0"
      name="kg"
      min="0"
      max="100"
    />
    <span className="label-text">Kg</span>
  </div>

  <div className="input-box">
    <input
      type="number"
      id="grams"
      value={Math.round((weight % 1) * 1000)} // convert decimal to grams
      onChange={(e) => {
        let newGrams = parseInt(e.target.value) || 0;
        if (newGrams > 999) newGrams = 999;
        const newDecimal = newGrams / 1000;
        setWeight(Math.floor(weight) + newDecimal);
      }}
      placeholder="0"
      name="grams"
      min="0"
      max="999"
    />
    <span className="label-text">Grams</span>
  </div>
</div>

        </div>
    </div>
  </div>
  
    
</div>
)}


        {currentStep === 4 && (
          <div>
            <div className="form-row-new">
                <label htmlFor="petName">
  <span className="asterisk"></span> Food Brand :
</label>
          <input
            type="text"
            value={foodBrand}
            onChange={(e) => setFoodBrand(e.target.value)}
            placeholder="Enter Food Brand"
            name="foodBrand"
          />
        </div>
        {errors.ownerName && <p className="error-text">{errors.ownerName}</p>}
        <div className="form-row-new">
                <label htmlFor="petName">
  <span className="asterisk"></span> Quantity (by day) :
</label>
          
          <input
            type="tel"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="Enter food quantity"
            name="foodQuantity"
          />
       </div>
        {errors.phoneNumber && <p className="error-text">{errors.phoneNumber}</p>}

        
            <label className="image-heading-1">

              UPLOAD A CUTE PHOTO OF YOUR PET:
              </label>
              <div className="form-row-new">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            
</div> 

            {petPhoto && !croppedPhoto && (
              <div>

                <h4 className="crop-image-heading">Adjust your photo:</h4>
                <div className="form-row-new">
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
                <h4 className="crop-image-heading">Cropped Image:</h4>
                <img className="cropped-image"src={croppedPhoto} alt="Cropped Pet" />
              </div>
            )}
          </div>
        )}

       <div className="form-row-new">
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
      </div>
    </div>
  );
};

export default UserPageNew;
