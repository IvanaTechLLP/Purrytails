import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./UserPage.css"; // Ensure your CSS is imported

const UserProfilePage = ({ profile, logOut }) => {
  const navigate = useNavigate();

  // State to hold additional pet details and owner information
  const [petName, setPetName] = useState(profile?.petName || '');
  const [birthYear, setBirthYear] = useState(profile?.birthYear || '');
  const [breed, setBreed] = useState(profile?.breed || '');
  const [sex, setSex] = useState(profile?.sex || '');
  const [ownerName, setOwnerName] = useState(profile?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.phoneNumber || '');
  const [ownerAddress, setOwnerAddress] = useState(profile?.address || ''); // New field for owner's address
  const [petPhoto, setPetPhoto] = useState(null);
  const [petDetails, setPetDetails] = useState(null); // New state for saved pet details
  const [flipped, setFlipped] = useState(false); // To handle card flipping

  if (!profile) {
    return <p>Loading...</p>;
  }

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

  const handleSave = () => {
    const newPetDetails = {
      petName,
      birthYear,
      breed,
      sex,
      ownerName,
      phoneNumber,
      ownerAddress,
      petPhoto,
    };
    setPetDetails(newPetDetails);
    alert('Pet and owner details saved successfully!');
  };

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div className="dashboard-wrapper">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li>View QR Code</li>
          <li onClick={handleUploadFile}>Upload Reports</li>
          <li onClick={() => navigate("/calendar")}>Calendar</li>
        </ul>
        <ul className="logout-button">
          <li onClick={logOut}>Log Out</li>
        </ul>
      </div>

      <div className="profile-page">
        <img src={profile.picture} alt="user" className="profile-image" />
        <p>Name: {profile.name}</p>
        <p>Email: {profile.email}</p>

        {/* Additional Pet and Pet Parent Details Carousel */}
        <div className="additional-details">
  <h2>Details</h2>
  <h3>Add These details to complete your Pet's Profile</h3>
  <Slider {...settings}>
    <div className="slide">
      <img src="/path/to/pet-icon.png" alt="Pet Icon" className="slide-image" />
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
    <div className="slide">
      <img src="/path/to/birthday-icon.png" alt="Birthday Icon" className="slide-image" />
      <label>
        Birth Year:
        <input
          type="number"
          value={birthYear}
          onChange={(e) => setBirthYear(e.target.value)}
          placeholder="Enter pet's birth year"
        />
      </label>
    </div>
    <div className="slide">
      <img src="/path/to/breed-icon.png" alt="Breed Icon" className="slide-image" />
      <label>
        Breed:
        <input
          type="text"
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Enter pet's breed"
        />
      </label>
    </div>
    <div className="slide">
      <img src="/path/to/sex-icon.png" alt="Sex Icon" className="slide-image" />
      <label>
        Sex:
        <select value={sex} onChange={(e) => setSex(e.target.value)}>
          <option value="">Select</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
      </label>
    </div>
    <div className="slide">
      <img src="/path/to/owner-icon.png" alt="Owner Icon" className="slide-image" />
      <label>
        Owner's Name:
        <input
          type="text"
          value={ownerName}
          onChange={(e) => setOwnerName(e.target.value)}
          placeholder="Enter owner's name"
        />
      </label>
    </div>
    <div className="slide">
      <img src="/path/to/phone-icon.png" alt="Phone Icon" className="slide-image" />
      <label>
        Phone Number:
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter owner's phone number"
        />
      </label>
    </div>
    <div className="slide">
      <img src="/path/to/address-icon.png" alt="Address Icon" className="slide-image" />
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
    <div className="slide">
      <label>
        Upload a cute photo of your pet:
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
        />
      </label>
      {petPhoto && (
        <div className="pet-photo-preview">
          <h4>Preview:</h4>
          <img src={petPhoto} alt="Pet" className="pet-preview-image" />
        </div>
      )}
    </div>
  </Slider>


          <button onClick={handleSave}>Save Details</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfilePage;
