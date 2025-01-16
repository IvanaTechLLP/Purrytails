import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Home.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { FaSignOutAlt,FaFileUpload, FaTachometerAlt, FaCalendarAlt, FaUser, FaComments } from 'react-icons/fa';
import { FaHome, FaSearch, FaRegClock } from "react-icons/fa";
import { MdTimeline } from 'react-icons/md';



const Home = ({ profile, logOut, reports, setReports, selectedPetId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(true);
  const [reminders, setReminders] = useState([]);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [filteredReports, setFilteredReports] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [numberOfReminders, setNumberOfReminders] = useState(3); // Default to 3 reminders
  const [showQRCodePopup, setShowQRCodePopup] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);

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
      fetchReports();
      fetchNextReminders();
    }
  }, [profile?.user_id]);

  useEffect(() => {
    setFilteredReports(reports); // Set initial filtered reports to all reports
  }, [reports]);

  useEffect(() => {
    const updateReminderCount = () => {
      // Set the number of reminders based on the window width
      if (window.innerWidth < 768) { // Example breakpoint for smaller screens
        setNumberOfReminders(2);
      } else {
        setNumberOfReminders(3);
      }
    };

    // Set initial count
    updateReminderCount();

    // Listen for resize events
    window.addEventListener('resize', updateReminderCount);

    // Cleanup event listener on component unmount
    return () => {
      window.removeEventListener('resize', updateReminderCount);
    };
  }, []);

  const fetchUserDetails = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/user_dashboard/${profile.user_id}`
      );
      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchReports = async () => {
    if (!profile?.user_id) return;

    try {
      const response = await fetch(
        `http://localhost:5000/reports_dashboard/${profile.user_id}?pet_id=${selectedPetId}`
      );
      const data = await response.json();
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchNextReminders = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get_user_events/${profile.user_id}`, {
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

  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const navigateToDashboard = () => {
    navigate("/dashboard"); // Replace '/dashboard' with the actual path to your dashboard
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Prevent default behavior (Prevent file from being opened)
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
  

  const handleShowQRCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/qr_codes/${profile.user_id}.png`
      );
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setQRCodeImage(imageObjectURL);
        setShowQRCodePopup(true);
      } else {
        const generateResponse = await fetch(
          `http://localhost:5000/generate_qr_code/${profile.user_id}`,
          { method: "POST" }
        );
        if (generateResponse.ok) {
          const fetchQRCodeResponse = await fetch(
            `http://localhost:5000/qr_codes/${profile.user_id}.png`
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
    <div className="dashboard-wrapper">
   
      
      <div className="dashboard-left">
      <div className="header">
 
 <button className="hamburger" onClick={handleToggle}>
                 &#9776;
               </button>
            
</div>
        
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                 <button className="back-arrow-menu" onClick={closeMenu}>
                   &larr;
                 </button>
          
          <h2>Menu</h2>
          <ul>
            
        
           {/*
          <li onClick={() => { handleShowQRCode(); closeMenu(); }}> QR</li>
            
            */} 
            <li onClick={() => { navigate("/dashboard");closeMenu(); }}  className='menu-button' title="Dashboard">
          <FaTachometerAlt  className="home-icon"/> <span>Records</span>
        </li>

        <li onClick={() => { handleUploadFile();closeMenu(); }}className='menu-button'  title="Upload Reports">
          <FaFileUpload  className="home-icon"/> <span>Upload</span>
        </li>
        <li onClick={() => { navigate("/timeline");closeMenu();}} className='menu-button' title="Timeline">
                  <MdTimeline   className="home-icon" /> <span>TimeLine</span>
                </li>
               
        <li onClick={() => { navigate("/profile");closeMenu();}} className='menu-button' title="User Settings">
          <FaUser  className="home-icon"/> <span>Profile</span>
        </li>
            
            
          </ul>
          {/*
          <ul>
          <li onClick={() => { logOut(); closeMenu(); }} className="logout-button">
            <FaSignOutAlt />
          </li>
          </ul>
          */}
        </div>
      </div>
      
               

      
      <div className="dashboard-right">
   
        <div className="dashboard-flex-container">
          <div className="column">
            <div className="dashboard-left-content">
              <div className="dashboard-container">
                <div className="text-content">
                  <h1 className="dashboard-title">Welcome to your Health Locker {profile.name}!</h1>
                  <p className="dashboard-description">
                    <span className="highlight-one">
                      Take charge of your pet's health today! A happy pet starts with healthy habits!
                    </span>
                  </p>
                  <button className="view-profile-button" onClick={handleShowUserDetails}>
                    User Details
                  </button>
                </div>

                <div className="image-content">
                  <img src="services1.png" alt="Health Locker" className="dashboard-image" />
                </div>
              </div>

              
            </div>
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
        </div>
      </div>
    </div>
  );
};

export default Home;