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
    <form onSubmit={handleSubmit}>
      <input 
        type="text" 
        value={title} 
        onChange={(e) => setTitle(e.target.value)} 
        placeholder="Event Title" 
        required 
      />
      <input 
        type="datetime-local" 
        value={start.toISOString().substring(0, 16)} 
        onChange={(e) => setStart(new Date(e.target.value))} 
        required 
      />
      <input 
        type="datetime-local" 
        value={end.toISOString().substring(0, 16)} 
        onChange={(e) => setEnd(new Date(e.target.value))} 
        required 
      />
      <button type="submit">Add Event</button>
    </form>
  );
};

export default EventForm;
