import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "./Dashboard.css";
import Chatbot from "./Chatbot.js";

const QR_Dashboard = ({ reports, setReports, profile, setProfile }) => {
  const [userDetails, setUserDetails] = useState(null);
  const { user_id } = useParams(); // Extract user_id from the URL
  const [showChatbot, setShowChatbot] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false); // State for Share popup
  const [reportToShare, setReportToShare] = useState(null); // ID of the report to share
  const [showDetails, setShowDetails] = useState({});
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user_id) return;

      try {
        const response = await fetch(
          `http://localhost:5000/user_dashboard/${user_id}`
        );
        const data = await response.json();
        console.log(data);
        setUserDetails(data);
        data.user_type = "patient";
        setProfile(data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [user_id]);

  useEffect(() => {
    const fetchReports = async () => {
      if (!user_id) return;

      try {
        const response = await fetch(
          `http://localhost:5000/reports_dashboard/${user_id}`
        );
        const data = await response.json();
        setReports(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };

    fetchReports();
  }, [user_id]);

  // Function to handle showing the share popup
  const handleSendReport = (reportId) => {
    setReportToShare(reportId); // Set the report to share
    setShowSharePopup(true); // Show the Share popup
  };

  // Function to handle report sharing logic
  const handleShare = async (reportId, email) => {
    try {
      const response = await fetch(`http://localhost:5000/api/share_report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id, // Use the extracted user_id
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

  // Function to close the share popup
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



  return (
    <div className="qr-dashboard-wrapper">
      <h1>User's QR Dashboard</h1>
      {userDetails ? (
        <div className="user-and-reports-container">
          <div className="reports-details">
            {reports.length > 0 ? (
              <div className="reports-grid">
                {reports.map((report) => (
                  <div key={report.id} className="report-card">
                    
                    <p><strong>Date:</strong> {report.date}</p>
                    <p><strong>Doctor:</strong> {report.doctor}</p>
                    
                    <button onClick={() => toggleDetails(report.id)}>
                      {showDetails[report.id] ? "Hide Details" : "Detailed Information"}
                    </button>
  
                    {showDetails[report.id] && (
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
                        {/* Share button */}
                        <button
                          className="share-button"
                          onClick={() => handleSendReport(report.id)}
                        >
                          Share
                        </button>
                      </>
                    )}
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
  
      {/* Share popup */}
      {showSharePopup && (
        <div className="share-popup">
          <div className="popup-content">
            <span className="close-popup" onClick={handleCloseSharePopup}>
              &times;
            </span>
            <h3>Share Report</h3>
            <p>You're about to share report ID: {reportToShare}</p>
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
  
      <button className="chatbot-button" onClick={() => setShowChatbot(!showChatbot)}>
        💬
      </button>
  
      {showChatbot && (
        <div className="chatbot-container">
          <Chatbot profile={profile} setReports={setReports} showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
        </div>
      )}
    </div>
  );
  
};

export default QR_Dashboard;
