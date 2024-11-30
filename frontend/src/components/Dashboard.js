import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Dashboard.css";

import Chatbot from "./Chatbot.js";
import Meeting from './Meeting';
import { FaSignOutAlt,FaComments,FaHome, FaFileUpload, FaCalendarAlt, FaUser,  } from 'react-icons/fa';


const Dashboard = ({ profile, logOut, reports, setReports }) => {
  const [userDetails, setUserDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(true);

  const [showChatbot, setShowChatbot] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showSharePopup, setShowSharePopup] = useState(false); // State for Share popup
  const [reportToShare, setReportToShare] = useState(null); // ID of the report to share
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [filteredReports, setFilteredReports] = useState([]);
  const [showMeetingPopup, setShowMeetingPopup] = useState(false);
  const [meetLink, setMeetLink] = useState(null); // State to store the Meet link
  const [isOpen, setIsOpen] = useState(false);

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
        `http://localhost:5000/reports_dashboard/${profile.user_id}`
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
  

  

  const handleShowUserDetails = () => {
    navigate("/profile", { state: { userDetails } });
  };

  const handleChatbotToggle = () => {
    setShowChatbot((prevShowChatbot) => !prevShowChatbot);
  };

  const handleSendReport = (reportId) => {
    setReportToShare(reportId); // Set the report to share
    setShowSharePopup(true); // Show the Share popup
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


  
  const handleSendInvite = async (email) => {
    console.log('Sending invite to:', email);
  
    try {
      // Assuming the access token is stored in localStorage or in a global state
      const accessToken = localStorage.getItem('access_token'); // Modify based on where you store the token
  
      // Make the API request to send the Google Meet invite
      const response = await fetch('http://localhost:5000/send_meeting_invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          access_token: accessToken,
        }),
      });
  
      const data = await response.json();
      
      if (response.ok) {
        console.log('Invite sent successfully:', data.meet_link);
        setMeetLink(data.meet_link); // Store the Meet link in the state
      } else {
        console.error('Error sending invite:', data.detail);
      }
  
    } catch (error) {
      console.error('Error sending invite:', error);
    }
  
    // Close the popup after sending
    // setShowMeetingPopup(false);
  };
  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="dashboard-wrapper">
      <div classname="dashboard-left">
      <button className="hamburger" onClick={handleToggle}>
        &#9776; 
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="back-arrow" onClick={closeMenu}>
            &larr; 
        </button>
        
        <h2>Menu</h2>
        
        <ul className="menu-items">
                <li onClick={() => { navigate("/home"); closeMenu(); }} title="Home">
          <FaHome />
          
        </li>
        
        <li onClick={() => { navigate("/file_upload"); closeMenu(); }}className='menu-button'  title="Upload Reports">
          <FaFileUpload /> 
        </li>
        <li onClick={() => { navigate("/calendar"); closeMenu(); }} className='menu-button' title="Calendar">
          <FaCalendarAlt /> 
        </li>
        <li onClick={() => { navigate("/profile"); closeMenu(); }} className='menu-button' title="User Settings">
          <FaUser /> 
        </li>
       
        <li onClick={() => { navigate("/chat"); closeMenu(); }} title="Chat">
        <FaComments /> 
      </li>
            
        </ul>
        <div className="logout-container-dash">
        <ul>
          
          <li onClick={() => { logOut(); closeMenu(); }} className="logout-button">
            <FaSignOutAlt />
          </li>
        </ul>
        </div>
      </div>
      </div>
        
        <div classname="dashboard-right">
        
        <h1 className="dashboard-title">Welcome to your Health Locker!</h1>
        <p className="dashboard-description-one">
          This dashboard serves as a centralized storage for all your medical reports, enabling you to easily access, manage, and review your health information. 
          Keep track of your medical history, including diseases, prescribed medicines, and doctor consultations, all in one secure place. 
          You can upload new reports, view existing ones, and even generate a QR code for quick access to your medical data. 
          
        </p>
        <p className="highlight">Your health information is always at your fingertips!</p>

        {userDetails ? (
          <div className="user-and-reports-container">
            <div className="filter-container">
              <label htmlFor="report-filter">Sort Reports: </label>
              <select id="report-filter" value={selectedFilter} onChange={handleFilterChange}>
                <option value="latest">Latest</option>
                <option value="chronology">Chronological</option>
                <option value="domain">Domain (A-Z)</option>
              
              </select>
            </div>
            <div className="reports-details">
              {filteredReports.length > 0 ? (
                <div className="reports-grid">
                  {filteredReports.map((report) => (
                    <div key={report.report_id} className="report-card">
                      <p><strong>Date:</strong> {report.date}</p>
                      <p><strong>Doctor:</strong> {report.doctor}</p>
                      <button className="report-details-button" onClick={() => toggleDetails(report.report_id)}>
                        {showDetails[report.report_id] ? "Conceal Details" : "Key Details"}
                      </button>

                      {showDetails[report.report_id] && (
                        <>
                          <p><strong>Document:</strong> {report.document}</p>
                          <p><strong>Diseases:</strong> {report.diseases}</p>
                          <p><strong>Medicines:</strong> {report.medicines}</p>
                          <p><strong>Domain:</strong> {report.domain}</p>
                          {report.link ? (
                            <a
                              href={report.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="view-report-link"
                            >
                              View Report
                            </a>
                          ) : (
                            "No link available"
                          )}
                        </>
                      )}
                      <div className="delete-icon" onClick={() => handleDeleteReportInitiate(report.report_id)}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="red"
                          width="24"
                          height="24"
                        >
                          <path d="M3 6h18v2H3V6zm3 3h12v12H6V9zm2 2v8h8v-8H8zm2 0h4v8h-4v-8z" />
                        </svg>
                      </div>
                      <button
                        className="share-button"
                        onClick={() => handleSendReport(report.report_id)}
                      >
                        Share
                      </button>
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

      

        {confirmDelete && (
          <div className="confirmation-popup">
            <div className="confirmation-content">
              <h3>Are you sure you want to proceed?</h3>
              <button onClick={handleDeleteReport} className="confirmation-button confirm-button">Yes</button>
              <button onClick={handleCancelDelete} className="confirmation-button cancel-button">No</button>
            </div>
          </div>
        )}

        {showSharePopup && (
          <div className="share-popup">
            <div className="popup-content">
              <span className="close-popup" onClick={handleCloseSharePopup}>
                &times;
              </span>
              <h3>Share Report</h3>
              <label>
                Enter Doctor's email:
                <input type="email" placeholder="Enter email" />
              </label>
              <button
                onClick={() => {
                  const email = document.querySelector("input[type='email']").value;
                  handleShare(reportToShare, email);
                }}
              >
                Share
              </button>
            </div>
          </div>
        )}

        <button className="chatbot-button" onClick={handleChatbotToggle}>
          💬
        </button>

        {showChatbot && (
          <Chatbot profile={profile} setReports={setReports} showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
        )}

        <button onClick={() => setShowMeetingPopup(true)}>
          Invite Doctor
        </button>

        {showMeetingPopup && 
          <Meeting onClose={() => setShowMeetingPopup(false)} onSubmit={handleSendInvite} meetLink={meetLink}/>
        }
      </div>
      </div>
    
  );
};

export default Dashboard;
