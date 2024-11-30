import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from './EventForm'; 
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Calendar.css";
import { FaSignOutAlt,FaUser,FaHome,FaTachometerAlt,FaFileUpload,FaComments } from 'react-icons/fa';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const dateFormat = 'dd/MM/yyyy HH:mm'; // Change date format
const dateFnsLocalizerVariable = dateFnsLocalizer({
  format: (date) => format(date, dateFormat),
  parse: (date) => parse(date, dateFormat, new Date()),
  startOfWeek: () => startOfWeek(new Date()),
  getDay,
  locales,
});

const Calendar = ({ logOut, profile }) => {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate(); // Initialize navigate for routing
  const [inputText, setInputText] = useState('');
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const [isOpen, setIsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null); // State for selected event

  const handleSelectEvent = (event) => {
    setSelectedEvent(event); // Set the clicked event as the selected event
  };

  const handleClosePopup = () => {
    setSelectedEvent(null); // Close the popup
  };

  useEffect(() => {

    if (!accessToken) {
      console.log("No access token found. Redirect to login.");
      return;
    }

    if (profile?.user_id) {
      fetchAllEvents();
    }
  }, [accessToken,  profile?.user_id]); // Run when accessToken changes

  const fetchAllEvents = async () => {
    try {
      const response = await fetch(`http://localhost:5000/get_user_events/${profile.user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`, // Include token if needed
        },
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch events from the server");
      }
  
      const fetched_events = await response.json();
      const eventsList = JSON.parse(fetched_events);
      
      const formattedEvents = eventsList.map((fetched_event) => ({
        id: fetched_event.event_id, // Ensure your event object has an 'id'
        title: fetched_event.event_name, // Adjust based on your event structure
        start: new Date(fetched_event.start_datetime), // Adjust date format if necessary
        end: new Date(fetched_event.end_datetime), // Adjust date format if necessary
      }));
  
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const handleAddEvent = async (event) => {
    const response = await fetch("http://localhost:5000/create_event_directly", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title: event.title,
            start: event.start.toISOString(),
            end: event.end.toISOString(),
            access_token: accessToken,  // Pass the access token
            user_id: profile.user_id     // Pass the user ID
        }),
    });

    if (response.ok) {
        const result = await response.json();
        console.log("Event created successfully:", result);
        setEvents((prevEvents) => [...prevEvents, event]); // Update local state
    } else {
        console.error("Error creating event:", response.statusText);
    }
  };
  
  const handleDeleteEvent = async (eventId, eventName) => {
    // Call your backend API to delete the event
    const response = await fetch("http://localhost:5000/delete_event", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName, // Pass the event name to delete
        event_id: eventId, // Pass the event ID to delete
        user_id: profile.user_id, // Pass the user ID
        access_token: accessToken, // Pass the access token
      }),
    });
  
    if (response.ok) {
      // Remove from local state
      setEvents((prevEvents) => prevEvents.filter(event => event.event_id !== eventId));
      console.log("Event deleted from local database and Google Calendar.");
    } else {
      console.error("Error deleting event:", response.statusText);
    }
  };
  

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      const response = await fetch("http://localhost:5000/calendar_request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          access_token: accessToken,  // Include the token received from Google OAuth
          user_id: profile.user_id, // Include the user ID
      })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Text submitted successfully:", result);
        // fetchAllEvents(); // Fetch all events again
      } else {
        console.error("Failed to submit text:", response.statusText);
      }
    } catch (error) {
      console.error("Error sending text to backend:", error);
    }
  };
  

  // Add menu handler functions
  const handleUploadFile = () => {
    navigate("/file_upload");
  };



  const handleShowUserDetails = () => {
    navigate("/profile");
  };



  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const handleToggleForm = () => {
    setIsFormOpen(!isFormOpen); // Toggle the visibility of the event form
  };
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }), // Ensure this returns a valid date object
    getDay,
    locales: {
      'en-US': require('date-fns/locale/en-US'),
    },
  });
  
  return (
    <div className="calendar-wrapper">
      <div classname="dashboard-left">
      <button className="hamburger" onClick={handleToggle}>
        &#9776; 
      </button>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <button className="back-arrow" onClick={closeMenu}>
            &larr; 
        </button>
        <h2>Menu</h2>
        <ul>
        <li onClick={() => { navigate("/home"); closeMenu(); }} title="Home">
          <FaHome />
          
        </li>
        
        <li onClick={() => { navigate("/dashboard"); closeMenu(); }}className='menu-button'  title="DashBoard">
          <FaTachometerAlt /> 
        </li>
        <li onClick={() => {handleUploadFile();; closeMenu(); }} className='menu-button' title="Upload reports">
          <FaFileUpload /> 
        </li>
        <li onClick={() => { navigate("/chat"); closeMenu(); }} title="Chat">
        <FaComments /> 
      </li>
        <li onClick={() => { navigate("/profile"); closeMenu(); }} className='menu-button' title="User Settings">
          <FaUser /> 
        </li>
       
        
          
        </ul>
        <ul>
        <li onClick={() => { logOut(); closeMenu(); }} className="logout-button">
            <FaSignOutAlt />
          </li>
        </ul>
      </div>
      </div>
      <div className="calendar-container">
    <div className="sidebar-left">
      <div className="date-display">
        <h1>{format(new Date(), 'dd')}</h1>
        <p>{format(new Date(), 'EEEE').toUpperCase()}</p>
      </div>
      <form onSubmit={handleSubmit}>
    <input
      type="text"
      value={inputText}
      onChange={handleInputChange}
      placeholder="Enter your calendar request"
    />
    <button className="calendar-submit-button" type="submit">Submit</button>
  </form>
      <div className="current-events">
        <h3>Current Events</h3>
        <ul>
          {events.map((event) => (
            <li key={event.id}>
              <strong>{format(event.start, 'EEEE, dd/MM/yyyy')}</strong>
              <p>{event.title}</p>
            </li>
          ))}
        </ul>
      </div>
      
      <button className="add-event-button" onClick={handleToggleForm}>+</button>

{}
{isFormOpen && (
  <div className="popup">
    <div className="popup-content">
      <h4>Create an Event</h4>
      <EventForm onAddEvent={handleAddEvent} />
      <button className="close-popup" onClick={handleToggleForm}>&#10006;</button>
    </div>
  </div>
)}

    </div> 
      
  </div>
  <div className="calendar-content">
  <div className="calendar-content">
        <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '500px', width: '90%', margin: '20px 0', borderRadius: '10px', border: '1px solid #ccc' }}
        views={['month']}
        selectable
        onSelectEvent={handleSelectEvent}
        dayPropGetter={(date) => {
          const hasEvent = events.some((event) =>
            format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
          );
          return { className: hasEvent ? 'highlighted-day' : '' };
        }}
      />
          {selectedEvent && (
            <div className="eventpopup">
              <div className="eventpopup-content">
                <h4>Event Details</h4>
                <button className="close" onClick={handleClosePopup}>&#10006;</button>
                <p><strong>Title:</strong> {selectedEvent.title}</p>
                <p><strong>Start:</strong> {format(selectedEvent.start, 'dd/MM/yyyy HH:mm')}</p>
                <p><strong>End:</strong> {format(selectedEvent.end, 'dd/MM/yyyy HH:mm')}</p>
                <button className="delete" onClick={() => handleDeleteEvent(selectedEvent.id, selectedEvent.title)}>Delete</button>
                
              </div>
            </div>
          )}
      
      </div>
</div>
      
      
      </div>
   
  );
};

export default Calendar;
