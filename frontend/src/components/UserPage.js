import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./UserPage.css"; // Ensure your CSS is imported

const UserProfilePage = ({ profile, logOut }) => {
  const navigate = useNavigate();

  const [petName, setPetName] = useState(profile?.petName || '');
  const [breed, setBreed] = useState(profile?.breed || '');
  const [sex, setSex] = useState(profile?.sex || '');
  const [ownerName, setOwnerName] = useState(profile?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [ownerAddress, setOwnerAddress] = useState(profile?.address || '');
  const [petPhoto, setPetPhoto] = useState(null);
  const [petDetails, setPetDetails] = useState(null);
  const [weight, setWeight] = useState(20); // Initial weight state
  const [petType, setPetType] = useState(''); // New state for pet type selection
  const [ageYears, setAgeYears] = useState(0);
  const [ageMonths, setAgeMonths] = useState(0);
  const totalSteps = 5; 

  const [currentStep, setCurrentStep] = useState(1); // New state to track the step

  const maxYears = 25; // Adjust the maximum age as needed
  const maxMonths = 12;
  const yearScrollerRef = useRef(null);
  const monthScrollerRef = useRef(null);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPetPhoto(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePetTypeSelection = (type) => {
    setPetType(type);
    setBreed(''); 
  };

  const handleSave = async () => {
    const newPetDetails = {
      petName,
      breed,
      sex,
      phoneNumber,
      ownerAddress,
      petPhoto,
      petType // Add pet type to saved details
    };
    setPetDetails(newPetDetails);
    console.log('Pet and owner details:', profile.user_id);
    alert('Pet and owner details saved successfully!');

    try {
      // Send details to backend API
      const response = await fetch('http://localhost:5000/api/store_pet_details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: profile.user_id, // Replace with actual user ID
          petDetails: newPetDetails,
        }),
      });
  
      if (response.ok) {
        alert('Pet and owner details saved successfully and sent to the database!');
      } else {
        const errorData = await response.json();
        console.error('Failed to save data:', errorData);
        alert('Failed to send data to the database. Please try again.');
      }
    } catch (error) {
      console.error('Error sending data to the backend:', error);
      alert('An error occurred while sending data. Please try again.');
    }
  };
  

  const handleBreedSelection = (selectedBreed) => {
    setBreed(selectedBreed);
  };
  const dogBreeds = [
    { name: 'Golden Retriever', imgSrc: 'goldenretriever.png' },
    { name: 'Chow Chow', imgSrc: 'chowchow.png' },
    { name: 'Cocker Spaniel', imgSrc: 'cockerspaniel.png' },
    { name: 'Dachshund', imgSrc: 'Dachshund.png' },
    { name: 'German Shepherd', imgSrc: 'germanshepherd.png' },
    { name: 'Husky', imgSrc: 'husky.png' },
    { name: 'Pomeranian', imgSrc: 'pomeranian.png' },
    { name: 'Shihtzu ', imgSrc: 'shihtzu.png' },
    { name: 'Beagle ', imgSrc: 'beagle.png' },
    { name: 'Pug ', imgSrc: 'pug.png' },
    {name:"Labrador", imgSrc:'labrador.png'}
  ];

  const catBreeds = [
    { name: 'Siamese', imgSrc: 'siamese.png' },
    { name: 'Persian', imgSrc: 'persiancat.png' },
    { name: 'Maine Coon', imgSrc: 'mainecoon.png' },
    { name: 'Bengal', imgSrc: 'bengalcat.png' },
    { name: 'Abyssinian', imgSrc: 'abyssinian.png' },
    { name: 'Himalayan', imgSrc: 'himalayancat.png' },
    { name: 'Sphynx', imgSrc: 'sphynxcat.png' },
    { name: 'Egyptian Mau', imgSrc: 'egyptianmau.png' },
    { name: 'Tonkinese ', imgSrc: 'tonkinesecat.png' },
    { name: 'Indie', imgSrc: 'indiecat.png' },
  ]

  useEffect(() => {
    const scrollToSelected = (scrollerRef, selectedIndex) => {
      const scroller = scrollerRef.current;
      if (scroller) {
        const item = scroller.children[selectedIndex];
        if (item) {
          const offset = item.offsetLeft - (scroller.clientWidth / 2) + (item.clientWidth / 2);
          scroller.scrollTo({
            left: offset,
            behavior: "smooth"
          });
        }
      }
    };

    // Scroll the year scroller
    scrollToSelected(yearScrollerRef, ageYears);

    // Scroll the month scroller
    scrollToSelected(monthScrollerRef, ageMonths);

  }, [ageYears, ageMonths]);

  // Handle Step Navigation
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, 5)); // Assuming you have 5 steps
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 1)); // Prevent going below 1
  };
   // Calculate the progress as a percentage
   const progress = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li>View QR Code</li>
          <li onClick={() => navigate("/file_upload")}>Upload Reports</li>
          <li onClick={() => navigate("/calendar")}>Calendar</li>
        </ul>
        <ul className="logout-button">
          <li onClick={logOut}>Log Out</li>
        </ul>
      </div>

      <div className="profile-page">
        <div className="profile-header"></div>
      <div class="profile-image-container">
        <img src={profile.picture} alt="user" className="profile-image" />
        </div>
        
        <div className="additional-details">
          
          <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
        <div className="paw-icons-container">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={`paw-icon ${index < currentStep ? "completed" : ""}`}
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
            <div>
              <h4>Pet Parent Details</h4>
              <label>
                Owner's Name:
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Enter owner's name"
                />
              </label>
              <label>
                Phone Number:
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter owner's phone number"
                />
              </label>
              <label>
                Address:
                <input
                  type="text"
                  value={ownerAddress}
                  onChange={(e) => setOwnerAddress(e.target.value)}
                  placeholder="Enter owner's address"
                />
              </label>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h4>Companion Details</h4>
              <label>
                Pet Name:
                <input
                  type="text"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="Enter pet's name"
                />
              </label>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <label>
                Age
              </label>
              <div className="age-picker">
                <div className="scroller-container">
                  <div className="year-scroller" ref={yearScrollerRef}>
                    {Array.from({ length: maxYears + 1 }, (_, i) => i).map((year, index) => (
                      <div 
                        key={index} 
                        className={`scroller-item ${ageYears === year ? 'selected' : ''}`} 
                        onClick={() => setAgeYears(year)}
                      >
                        {year} {year === 1 ? 'Year' : 'Years'}
                      </div>
                    ))}
                  </div>

                  <div className="month-scroller" ref={monthScrollerRef}>
                    {Array.from({ length: maxMonths }, (_, i) => i).map((month, index) => (
                      <div 
                        key={index} 
                        className={`scroller-item ${ageMonths === month ? 'selected' : ''}`} 
                        onClick={() => setAgeMonths(month)}
                      >
                        {month} {month === 1 ? 'Month' : 'Months'}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="pet-type-selection">
            
              <div
                className={`pet-option ${petType === 'dog' ? 'selected' : ''}`}
                onClick={() => handlePetTypeSelection('dog')}
              >
                <img src="dog.png" alt="Dog" />
                
              </div>
              <div
                className={`pet-option ${petType === 'cat' ? 'selected' : ''}`}
                onClick={() => handlePetTypeSelection('cat')}
              >
                <img src="cat.png" alt="Cat" />
                
              </div>
            </div>
            </div>
            
          )}

          {currentStep === 3 && (
            <div>
              <label>
              Sex:
              <div className="sex-selection">
                <div 
                  className={`sex-option male ${sex === 'Male' ? 'selected' : ''}`} 
                  onClick={() => setSex('Male')}
                >
                  <img src="male.png" alt="Male" />

                </div>
                <div 
                  className={`sex-option female ${sex === 'Female' ? 'selected' : ''}`} 
                  onClick={() => setSex('Female')}
                >
                  <img src="female.png" alt="Female" />
                  
                </div>
              </div>
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Other"
            />
            <div className="breed-container">
            
            {(petType === 'dog' ? dogBreeds : catBreeds).map((breedObj, index) => (
            <div
            key={index}
            className={`breed-option ${breed === breedObj.name ? 'selected' : ''}`}
            onClick={() => handleBreedSelection(breedObj.name)}
            style={{
              borderColor: breed === breedObj.name ? (sex === 'Male' ? 'blue' : 'pink') : 'transparent',
               backgroundColor: breed === breedObj.name ? (sex === 'Male' ? '#e0f7ff' : '#fff3fa') : '#f9f9f9'
            }}
            >
            <img src={breedObj.imgSrc} alt={breedObj.name} />
            <p>{breedObj.name}</p>
            </div>
              ))}
            </div>
            
      <label>
      Weight (kg):
    </label>
      <div className="weight-picker">
        <div className="scroller-container">
          <div className="year-scroller">
            {/* Before decimal (integer part) scroller */}
            {[...Array(101)].map((_, index) => (
              <div 
                key={index} 
                className={`scroller-item ${weight === index ? 'selected' : ''}`}
                onClick={() => setWeight(index)}
              >
                {index} kg
              </div>
            ))}
          </div>
          <div className="month-scroller" >
            {/* After decimal (fractional part) scroller */}
            {[...Array(9)].map((_, index) => (
              <div 
                key={index} 
                className={`scroller-item ${weight === (index + 0.1) ? 'selected' : ''}`}
                onClick={() => setWeight((prev) => Math.floor(prev) + (index + 1) / 10)}
              >
                {`0.${index + 1}`} g
              </div>
            ))}
          </div>
        </div>
        <div className="weight-display">
          {weight} kg
        </div>
      </div>

            </div>
          )}

{currentStep === 4 && (
            <div>
                <label>
              Upload a Cute Photo of Your Pet:
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </label>
            {petPhoto && (
              <div className="pet-photo-preview">
                <h4>Preview:</h4>
                <img src={petPhoto} alt="Pet Preview" />
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
            <span className="arrow next-arrow" onClick={nextStep}>
              &#8594; {/* Right arrow */}
            </span>
          ) : (
            <button className="save-button" onClick={handleSave}>Save</button>
          )}
        </div>
        </div>
      </div>
    
  );
};

export default UserProfilePage;
