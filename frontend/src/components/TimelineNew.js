import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./TimelineNew.css";
import {
  FaSignOutAlt,
  FaFileUpload,
  FaTachometerAlt,
  FaCalendarAlt,
  FaUser,
  FaHome,
} from "react-icons/fa";
import jsPDF from "jspdf";

const TimelineNew = ({ profile, selectedPetId }) => {
  const [overviews, setOverviews] = useState({});
  const [reports, setReports]=useState({});
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
  const toggleMobileMenu = () => {
    setMenuOpen(prev => !prev);
    console.log("Menu Toggle");
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
      console.log(data);
      console.log(data[0].date);
      setReports(data);

      if (!data || data.length === 0) {
        setReports(0);
        throw new Error("No reports available");
      }

      // Sort reports by date in ascending order
      const sortedData = data.sort(
        (a, b) => new Date(a.date) - new Date(b.date)
      );

      // Group by year and month
      const groupedData = groupByYearAndMonth(sortedData);
      setOverviews(groupedData);
      console.log(groupedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0'); // Day (DD)
    const month = date.toLocaleString('default', { month: 'short' }); // Month (MMM)
    const year = String(date.getFullYear()).slice(-2); // Last two digits of the year (YY)
    return `${day} ${month} '${year}`;
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
        <div className="timeline-wrapper-1" >
        <nav className="home-nav">
  <div className="home-logo">
    <a href="#">
      <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
    </a>
  </div>

  <ul className="home-nav-links">
  <li>
    <a className="current-link">Home</a>
  </li>
    <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline");closeMenu();}}><a>Timeline</a></li>
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
        <li>
    <a className="current-link">Home</a>
  </li>
        <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    <li onClick={() => { navigate("/timeline");closeMenu();}}><a>Timeline</a></li>
    <li onClick={() => { navigate("/profile");closeMenu();}}><a>Profile</a></li>

          
        </ul>
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
    <div className="timeline-wrapper-1" >
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
    <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>

    <li >
    <a className="current-link">Timeline</a>
  </li>
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
      
        <li onClick={() => { navigate("/dashboard");closeMenu(); }}><a>Records</a></li>
    
    <li onClick={() => { handleUploadFile();closeMenu(); }}><a>Upload</a></li>
    
    <li>
    <a className="current-link">TimeLine</a>
  </li>
    <li onClick={() => { navigate("/profile");closeMenu();}}><a>Profile</a></li>

          
        </ul>
      </div>
      <div className="timeline-center-line"></div>

      <div className="timeline-container">
      {Object.entries(reports).map(([key, overview], index) => {
  let gradientClass = "";
  if (index % 4 === 0) gradientClass = "gradient-blue";
  else if (index % 4 === 1) gradientClass = "gradient-pink";
  else if (index % 4 === 2) gradientClass = "gradient-orange";
  else if (index % 4 === 3) gradientClass = "gradient-green";

  return (
    <div key={key} className="timeline-entry-wrapper">
      {/* Icon on center line */}
      <div className="timeline-marker">
        <img src="/paw1.png" alt="marker" />
      </div>

      {/* Report card */}
      <div className={`roadmap-item ${index % 2 === 0 ? "left" : "right"}`}>
        <div className={`report-details-timeline ${gradientClass}`}>
          <p className="report-date-timeline">{formatDate(overview.date)}</p>
          <p className="report-summary-timeline">{overview.summary}</p>
          {overview.link && (
                  <a
                    href={overview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-report-link-2"
                  >
                    View Details
                  </a>
                )}
        </div>
      </div>
    </div>
  );
})}


</div>

  

      {/* Button for downloading PDF */}
      <button onClick={handleDownloadPDF} className="download-btn-timeline">
        Download Timeline
      </button>
    </div>
  );
};

export default TimelineNew;
