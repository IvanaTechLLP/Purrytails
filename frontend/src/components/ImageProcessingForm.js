import React, { useState ,useEffect,useRef } from 'react';
import { useNavigate,useLocation } from 'react-router-dom';
import './ImageProcessingForm.css';
import { FaSignOutAlt,FaHome, FaTachometerAlt, FaCalendarAlt, FaUser, FaComments} from 'react-icons/fa';
import { MdTimeline } from 'react-icons/md';


const ImageProcessingForm = ({ profile, logOut, selectedPetId }) => {
  const [images, setImages] = useState([]);
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

  const files = location.state?.files;


  console.log(files); 
  useEffect(() => {
    if (files && files.length > 0) {
      console.log("file recieved from home")
      const selectedFile = files[0]; // Get the first file
      setImages(selectedFile);
      handleSubmit();
    }
    else{
      console.log("no file recieved from home")
    }
  }, [files]); // Dependency on files



  const handleImageChange = (event) => {
    const selectedImages = Array.from(event.target.files);
    setImages(selectedImages);
    setError(null); 
  };

  const handleSubmit = async () => {
    if (!images) {
      console.log("Please select a file.");
      return;
    }

    const formData = new FormData();
    console.log("Selected Image:", images);

    images.forEach((image) => {
      formData.append("files", image);  // Append each file separately
    });

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

  
  const instructions = [
    {
      imgSrc: "scan-icon.png",
      title: "1. Scan the Document",
      description: "Take a clear photo of the document for the best results.",
    },
    {
      imgSrc: "upload-icon.png",
      title: "2. Upload the Document",
      description: "Upload the scanned document in image or PDF format.",
    },
    {
      imgSrc: "edit-icon.png",
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
  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);
  
  
  return (
    <div className="dashboard-wrapper">
      
        <div classname="dashboard-left">
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
        
        <ul className="menu-items">
                <li onClick={() => { navigate("/home"); closeMenu(); }} title="Home">
          <FaHome  className="home-icon" /> <span>Home</span>
          
        </li>
        
        <li onClick={() => { navigate("/dashboard"); closeMenu(); }}className='menu-button'  title="DashBoard">
          <FaTachometerAlt  className="home-icon" /> <span>Records</span>
        </li>
        {/*
        <li onClick={() => { navigate("/calendar"); closeMenu(); }} className='menu-button' title="Calendar">
          <FaCalendarAlt /> 
        </li>
        <li onClick={() => { navigate("/chat"); closeMenu(); }} title="Chat">
        <FaComments /> 
      </li>
      */}
      <li onClick={() => { navigate("/timeline"); closeMenu(); }} className='menu-button' title="Timeline">
                <MdTimeline   className="home-icon" /> <span>TimeLine</span>
              </li>
             
        <li onClick={() => { navigate("/profile"); closeMenu(); }} className='menu-button' title="User Settings">
          <FaUser  className="home-icon" /> <span>Profile</span>
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

      <div className="dashboard-content" onClick={() => {closeMenu(); }}>
        <h1 className="image-upload-title">Document Upload</h1>
        
      <h3 className="instruction-heading">Instructions for Uploading Documents</h3>
        
        <div className="instruction-cards">
          <div className="instruction-card">
            <img src="scan-icon.png" alt="Choose a file" className="instruction-image" />
            <h3>Scan the Document</h3>
            <p>Take a clear photo of the document for the best results.</p>
          </div>
          
          <div className="instruction-card">
            <img src="upload-icon.png" alt="File Format" className="instruction-image" />
            <h3>Upload the Document</h3>
            <p>Upload the scanned document in image or PDF format. Click "Process Document" to process it.</p>
          </div>
          
          <div className="instruction-card">
            <img src="edit-icon.png" alt="Process File" className="instruction-image" />
            <h3>Edit the Date (if required)</h3>
            <p>Edit the date if it's incorrect. Click on the Save button.</p>
          </div>
        </div>
        {/*
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
            &#8592; 
          </span>
          )}
          {currentStep < totalSteps - 1 && (
            <span className="arrow next-arrow" onClick={nextStep}>
              &#8594; 
            </span>
          )}
        </div>
        */}

        

        
        <div className="file-upload-container">
          <h3 className="upload-heading">Upload Your Document</h3>
          <input
            type="file"
            accept="image/*,.pdf"
            id="file-upload"
            className="file-upload"
            multiple
            onChange={handleImageChange}
          />
          <label htmlFor="file-upload" className="file-upload-label">
            {images > 0 ? images.map((file) => file.name).join(", ") : "Upload Documents"}
          </label>
        </div>

        <button className="form-container sexy-button" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Processing...' : 'Process'}
        </button>

        {loading && <div className="loader">Fetching your data—no drool included!</div>} 

        {error && <p className="error-message">{error}</p>}


        {output && (
          <div className="output-container" ref={outputRef}>
            <h3>Processed Output:</h3>
            {Object.entries(output).map(([reportKey, reportData]) => {
              // Log each report's information
              console.log(`Report Key: ${reportKey}`, reportData);

              return (
                <div key={reportData.report_id} className="report-container">
                  <ul className='report-list'>
                    <li className="report-list-item-date">
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
                    <li className="report-list-item"><strong>Doctor: </strong>  {reportData.doctor}</li>
                    <li className="report-list-item"><strong>Type: </strong>  {reportData.document}</li>
                    <li className="report-list-item"><strong>Diseases: </strong> {reportData.diseases}</li>
                    <li className="report-list-item"><strong>Medicines: </strong> {reportData.medicines}</li>
                   {/* <li className="report-list-item"><strong>Domain: </strong> {reportData.doctor}</li>*/}
                  <li className="report-list-item">
                  <strong>Link: </strong> 
                  <a href={reportData.link} target="_blank" rel="noopener noreferrer" className="view-report-link">
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
