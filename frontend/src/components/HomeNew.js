import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./HomeNew.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';




const HomeNew = ({ profile, logOut, reports, setReports, selectedPetId }) => {
const [menuOpen, setMenuOpen] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [filteredReports, setFilteredReports] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfReminders, setNumberOfReminders] = useState(3); // Default to 3 reminders
  const [showQRCodePopup, setShowQRCodePopup] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [selectedPetName, setSelectedPetName] = useState("");
  const [hasPet, setHasPet] = useState(false);
  const [selectedPetBreed, setSelectedPetBreed] = useState("");
  const [selectedPetAge, setSelectedPetAge] = useState(null);
  const [selectedPetType, setSelectedPetType] = useState("");
 

  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state;
  const [showDetails, setShowDetails] = useState({});
  
  useEffect(() => {
    if (state?.showPopup === false) {
      setShowPopup(false);
    }
  }, [state?.showPopup]);

  useEffect(() => {
    if (profile?.user_id) {
      fetchUserDetails();
      fetchPetDetails();
      fetchReports();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    setFilteredReports(reports); // Set initial filtered reports to all reports
  }, [reports]);


  const fetchUserDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `/api/user_dashboard/${profile.user_id}`
      );
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchPetDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(`/api/get_pet_details/${profile.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data && data.pet_details && data.pet_details.length > 0) {
          console.log("User has a pet!");
          setHasPet(true);
          console.log(selectedPetId);
          
          const formatDob = (dob) => {
            if (!dob) return "";
            const [year, month, day] = dob.split("-");
            return `${day}/${month}/${year}`;
          };
          
          

          const selectedPet = data.pet_details.find(pet => pet.petId === selectedPetId);
          if (selectedPet) {
            console.log(selectedPet.sender);
           
            setSelectedPetName(selectedPet.petName);
            setSelectedPetBreed(selectedPet.breed);
            setSelectedPetAge(formatDob(selectedPet.dob)); 
            setSelectedPetType(selectedPet.petType);

          } else {
            console.log("Selected pet ID does not match any registered pets.");
          }
        } else {
          console.log("User does not have a pet.");
          setHasPet(false);
        }
      } else {
        console.error("Failed to fetch pet data.");
      }
    } catch (error) {
      console.error("Error fetching pet data:", error);
    }
  };


  const fetchReports = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `/api/reports_dashboard/${profile.user_id}?pet_id=${selectedPetId}`
      );
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchNextReminders = async () => {
    try {
      const response = await fetch(`/api/get_user_events/${profile.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Include token if needed
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch reminders");
      }

      const fetchedEvents = await response.json();
      const eventsList = JSON.parse(fetchedEvents);

      // Get the next reminders based on the number of reminders determined by screen size
      const nextReminders = eventsList
        .map((event) => ({
          id: event.event_id,
          title: event.event_name,
          date: new Date(event.start_datetime).toLocaleString(), // Format the date as needed
        }))
        .slice(0, numberOfReminders); // Get only the specified number

      setReminders(nextReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };

  const handleShowUserDetails = () => {
    navigate("/profile", { state: { userDetails } });
  };



  const closeMenu = () => {
    setIsOpen(false);
  };


  
  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files; // Get the files from the drop
    if (files.length) {
      handleUpload(files); // Call the upload handler
    }
  };
  
  const handleFileSelect = (e) => {
    const files = e.target.files; // Get the selected files
    if (files.length) {
      handleUpload(files); // Pass the files to handleUpload
    } else {
      alert('Please select a file.');
    }
  };
  
  const handleUpload = (files) => { // Accept files as a parameter
    if (files) {
      // Redirect to the imageProcessing page with the file
      navigate('/file_upload', { state: { files } });
    } else {
      alert('Please select a file to upload.');
    }
  };
  const toggleMobileMenu = () => {
    setMenuOpen(prev => !prev);
    console.log("Menu Toggle");
  };
  

  const handleShowQRCode = async () => {
    try {
      const response = await fetch(
        `/api/qr_codes/${profile.user_id}.png`
      );
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setQRCodeImage(imageObjectURL);
        setShowQRCodePopup(true);
      } else {
        const generateResponse = await fetch(
          `/api/generate_qr_code/${profile.user_id}`,
          { method: "POST" }
        );
        if (generateResponse.ok) {
          const fetchQRCodeResponse = await fetch(
            `/api/qr_codes/${profile.user_id}.png`
          );
          if (fetchQRCodeResponse.ok) {
            const imageBlob = await fetchQRCodeResponse.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setQRCodeImage(imageObjectURL);
            setShowQRCodePopup(true);
          } else {
            console.error("Failed to fetch the newly generated QR code.");
          }
        } else {
          console.error("Error generating QR code:", generateResponse.statusText);
        }
      }
    } catch (error) {
      console.error("Error handling QR code:", error);
    }
  };

  
  

  return (
    <div className="dashboard-wrapper-1" >
        <nav className="home-nav">
        <div className="home-logo" style={{ display: "flex", alignItems: "center", gap: "30px" }}>
        {profile.email === "darshthakkar09@gmail.com" && (
    <img src="/anubis-tiger.webp" alt="Anubis Mode" className="logo-image" style={{ height: "60px" }} />
  )}
  <a href="#">
    <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
  </a>

</div>

  <ul className="home-nav-links">
  <li>
    <a className="current-link">Home</a>
  </li>
    <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline-new");closeMenu();}}><a>Timeline</a></li>
    <li onClick={() => { navigate("/profile-new");closeMenu();}}><a>Profile</a></li>
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
        <li>
    <a className="current-link">Home</a>
  </li>
        <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline-new");closeMenu();}}><a>Timeline</a></li>
    <li onClick={() => { navigate("/profile-new");closeMenu();}}><a>Profile</a></li>

          
        </ul>
      </div>

<div className="home-banner">
<img
  src={selectedPetType === "cat" ? "/cat6.png" : "/dog1.png"}
  alt="Banner Image"
  className={selectedPetType === "cat" ? "banner-image-1" : "banner-image"}
/>

  <div className="banner-text">
  <h2 className="welcome-text">
  <span className="welcome-back">Welcome Back </span>
  <span className="user-name">{hasPet ? selectedPetName : profile.name}</span>
  <span className="welcome-back"> ! </span>
  </h2>


  <p className="banner-paragraph">Paws, relax, and unleash the purr-fect way </p>
  <p className="banner-paragraph">to manage your pet's care - all in one spot!</p>

  <div className="banner-subheading-group">
    <h3 className="banner-subheading">Breed : {selectedPetBreed}</h3>
    <h3 className="banner-subheading">DoB : {selectedPetAge} </h3>
  </div>

    <button className="banner-button"  onClick={handleShowUserDetails}>
      <img src="/pen.png" alt="" className="button-icon" />
      Edit Profile
    </button>
  </div>
  
</div>
<img src="/dogcat.png" alt="Right Banner Image" className="banner-right-image" />
{/*
<div className="background-section">
  <div className="background-overlay"></div>
</div>
    */}

<div className="background-section">
  <div className="service-container">
    {/*
    <div className="service-box box1">
      <img src="/Foor.png" alt="Icon 1" className="service-icon-1" />
      <h3 className="service-title">Upload Your Report</h3>
      <p className="service-description">Easily track your pet’s health by uploading medical records in one place.</p>
      <button className="service-button">Upload now</button>
    </div>
    */}
    <div className="service-box box1">
      <img src="/Foor.png" alt="Icon 1" className="service-icon-1" />
      <h3 className="service-title">Upload Your Report</h3>
      <p className="service-description">
        Easily track your pet’s health by uploading medical records in one place.
      </p>

      {/* Button triggers file input */}
      <button className="service-button" onClick={() => document.getElementById("fileUpload")?.click()}>
        Upload now
      </button>
      <input
        type="file"
        id="fileUpload"
        className="file-input"
        style={{ display: "none" }}
        onChange={handleFileSelect}
      />
    </div>

    <div className="service-box box2">
      <img src="/Stethoscope.png" alt="Icon 2" className="service-icon" />
      <h3 className="service-title">View Previous Reports</h3>
      <p className="service-description">Access and manage all your pet’s health records anytime, anywhere.</p>
      <button className="service-button"  onClick={() => navigate('/dashboard')}>View Reports</button>
    </div>

    <div className="service-box box3">
      <img src="/DogHeart.png" alt="Icon 3" className="service-icon" />
      <h3 className="service-title">Adopt a Pet</h3>
      <p className="service-description">Find your furry soulmate and give a pet the loving home they deserve.</p>
      <button className="service-button">Find a Friend</button>
    </div>
    <div className="service-box box4">
      <img src="/TimeLine1.png" alt="Icon 4" className="service-icon" />
      <h3 className="service-title">Health Timeline</h3>
      <p className="service-description">Visualize your pet’s medical journey with an easy-to-read timeline.</p>
      <button className="service-button" onClick={() => navigate('/timeline')}>View Timeline</button>
    </div>
  </div>
</div>


           


   
        
              
            {/* 
            <div className="upload-file-container">
                <h2 className="upload-file-title">UPLOAD REPORTS</h2>
                <div className="upload-area" onDragOver={handleDragOver} onDrop={handleDrop}>
                  <p>Drag and drop your files here or</p>
                  <input type="file" className="file-input" onChange={handleFileSelect} />
                 
                </div>
              </div>
              </div>

          <div className="column">
          {userDetails ? (
              <div className="recent-reports-container">
                <h2 className="recent-reports-title">RECENT UPLOADS</h2>
                {filteredReports.length > 0 ? (
                  <ul className="reports-list">
                    {filteredReports.slice(0, 5).map((report) => (
                      <li key={report.report_id} className="report-item">
                        <div className="report-info">
                          <span className="report-name">{report.doctor}</span>
                          <span className="report-date">{report.date}</span>
                        </div>
                        
                        {report.link && (
                          <a
                            href={report.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-report-link"
                          >
                            View Report
                          </a>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Start your health journey by uploading your medical documents! Keep track of your progress and easily access your health information.</p>
                )}

                <div className="report-action-container">
                  <p className="view-all-reports-text">Want to view all your reports?</p>
                  <button className="dashboard-button" onClick={() => navigate('/dashboard')}>
                    All Reports
                  </button>
                </div>
              </div>
            ) : (
              <p>Loading user details...</p>
            )}
              */}

           {/*
            <div className="calendar-reminder-container">
              <h2 className="calendar-title">STAY ORGANISED WITH REMINDERS!</h2>
              <div className="reminders-list">
                {reminders.length > 0 ? (
                  <div className="reminder-cards-container">
                    {reminders.map(reminder => {
                      const date = new Date(reminder.date);
                      const day = date.getDate();
                      const monthAbbr = date.toLocaleString('default', { month: 'long' });
                      const year = date.getFullYear().toString().slice(-2);
                      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                      return (
                        <div key={reminder.id} className="reminder-card">
                          <div className="reminder-date">
                            <span className="reminder-day">{day}</span>
                            <div className="reminder-month-time">
                              <span className="reminder-month-year">{`${monthAbbr} '${year}`}</span>
                              <span className="reminder-time">{time}</span>
                            </div>
                          </div>
                          <div className="reminder-separator"></div>
                          <h4 className="reminder-title">{reminder.title}</h4>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p>No upcoming reminders. Don't forget to add some!</p>
                )}
              </div>
              

              <div className="add-reminder-container">
                <p>Want to add New Reminders?</p>
                <button className="go-to-calendar-button" onClick={() => navigate('/calendar')}>
                  Calendar
                </button>
              </div>
            </div>

            */}
         
      </div>
   
  );
};

export default HomeNew;
