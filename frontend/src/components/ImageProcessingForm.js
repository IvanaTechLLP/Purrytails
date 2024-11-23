import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ImageProcessingForm.css';


const ImageProcessingForm = ({ profile, logOut }) => {
  const [image, setImage] = useState(null);
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



  

  const handleImageChange = (event) => {
    const selectedImage = event.target.files[0];
    setImage(selectedImage);
    setError(null); 
  };

  const handleSubmit = async () => {
    if (!image) {
      setError("Please select a file.");
      return;
    }

    const formData = new FormData();
    formData.append('file', image);
    formData.append('user_id', profile.user_id);

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
      setImage(null); 

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


  const handleCloseQRCodePopup = () => {
    setShowQRCodePopup(false);
    setQRCodeImage(null);
  };

  const handleShowUserDetails = () => {
    navigate("/profile", { state: { userDetails } });
  };
  const instructions = [
    {
      imgSrc: "scan1.png",
      title: "1. Scan the Document",
      description: "Take a clear photo of the document for the best results.",
    },
    {
      imgSrc: "upload1.png",
      title: "2. Upload the Document",
      description: "Upload the scanned document in image or PDF format.",
    },
    {
      imgSrc: "edit1.png",
      title: "3. Edit the Date",
      description: "Edit the date if it's incorrect. Click on the Save button.",
    },
  ];
  const nextStep = () => {
    setCurrentStep((prevStep) => Math.min(prevStep + 1, totalSteps - 1));
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0));
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
        &#9776; {/* Hamburger icon */}
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="back-arrow" onClick={closeMenu}>
            &larr; {/* Back arrow icon */}
        </button>
        <h2>Menu</h2>
        <ul>
          <li onClick={() => { navigate("/dashboard"); closeMenu(); }}> Dashboard</li>
          <li onClick={() => { navigate("/calendar"); closeMenu(); }}>Calendar</li>
          <li onClick={() => { handleShowUserDetails(); closeMenu(); }}>View User Details</li>
          
        </ul>
        <ul>
          <li onClick={() => { logOut(); closeMenu(); }} className="logout-button">Log Out</li>
        </ul>
      </div>
      </div>

      <div className="dashboard-content">
        <h1 className="image-upload-title">Document Upload</h1>
        
      <h3 className="instruction-heading">Instructions for Uploading Documents</h3>
        
        <div className="instruction-cards">
          <div className="instruction-card">
            <img src="scan1.png" alt="Choose a file" className="instruction-image" />
            <h3>Scan the Document</h3>
            <p>Take a clear photo of the document for the best results.</p>
          </div>
          
          <div className="instruction-card">
            <img src="upload1.png" alt="File Format" className="instruction-image" />
            <h3>Upload the Document</h3>
            <p>Upload the scanned document in image or PDF format. Click "Process Document" to process it.</p>
          </div>
          
          <div className="instruction-card">
            <img src="edit1.png" alt="Process File" className="instruction-image" />
            <h3>Edit the Date (if required)</h3>
            <p>Edit the date if it's incorrect. Click on the Save button.</p>
          </div>
        </div>
          <div className="mobile-instruction-cards">
          <div className="mobile-instruction-card">
            <img src={instructions[currentStep].imgSrc} alt={instructions[currentStep].title} className="instruction-image" />
            <h3>{instructions[currentStep].title}</h3>
            <p>{instructions[currentStep].description}</p>
          </div>
        </div>

        <div className="navigation-buttons">
        {currentStep > 0 && (
          <span className="arrow prev-arrow" onClick={prevStep}>
            &#8592; {/* Left arrow */}
          </span>
          )}
          {currentStep < totalSteps - 1 && (
            <span className="arrow next-arrow" onClick={nextStep}>
              &#8594; {/* Right arrow */}
            </span>
          )}
        </div>

        

        
        <div className="file-upload-container">
          <h3 className="upload-heading">Upload Your File</h3>
          <input
            type="file"
            accept="image/*,.pdf"
            id="file-upload"
            className="file-upload"
            onChange={handleImageChange}
          />
          <label htmlFor="file-upload" className="file-upload-label">
            {image ? image.name : "Upload a Document"}
          </label>
        </div>

        <button className="form-container sexy-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Processing...' : 'Process File'}
        </button>

        {loading && <div className="loader">Please wait while we process the document...</div>} 

        {error && <p className="error-message">{error}</p>}

        {showQRCodePopup && qrCodeImage && (
          <div className="qr-code-popup">
            <div className="qr-code-content">
              <span className="close-popup" onClick={handleCloseQRCodePopup}>
                &times;
              </span>
              <img src={qrCodeImage} alt="QR Code" />
            </div>
          </div>
        )}

        {output && (
          <div className="output-container">
            <h3>Processed Output:</h3>
            {Object.entries(output).map(([reportKey, reportData]) => {
              // Log each report's information
              console.log(`Report Key: ${reportKey}`, reportData);

              return (
                <div key={reportData.report_id} className="report-container">
                  <ul>
                    <li>
                      <strong>Date:</strong>
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
                          <span>{reportData.editableDate || reportData.date}</span>
                          <button
                            className="edit-button"
                            onClick={() => editingCurrentReport(reportKey, reportData)}
                          >
                            Edit
                          </button>
                        </>
                      )}
                    </li>
                    <li><strong>Doctor:</strong> {reportData.doctor}</li>
                    <li><strong>Type:</strong> {reportData.document}</li>
                    <li><strong>Diseases:</strong> {reportData.diseases}</li>
                    <li><strong>Medicines:</strong> {reportData.medicines}</li>
                    <li><strong>Domain:</strong> {reportData.doctor}</li>
                    <li>
            <strong>Link:</strong> 
            <a href={reportData.link} target="_blank" rel="noopener noreferrer">
              View Report
            </a>
          </li>
                  </ul>
                  {reportData.isEditing && (
                    <button
                      className="save-button"
                      onClick={handleSaveDate}
                    >
                      Save
                    </button>
                  )}
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
