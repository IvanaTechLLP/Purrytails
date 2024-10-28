import React, { useEffect, useState } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import "react-big-calendar/lib/css/react-big-calendar.css";
import EventForm from './EventForm'; // Import the event form
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import "./Calendar.css";

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
  const [showQRCodePopup, setShowQRCodePopup] = useState(false);
  const [qrCodeImage, setQRCodeImage] = useState(null);
  const [inputText, setInputText] = useState('');
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));

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

  const handleShowQRCode = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/qr_codes/${profile.user_id}.png`
      );
      if (response.ok) {
        const imageBlob = await response.blob();
        const imageObjectURL = URL.createObjectURL(imageBlob);
        setQRCodeImage(imageObjectURL);
        setShowQRCodePopup(true);
      } else {
        const generateResponse = await fetch(
          `http://localhost:5000/generate_qr_code/${profile.user_id}`,
          { method: "POST" }
        );
        if (generateResponse.ok) {
          const fetchQRCodeResponse = await fetch(
            `http://localhost:5000/qr_codes/${profile.user_id}.png`
          );
          if (fetchQRCodeResponse.ok) {
            const imageBlob = await fetchQRCodeResponse.blob();
            const imageObjectURL = URL.createObjectURL(imageBlob);
            setQRCodeImage(imageObjectURL);
            setShowQRCodePopup(true);
          } else {
            console.error("Failed to fetch the newly generated QR code.");
          }
        } else {
          console.error("Error generating QR code:", generateResponse.statusText);
        }
      }
    } catch (error) {
      console.error("Error handling QR code:", error);
    }
  };

  const handleCloseQRCodePopup = () => {
    setShowQRCodePopup(false);
    setQRCodeImage(null);
  };

  const handleShowUserDetails = () => {
    navigate("/profile");
  };

  const handleShowDashboard = () => {
    navigate("/dashboard", { state: { showPopup: false } });
  }


  const CustomEvent = ({ event }) => {
    return (
      <div className="event-container"> {/* New container for flex layout */}
        <strong>{event.title}</strong>
        <button className="delete-button" onClick={() => handleDeleteEvent(event.event_id, event.title)}>Delete</button>
      </div>
    );
  };
  
  return (
    <div className="calendar-wrapper">
      <div className="sidebar">
        <h2>Menu</h2>
        <ul>
          <li onClick={handleShowQRCode}>View QR Code</li>
          <li onClick={handleUploadFile}>Upload Reports</li>
          <li onClick={handleShowUserDetails}>View User Details</li>
          <li onClick={handleShowDashboard}>Dashboard</li>
        </ul>
        <ul className="logout-button">
          <li onClick={logOut} className="logout-button">Log Out</li>
        </ul>
      </div>
      
      <div className="calendar-content">
        <h2>Google Calendar Events</h2> 
        {/* Text input and submit button */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={inputText}
            onChange={handleInputChange}
            placeholder="Enter your calendar request"
          />
          <button type="submit">Submit</button>
        </form>
        <BigCalendar
          localizer={dateFnsLocalizerVariable}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500, margin: "50px" }}
          components={{
            event: CustomEvent,
          }}
          views={["agenda"]}
          defaultView="agenda"
        />
        <EventForm onAddEvent={handleAddEvent} />
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
      </div>
    </div>
  );
};

export default Calendar;
