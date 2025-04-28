import React, { useState ,useEffect,useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import './Upload.css';




const ImageProcessingForm = ({ profile, selectedPetId }) => {
  
  console.log("Selected Pet dog and cat:", selectedPetId.petType); // ✅ This will log on every render

  const [images, setImages] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [output, setOutput] = useState(null);
  const [showQRCodePopup, setShowQRCodePopup] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [editableDate, setEditableDate] = useState(''); 
  const [isEditing, setIsEditing] = useState(false); 
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const totalSteps = 3; 
  const [currentStep, setCurrentStep] = useState(0); 
  const location = useLocation();
  console.log(location); 
  const outputRef = useRef(null);
const [menuOpen, setMenuOpen] = useState(false);

const [fileList, setFileList] = useState([]); // Store multiple files



const handleDrop = (event) => {
  event.preventDefault();
  if (event.dataTransfer.files.length > 0) {
    setFileList([...event.dataTransfer.files]); // Store all dropped files
  }
};

const handleDragOver = (event) => {
  event.preventDefault();
};


  const files = location.state?.files;


  console.log(files); 
  useEffect(() => {
    if (files) {
      console.log("file recieved from home")
      const selectedFile = files; // Get the first file
      setImages(selectedFile);
      handleSubmit();
    }
    else{
      console.log("no file recieved from home")
    }
  }, [files]); // Dependency on files



  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
  
    if (selectedFiles.length === 0) {
      setError("No files selected.");
      return;
    }
  
    // Optional: Clear any previous error
    setError(null);
  
    // If you expect only one image or one PDF, pick the first one
    setImages(selectedFiles);
  };
  

  const handleSubmit = async () => {
    if (!images) {
      console.log("Please select a file.");
      return;
    }

    const formData = new FormData();
   
for (const image of images) {
  formData.append("files", image);
}

for (let [key, value] of formData.entries()) {
  console.log(key, value);  // Logs the key-value pairs
}

    formData.append('user_id', profile.user_id);
    formData.append('pet_id', selectedPetId);

    setLoading(true); 

    try {
      const response = await fetch('http://localhost:5000/api/process_file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      setOutput(data);
      const dates = Object.values(data).map(report => report.date);
      console.log("DATA:", data);
    
      const report_being_edited = dates[currentReport];
      setEditableDate(report_being_edited); 
      setImages([]); 

      // Log each report's info after receiving it
      console.log("Processed Reports:", data); // This will log the entire output data

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false); 
    }
  };

  const handleDateChange = (event, reportKey) => {
    const newDate = event.target.value;
    setOutput((prevOutput) => ({
      ...prevOutput,
      [reportKey]: {
        ...prevOutput[reportKey],
        editableDate: newDate,
      },
    }));
  };
  const handleUploadMoreClick = () => {
    setOutput(null); // reset output
    
  };

  const editingCurrentReport = (reportKey, reportData) => {
    setOutput((prevOutput) => ({
      ...prevOutput,
      [reportKey]: { ...reportData, isEditing: true },
    }));
    setCurrentReport(reportKey);
  };

  const handleSaveDate = async () => {
    const reportId = output[currentReport]?.report_id; 
    try {
      const response = await fetch(`http://localhost:5000/update_report_date/${reportId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_date: output[currentReport]?.editableDate }),
      });
  
      if (!response.ok) throw new Error('Failed to update date');
  
      setOutput((prevOutput) => ({
        ...prevOutput,
        [currentReport]: {
          ...prevOutput[currentReport],
          date: prevOutput[currentReport].editableDate, // Update original date
          isEditing: false,
        },
      }));
      setIsEditing(false);
    } catch (error) {
      setError(error.message);
    }
  };


  const toggleMobileMenu = () => {
    setMenuOpen(prev => !prev);
    console.log("Menu Toggle");
  };

  
  
  const closeMenu = () => {
    setIsOpen(false);
  };
  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);
  
  
  
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
  <li onClick={() => { navigate("/home-new");closeMenu();}}>
    <a >Home</a>
  </li>
    <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
    
   
    <li >
    <a className="current-link">Upload</a>
  </li>

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
        <li onClick={() => { navigate("/home-new");closeMenu(); }}><a>Home</a></li>
      
        <li onClick={() => { navigate("/dashboardnew");closeMenu(); }}><a>Records</a></li>
        <li>
    <a className="current-link">Upload</a>
  </li>
    
    <li onClick={() => { navigate("/timeline-new");closeMenu();}}><a>Timeline</a></li>
   
    <li onClick={() => { navigate("/profile-new");closeMenu();}}><a>Profile</a></li>

          
        </ul>
      </div>
      
        
      <div className="upload-page-content">
      <div className="intro-box">
            <img src="/image101.png" alt="Upload" className="upload-image" />
            <div className="upload-text">
            <h1>Upload & Process Pet Reports</h1>
            <p>"Don't paws, upload now!"</p>
            </div>
         </div>
        
      

        
         {!output && ( // Hide file upload when output is available
  <>
        
    <div
      className="file-upload-container"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      <h3 className="upload-heading">Drag & drop files to Upload</h3>
      <p>or</p>
      

      <input
        type="file"
        accept="image/*,application/pdf"
        id="file-upload"
        className="file-upload"
        multiple // Enables multiple file selection
        onChange={handleFileChange} 
      />

      <label htmlFor="file-upload" className="file-upload-label">
        {fileList.length > 0
          ? fileList.map((file) => file.name).join(", ") // Display selected file names
          : "Browse Files"}
      </label>
    </div>

    <div className="upload-actions">
  <button className="next-upload-button" onClick={handleSubmit} disabled={loading}>
    {loading ? 'Processing...' : 'Next'}
  </button>

  <img src="/catwithbook.png" alt="Description" className="upload-image-1" />
</div>

        {loading && (
  <>
    <div className="loading-overlay"></div> {/* Background dimming effect */}
    <div className="loading-banner"></div> {/* Orange banner behind popup */}
    <div className="loading-popup">
      <div className="loading-content">
        <h3 className='loading-text-1'>Please Wait </h3>
        <img src="/DogRun.gif" alt="Loading..." className="loading-gif" />
        <h3 className="loading-text">Fetching your data—no drool included!</h3>
      </div>
    </div>
  </>
)}
  </>
)}




        {error && <p className="error-message">{error}</p>}


        {output && (
          <div className="output-container-1" ref={outputRef}>
            {Object.entries(output).map(([reportKey, reportData]) => {
              // Log each report's information
              console.log(`Report Key: ${reportKey}`, reportData);

              return (
                <div key={reportData.report_id} className="report-container-1">
                  <ul className='report-list'>
                  <h3><strong> REPORT {Number(reportKey.slice(-1)) + 1} </strong></h3>

                    <li className="report-list-item-date-1">
                      <strong>Date: </strong>
                      {reportData.isEditing ? (
                        <>
                          <input
                            type="date"
                            value={reportData.editableDate || reportData.date}
                            onChange={(e) => handleDateChange(e, reportKey)}
                            style={{ marginRight: '10px' }}
                          />
                        </>
                      ) : (
                        <>
                          <span className='report-date-2'>{reportData.editableDate || reportData.date}</span>
                          <button
                            className="edit-date-button"
                            onClick={() => editingCurrentReport(reportKey, reportData)}
                          >
                            Edit Date
                          </button>
                        </>
                      )}
                    </li>
                    <li className="report-list-item"><strong>Doctor: </strong>  {reportData.doctor}</li>
                    <li className="report-list-item"><strong>Type: </strong>  {reportData.document}</li>
                    <li className="report-list-item"><strong>Diseases: </strong> {reportData.diseases}</li>
                    <li className="report-list-item"><strong>Medicines: </strong> {reportData.medicines}</li>
                   {/* <li className="report-list-item"><strong>Domain: </strong> {reportData.doctor}</li>*/}
                   <li className="report-list-item button-container">
    <a href={reportData.link} target="_blank" rel="noopener noreferrer" className="view-report-link-1">
        View Report
    </a>

    {reportData.isEditing && (
        <button className="save-date-button" onClick={handleSaveDate}>
            Save
        </button>
    )}
</li>
                        </ul>
                        <button
    className="upload-more-button"
    onClick={handleUploadMoreClick}
  >
    Upload More
  </button>
                      </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageProcessingForm;
