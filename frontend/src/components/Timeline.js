import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";
import {
  FaSignOutAlt,
  FaFileUpload,
  FaTachometerAlt,
  FaCalendarAlt,
  FaUser,
  FaHome,
} from "react-icons/fa";
import jsPDF from "jspdf";

const Timeline = ({ profile, selectedPetId }) => {
  const [overviews, setOverviews] = useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.user_id) {
      fetchOverviews();
    }
  }, [profile?.user_id]);

  // Group Reports by Year and Month
  const groupByYearAndMonth = (reports) => {
    return reports.reduce((acc, report) => {
      const date = new Date(report.date);
      const year = date.getFullYear(); // Extract year
      const month = date.toLocaleString("en-US", { month: "long" }); // Extract month name

      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][month]) {
        acc[year][month] = [];
      }

      acc[year][month].push(report);
      return acc;
    }, {});
  };

  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  const fetchOverviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/reports_dashboard/${profile.user_id}?pet_id=${selectedPetId}`
      );

      if (!response.ok) {
        // Check if it's a "no reports" error or a general error
        const errorMessage =
          response.status === 500
            ? "No reports available"
            : "Failed to fetch overviews";
        console.log(errorMessage);
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (!data || data.length === 0) {
        throw new Error("No reports available");
      }

      // Sort reports by date in ascending order
      const sortedData = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Group by year and month
      const groupedData = groupByYearAndMonth(sortedData);
      setOverviews(groupedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleUploadFile = () => {
    navigate("/file_upload", { state: { showPopup: false } });
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let yPosition = 10;
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    // Add title at the top of the PDF
    doc.setFontSize(18);
    doc.text("Timeline Overview", 10, yPosition);
    yPosition += 20; // Space after the title

    // Set font for body content
    doc.setFontSize(12);

    // Iterate through the overviews and generate the PDF
    Object.entries(overviews).forEach(([year, months]) => {
      doc.setFontSize(14);
      doc.text(`Year: ${year}`, 10, yPosition);
      yPosition += 10;

      Object.entries(months).forEach(([month, reports]) => {
        doc.setFontSize(12);
        doc.text(`Month: ${month}`, 10, yPosition);
        yPosition += 10;

        reports.forEach((overview, index) => {
          if (overview.title) {
            doc.setFontSize(12);
            doc.text(overview.title, 10, yPosition);
            yPosition += 10;
          }

          if (overview.summary) {
            const summaryLines = doc.splitTextToSize(overview.summary, 180); // Wrapping text
            summaryLines.forEach((line) => {
              doc.text(line, 10, yPosition);
              yPosition += 10;
            });
          }

          // Skip link part if you don't want to include links in the PDF
          // if (overview.link) {
          //   doc.text(`Link: ${overview.link}`, 10, yPosition);
          //   yPosition += 10;
          // }

          // Handle page break if content exceeds the page height
          if (yPosition > 270) {
            // 270 is near the bottom of the page
            doc.addPage();
            yPosition = 10;
          }
        });
      });
    });

    // Save the PDF with the name "timeline.pdf"
    doc.save(`timeline_${currentDate}.pdf`);
  };

  if (loading) {
    return <div className="timeline-loading">Loading timeline...</div>;
  }

  if (error === "No reports available") {
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-left">
          <div className="header">
            <button className="hamburger" onClick={handleToggle}>
              &#9776;
            </button>
            <h1 className="calendar-title">TimeLine</h1>
            
          </div>

          <div className={`sidebar ${isOpen ? "open" : ""}`}>
            <button className="back-arrow-menu" onClick={closeMenu}>
              &larr;
            </button>

            <h2>Menu</h2>
            <ul>
              <li
                onClick={() => {
                  navigate("/home");
                  closeMenu();
                }}
                title="Home"
              >
                <FaHome className="home-icon" /> <span>Home</span>
              </li>
              <li
                onClick={() => {
                  navigate("/dashboard");
                  closeMenu();
                }}
                className="menu-button"
                title="Dashboard"
              >
                <FaTachometerAlt className="home-icon" /> <span>Records</span>
              </li>
              <li
                onClick={() => {
                  handleUploadFile();
                  closeMenu();
                }}
                className="menu-button"
                title="Upload Reports"
              >
                <FaFileUpload className="home-icon" /> <span>Upload</span>
              </li>
              <li
                onClick={() => {
                  navigate("/profile");
                  closeMenu();
                }}
                className="menu-button"
                title="User Settings"
              >
                <FaUser className="home-icon" /> <span>Profile</span>
              </li>
            </ul>
          </div>
        </div>

        <h1 className="dashboard-title-one">Timeline</h1>

        <div className="timeline-empty-message">
          <p>Upload files to generate a timeline</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="timeline-error">Error: {error}</div>;
  }

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-left">
        <div className="header">
          <button className="hamburger" onClick={handleToggle}>
            &#9776;
          </button>
          <h1 className="calendar-title">TimeLine</h1>
          
        </div>

        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <button className="back-arrow-menu" onClick={closeMenu}>
            &larr;
          </button>

          <h2>Menu</h2>
          <ul>
            <li
              onClick={() => {
                navigate("/home");
                closeMenu();
              }}
              title="Home"
            >
              <FaHome className="home-icon" /> <span>Home</span>
            </li>
            <li
              onClick={() => {
                navigate("/dashboard");
                closeMenu();
              }}
              className="menu-button"
              title="Dashboard"
            >
              <FaTachometerAlt className="home-icon" /> <span>Records</span>
            </li>
            <li
              onClick={() => {
                handleUploadFile();
                closeMenu();
              }}
              className="menu-button"
              title="Upload Reports"
            >
              <FaFileUpload className="home-icon" /> <span>Upload</span>
            </li>
            <li
              onClick={() => {
                navigate("/profile");
                closeMenu();
              }}
              className="menu-button"
              title="User Settings"
            >
              <FaUser className="home-icon" /> <span>Profile</span>
            </li>
          </ul>
        </div>
      </div>

      <h1 className="dashboard-title-one">Timeline</h1>

      {Object.keys(overviews).length > 0 ? (
        <div className="timeline" onClick={() => {closeMenu(); }}>
          {Object.entries(overviews).map(([year, months]) => (
            <div key={year} className="timeline-year-group">
              <h2 className="timeline-year">{year}</h2>
              {Object.entries(months).map(([month, reports]) => (
                <div key={month} className="timeline-month-group">
                  <h3 className="timeline-month">{month}</h3>
                  {reports.map((overview, index) => (
                    <div key={index} className="timeline-item">
                      <div className="timeline-content">
                        <h4>{overview.title}</h4>
                        <p>{overview.summary}</p>
                        {overview.link && (
                          <a
                            href={overview.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="view-report-link"
                          >
                            View Details
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <p className="timeline-empty">
          Please add a record to view the Timeline
        </p>
      )}

      {/* Button for downloading PDF */}
      <button onClick={handleDownloadPDF} className="download-btn">
        Download Timeline
      </button>
    </div>
  );
};

export default Timeline;
