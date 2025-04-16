import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./DashboardNew.css";
import { motion, AnimatePresence } from "framer-motion";

import Chatbot from "./Chatbot.js";


  
const DashboardNew = ({ profile, logOut, reports, setReports, selectedPetId }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  const [showChatbot, setShowChatbot] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false); // State for Share popup
  const [reportToShare, setReportToShare] = useState(null); // ID of the report to share
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [filteredReports, setFilteredReports] = useState([]);
  // const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  // const [meetLink, setMeetLink] = useState(null); // State to store the Meet link
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false); 
    const [renderChatbot, setRenderChatbot] = useState(false);
    const isMobile = window.innerWidth <= 500;

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
    
    if(profile?.user_id) {
      fetchUserDetails();
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

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };

  const handleDeleteReportInitiate = (reportId) => {
    setReportToDelete(reportId);
    setConfirmDelete(true);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/delete_report/${reportToDelete}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReports((prevReports) => prevReports.filter((report) => report.report_id !== reportToDelete));
      } else {
        console.error("Failed to delete the report:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting report:", error);
    } finally {
      setConfirmDelete(false);
      setReportToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDelete(false);
    setReportToDelete(null);
  };
  
  const handleChatbotToggle = () => {
    if (!renderChatbot) {
      setRenderChatbot(true);
      setShowChatbot(true);
    } else {
      setShowChatbot(false); // Start animation
      setTimeout(() => setRenderChatbot(false), 400); // Delay unmounting
    }
  };
  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Close modal and clear selected report
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  const handleShowUserDetails = () => {
    navigate("/profile", { state: { userDetails } });
  };



  const handleSendReport = (reportId) => {
    setReportToShare(reportId); // Set the report to share
    setShowSharePopup(true); // Show the Share
  };

  const handleShare = async (reportId, email) => {
    try {
        console.log("User ID:", profile.user_id);  // Log user_id
        console.log("Report ID:", reportId);         // Log reportId
        console.log("Email:", email);                 // Log email

        const response = await fetch(`http://localhost:5000/api/share_report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: profile.user_id, 
                reportId: reportId,
                email: email,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Report shared successfully:", data);
        } else {
            const errorData = await response.json();
            console.error("Failed to share the report:", errorData.message || response.statusText);
        }
    } catch (error) {
        console.error("Error sharing report:", error);
    } finally {
        setShowSharePopup(false);
        setReportToShare(null);
    }
};


  const handleCloseSharePopup = () => {
    setShowSharePopup(false);
    setReportToShare(null);
  };
  const toggleDetails = (reportId) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [reportId]: !prevState[reportId],
    }));
  };
  
  const handleFilterChange = (event) => {
    const filterType = event.target.value;
    setSelectedFilter(filterType);

    let sortedReports = [...reports];
    
    if (filterType === "latest") {
      // Sort by date (latest first)
      sortedReports.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (filterType === "chronology") {
      // Sort by date (oldest first)
      sortedReports.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (filterType === "domain") {
      // Sort by domain alphabetically
      sortedReports.sort((a, b) => a.domain.localeCompare(b.domain));
    }

    setFilteredReports(sortedReports); // Update filteredReports state with sorted list
  };


  
  // const handleSendInvite = async (email) => {
  //   console.log('Sending invite to:', email);
  
  //   try {
  //     // Assuming the access token is stored in localStorage or in a global state
  //     const accessToken = localStorage.getItem('access_token'); // Modify based on where you store the token
  
  //     // Make the API request to send the Google Meet invite
  //     const response = await fetch('http://localhost:5000/send_meeting_invite', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         email: email,
  //         access_token: accessToken,
  //       }),
  //     });
  
  //     const data = await response.json();
      
  //     if (response.ok) {
  //       console.log('Invite sent successfully:', data.meet_link);
  //       setMeetLink(data.meet_link); 
  //     } else {
  //       console.error('Error sending invite:', data.detail);
  //     }
  
  //   } catch (error) {
  //     console.error('Error sending invite:', error);
  //   }
  
  //   // Close the popup after sending
  //   // setShowMeetingPopup(false);
  // };
  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const toggleMobileMenu = () => {
    setMenuOpen(prev => !prev);
    console.log("Menu Toggle");
  };

  return (
    <div className="dashboard-wrapper-new">

      {/*
            <div className="bottom-nav">
                  <ul className="nav-menu">
                  <li className="nav-item" onClick={() => { navigate("/home")}}>
                  <FaHome />
                  <p>Home</p>
                </li>
              <li className="nav-item" onClick={() => { handleUploadFile()}}>
                    <FaFileUpload />
                    <p>Upload</p>
                  </li>
                <li className="nav-item" onClick={() => { navigate("/timeline")}}>
                  <MdTimeline />
                  <p>Timeline</p>
                </li>
                <li className="nav-item" onClick={() => { navigate("/profile")}}>
                  <FaUser />
                  <p>Profile</p>
                </li>
              </ul>
              </div>
              */}
    
      <nav className="home-nav">
  <div className="home-logo">
    <a href="#">
      <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
    </a>
  </div>

  <ul className="home-nav-links">
  <li onClick={() => { navigate("/home-new");closeMenu();}}>
    <a >Home</a>
  </li>
  <li >
    <a className="current-link">Records</a>
  </li>
   
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>

    <li onClick={() => { navigate("/timeline");closeMenu(); }}><a>Timeline</a></li>

   

    <li onClick={() => { navigate("/profile");closeMenu();}}><a>Profile</a></li>
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
        <li onClick={() => { navigate("/home-new");closeMenu(); }}><a>Home</a></li>
        <li>
    <a className="current-link">Records</a>
  </li>
      
        
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>

    <li onClick={() => { navigate("/timeline");closeMenu(); }}><a>Timeline</a></li>
    
    
    <li onClick={() => { navigate("/profile");closeMenu();}}><a>Profile</a></li>

          
        </ul>
      </div>
     
        
      <div classname="dashboard-container" onClick={() => {closeMenu(); }}>
        
        <h1 className="title-one">Health Locker</h1>


        <div className="sort-container">
            <span className="sort-text">Sort by</span>
            <div className="divider">|</div>
            <select className="sort-dropdown" id="report-filter" value={selectedFilter} onChange={handleFilterChange} >
                <option value="letest">Most Recent</option>
                <option value="chronology">Chronological</option>
                <option value="domain">Domain (A-Z)</option>
            </select>
        </div>
        

        {userDetails ? (
          <div className="user-and-reports-container-new">
           
            <div className="reports-details-new">
              {filteredReports.length > 0 ? (
                <div className="reports-grid-new">
                  {filteredReports.map((report) => (
                    <div key={report.report_id} className="report-card-new">
                      <p><strong classname="label-report-card">Date:</strong> {report.date}</p>
                      <p><strong classname="label-report-card">Doctor:</strong> {report.doctor}</p>

                      <img src="envo.png" alt="image description" className="report-image" />

                                <button
                                    className="report-details-button"
                                    onClick={() => openModal(report)}
                                    >
                                    <span className="report-button-text">Summary</span>
                                </button>
                            <div className="delete-icon" onClick={() => handleDeleteReportInitiate(report.report_id)}>
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="grey"
                                width="24"
                                height="24"
                                >
                                <path d="M3 6h18v2H3V6zm3 3h12v12H6V9zm2 2v8h8v-8H8zm2 0h4v8h-4v-8z" />
                                </svg>
                            </div>
                     

                    </div>
                  ))}
                </div>
              ) : (
                <p>No reports available</p>
              )}
            </div>
          </div>
        ) : (
          <p>Loading user details...</p>
        )}
        {isModalOpen && selectedReport && (
        <div className="report-popup-overlay">
          <div className="report-popup">
            <span className="close-report-popup" onClick={closeModal}>
              &times;
            </span>
            <h2>Key Details</h2>
            <p>
              <strong>Date:</strong> {selectedReport.date}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedReport.doctor}
            </p>
            <p>
              <strong>Document:</strong> {selectedReport.document}
            </p>
            <p>
              <strong>Diseases:</strong> {selectedReport.diseases}
            </p>
            <p>
              <strong>Medicines:</strong> {selectedReport.medicines}
            </p>
            
            {selectedReport.link ? (
              <a
                href={selectedReport.link}
                target="_blank"
                rel="noopener noreferrer"
                className="view-report-link"
              >
                View Report
              </a>
            ) : (
              "No link available"
            )}


          </div>
          </div>
          )}
                

        {confirmDelete && (
          <div className="confirmation-popup">
            <div className="confirmation-content">
              <h3>Are you sure you want to proceed?</h3>
              <button onClick={handleDeleteReport} className="confirmation-button confirm-button">Yes</button>
              <button onClick={handleCancelDelete} className="confirmation-button cancel-button">No</button>
            </div>
          </div>
        )}
       



       <div className="chat-float-wrapper">
       <motion.img
  src="/Chevron.png"
  alt="Bot Icon"
  className="chat-avatar"
  onClick={handleChatbotToggle}
  animate={{
    y: showChatbot ? (isMobile ? -420 : -230) : 0,
    scaleY: showChatbot ? -1 : 1,
  }}
  transition={{
    type: 'spring',
    mass: 1,
    stiffness: 100,
    damping: 15,
  }}
/>


  <button
    className="chat-with-me-button"
    onClick={handleChatbotToggle}
    
  >
    Chat with Me!
  </button>

  <img
    src="Chatbot-Image.png"
    alt="Decorative"
    className="fixed-bottom-image"
  />
</div>
<AnimatePresence>
  {showChatbot && (
    <motion.div
      key="chatbot"
      className="chatbot-popup-new"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{
        type: 'spring',
        mass: 1,
        stiffness: 100,
        damping: 15,
        duration: 0.7, // controls smoother exit
      }}
    >
      <Chatbot
        profile={profile}
        setReports={setReports}
        showChatbot={showChatbot}
        setShowChatbot={setShowChatbot}
        selectedPetId={selectedPetId}
      />
    </motion.div>
  )}
</AnimatePresence>



    


        {/* <button onClick={() => setShowMeetingPopup(true)}>
          Invite Doctor
        </button>

        {showMeetingPopup && 
          <Meeting onClose={() => setShowMeetingPopup(false)} onSubmit={handleSendInvite} meetLink={meetLink}/>
        } */}
      </div>
      </div>
    
  );
};

export default DashboardNew;
