import React, { useState, useEffect, useRef } from "react";
import { QrReader } from "react-qr-reader";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import ReactDOM from 'react-dom';
import './QrScanner.css';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [cameraActive, setCameraActive] = useState(false); // To track camera state
  const qrReaderContainerRef = useRef(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const handleScan = (data) => {
    if (data) {
      setScanResult(data);
      setErrorMessage(''); // Clear error message on successful scan
      stopCamera(); // Stop the camera after a successful scan
    }
  };

  const handleError = (err) => {
    console.error("Scanning Error:", err); // Log specific error
    setErrorMessage('Error scanning QR code. Please try again.');
  };

  const handleNavigate = async () => {
    try {
      // Send scanResult to the backend API /decrypt
      const response = await fetch('/api/decrypt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: scanResult }), // Send the scan result as payload
      });
  
      if (!response.ok) {
        throw new Error('Failed to decrypt QR code');
      }
  
      // Get the result from the backend (assumed to be the URL or route to navigate to)
      const result = await response.text(); // Assuming the API returns a simple text URL
      const strippedStr = result.replace(/^"|"$/g, '');
      // Navigate to the result received from the API
      console.log(strippedStr);
      const url = new URL(strippedStr);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error during QR decryption and navigation:', error);
      setErrorMessage('Failed to process QR code. Please try again.');
    }
  };

  // Function to start the QR Reader
  const startCamera = () => {
    setCameraActive(true);
    if (qrReaderContainerRef.current) {
      ReactDOM.render(
        <QrReader
          onResult={(result, error) => {
            if (!!result) {
              handleScan(result?.text);
            }
            if (!!error) {
              handleError(error);
            }
          }}
          style={{ width: '100%' }}
        />,
        qrReaderContainerRef.current
      );
    }
  };

   // Function to stop the camera and unmount the QrReader component
   const stopCamera = () => {
    if (qrReaderContainerRef.current) {
      ReactDOM.unmountComponentAtNode(qrReaderContainerRef.current); // Unmount the QrReader component
    }
    console.log("Camera stopped.");
    setCameraActive(false);
  };

  useEffect(() => {
    // Ensure the camera is stopped on component unmount
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="qr-scanner-wrapper">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={() => navigate("/profile")}>View Profile</li>
        </ul>
        <ul>
          <li onClick={() => navigate("/doctor")}>Doctor Dashboard</li>
        </ul>
      </div>

      <div className="qr-scanner-container">
        <h1 className="qr-scanner-title">QR Code Scanner</h1>
        <div ref={qrReaderContainerRef} className="qr-reader-container">
          {/* Stylish QR Box Overlay */}
          <div className="qr-reader-overlay"></div>
        </div>
        
        <div className="camera-control-buttons">
          {!cameraActive ? (
            <button className="start-camera-button" onClick={startCamera}>
              Start Camera
            </button>
          ) : (
            <button className="stop-camera-button" onClick={stopCamera}>
              Stop Camera
            </button>
          )}
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {scanResult && (
        <div>
          <h3>Scanned Result:</h3>
          <button className="navigate-button" onClick={handleNavigate}>
              Go to Patient Screen 
            </button>
        </div>
      )}

      </div>
    </div>
  );
};

export default QrScanner;
