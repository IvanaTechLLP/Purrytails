import React, { useState } from 'react';
import './EventForm.css';

const EventForm = ({ onAddEvent }) => {
  const [title, setTitle] = useState('');
  const [start, setStart] = useState(new Date());
  const [end, setEnd] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddEvent({ title, start, end });
    setTitle('');
    setStart(new Date());
    setEnd(new Date());
  };

  return (
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
        className="event-input-start"
        value={end.toISOString().substring(0, 16)} 
        onChange={(e) => setEnd(new Date(e.target.value))} 
        required 
      />
      
      <button type="submit" className="event-submit-button">Add Event</button>
    </form>
  );
  

};

export default EventForm;
