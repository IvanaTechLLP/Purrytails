import React, { useState } from 'react';
import './Meeting.css'; // Import styling

const Meeting = ({ onClose, onSubmit, meetLink }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      onSubmit(email);  // Call onSubmit with the email entered
    }
  };

  return (
    <div className="meeting-popup">
      <div className="meeting-content">
        <span className="close-popup" onClick={onClose}>&times;</span> {/* Close button */}
        <h2>Send Google Meet Invite</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="email">Doctor's Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter doctor's email"
            required
          />
          <button type="submit">Send Invite</button>
        </form>
        {meetLink && (
          <div>
            <h3>Google Meet Link:</h3>
            <a href={meetLink} target="_blank" rel="noopener noreferrer">{meetLink}</a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Meeting;
