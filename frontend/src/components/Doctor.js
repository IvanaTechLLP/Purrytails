import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Doctor.css";
import Chatbot from "./Chatbot.js";

const DoctorDashboard = ({ profile, logOut }) => {
  const [showChatbot, setShowChatbot] = useState(false);
  const [receivedReports, setReceivedReports] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);
  const [showDetails, setShowDetails] = useState({});
  const [notes, setNotes] = useState({}); // State to hold notes for each report

  const navigate = useNavigate();

  useEffect(() => {
    const fetchReceivedReports = async () => {
      if (!profile?.user_id) return;

      try {
        const response = await fetch(
          `/api/doctor_dashboard/${profile.user_id}`
        );
        const data = await response.json();
        const reportObject = data.map((item) => {
          const validJsonString = item.report_data.replace(/'/g, '"');
          const parsedObject = JSON.parse(validJsonString);
          parsedObject.patient_name = item.patient_name; // Include patient's name
          parsedObject.doctor_note = item.doctor_note; // Include doctor's note
          return parsedObject;
        });
        setReceivedReports(reportObject);
      } catch (error) {
        console.error("Error fetching received reports:", error);
      }
    };

    fetchReceivedReports();
  }, [profile?.user_id]);

  const handleDeleteReportInitiate = (reportId) => {
    setReportToDelete(reportId);
    setConfirmDelete(true);
  };

  const handleDeleteReport = async () => {
    if (!reportToDelete) return;
    console.log("deleting report");
    try {
      const response = await fetch(
        `/api/doctor_delete_report?report_id=${reportToDelete}&user_id=${profile.user_id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setReceivedReports((prevReports) =>
          prevReports.filter((report) => report.report_id !== reportToDelete)
        );
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
    setShowChatbot((prevShowChatbot) => !prevShowChatbot);
  };

  const toggleDetails = (reportId) => {
    setShowDetails((prevState) => ({
      ...prevState,
      [reportId]: !prevState[reportId],
    }));
  };

  const handleNotesChange = (reportId, value) => {
    setNotes((prevNotes) => ({
      ...prevNotes,
      [reportId]: value,
    }));
  };

  const updateNotes = async (reportId) => {
    const note = notes[reportId];

    if (!note) {
      console.log("No note to save");
      return;
    }

    try {
      const response = await fetch(
        `/api/save_doctor_notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_id: reportId,
            doctor_id: profile.user_id, // Assuming profile contains doctor's ID
            notes: note,
          }),
        }
      );

      if (response.ok) {
        console.log("Notes saved successfully");
      } else {
        console.error("Failed to save notes:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  return (
    <div className="doctor-dashboard-wrapper">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/profile")}>View Profile</li>
        </ul>
        <ul>
          <li onClick={() => navigate("/qrscanner")}>Scan QR Code</li>
        </ul>
        <ul>
          <li onClick={logOut} className="logout-button">
            Log Out
          </li>
        </ul>
      </div>

      <div className="dashboard-content">
        <h1 className="dashboard-title">Doctor's Dashboard</h1>
        <p className="dashboard-description">
          Here you can review the reports shared by patients.
        </p>

        {receivedReports.length > 0 ? (
          <div className="reports-grid">
            {receivedReports.map((report) => (
              <div key={report.report_id} className="report-card">
                <h3>Report from: {report.patient_name}</h3>
                <p>
                  <strong>Date:</strong> {report.date}
                </p>

                <button onClick={() => toggleDetails(report.report_id)}>
                  {showDetails[report.report_id] ? "Hide Details" : "Detailed Information"}
                </button>

                {showDetails[report.report_id] && (
                  <>
                    <p>
                      <strong>Document:</strong> {report.document}
                    </p>
                    <p>
                      <strong>Diseases:</strong> {report.diseases}
                    </p>
                    <p>
                      <strong>Medicines:</strong> {report.medicines}
                    </p>
                    <p>
                      <strong>Doctor:</strong> {report.doctor}
                    </p>
                    <p>
                      <strong>Domain:</strong> {report.domain}
                    </p>
                    <p>
                      <strong>Notes:</strong> {report.doctor_note}
                    </p>
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

                {/* New Notes Text Box */}
                <textarea
                  placeholder="Add notes"
                  value={notes[report.report_id] || ""}
                  onChange={(e) =>
                    handleNotesChange(report.report_id, e.target.value)
                  }
                  className="notes-textbox"
                />

                {/* Save Notes Button */}
                <button
                  onClick={() => updateNotes(report.report_id)}
                  className="save-notes-button"
                >
                  Save Notes
                </button>

                <div
                  className="delete-icon"
                  onClick={() => handleDeleteReportInitiate(report.report_id)}
                >
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
              </div>
            ))}
          </div>
        ) : (
          <p>No reports available</p>
        )}

        {confirmDelete && (
          <div className="confirmation-popup">
            <div className="confirmation-content">
              <h3>Are you sure you want to delete this report?</h3>
              <button
                onClick={handleDeleteReport}
                className="confirmation-button confirm-button"
              >
                Yes
              </button>
              <button
                onClick={handleCancelDelete}
                className="confirmation-button cancel-button"
              >
                No
              </button>
            </div>
          </div>
        )}

        <button className="chatbot-button" onClick={handleChatbotToggle}>
          💬
        </button>

        {showChatbot && (
          <Chatbot profile={profile} showChatbot={showChatbot} setShowChatbot={setShowChatbot} />
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
