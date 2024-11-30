import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());
  const [successMessage, setSuccessMessage] = useState(''); // For success confirmation

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEvent({ title, start, end });
    setSuccessMessage('Event added successfully!'); // Display success message

    // Reset form fields
    setTitle('');
    setStart(new Date());
    setEnd(new Date());
  
  };

  return (
    <div className="event-popup">
      <form className="event-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="event-input-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event Title"
          required
        />
        <input
          type="datetime-local"
          className="event-input-start"
          value={start.toISOString().substring(0, 16)}
          onChange={(e) => setStart(new Date(e.target.value))}
          required
        />
        <input
          type="datetime-local"
          className="event-input-end"
          value={end.toISOString().substring(0, 16)}
          onChange={(e) => setEnd(new Date(e.target.value))}
          required
        />
        <button type="submit" className="event-submit-button">
          Add Event
        </button>
      </form>

      {successMessage && <p className="success-message">{successMessage}</p>} {/* Success message */}
    </div>
  );
};

export default EventForm;
