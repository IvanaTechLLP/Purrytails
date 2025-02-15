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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState("latest");
  const [filteredReports, setFilteredReports] = useState([]);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user_id) return;

      try {
        const response = await fetch(
          `/api/user_dashboard/${user_id}`
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
          `/api/reports_dashboard/${user_id}`
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
      const response = await fetch(`/api/share_report`, {
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
  const openModal = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  // Close modal and clear selected report
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
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

  return (
    <div className="qr-dashboard-wrapper">
      <h1 className="dashboard-title">User's QR Dashboard</h1>
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
                            <button
                      className="report-details-button"
                      onClick={() => openModal(report)}
                    >
                      Key Details
                    </button>
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
        <p>
          <strong>Domain:</strong> {selectedReport.domain}
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
  
      {/* Share popup */}
      {showSharePopup && (
          <div className="share-popup-overlay">
          <div className="share-popup">
            <div className="popup-share-content">
              <span className="close-share-popup" onClick={handleCloseSharePopup}>
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
