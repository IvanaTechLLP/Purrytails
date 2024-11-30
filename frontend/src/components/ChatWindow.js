import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import './ChatWindow.css';
import { FaHome, FaTachometerAlt, FaFileUpload, FaCalendarAlt, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const ChatWindow = ({ profile, logOut }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [messageText, setMessageText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("access_token"));
  const navigate = useNavigate();
 
  const messagesEndRef = useRef(null); // Ref to track the messages container

  // Function to scroll to the bottom of the messages container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to the latest message whenever messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch chats from the backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/chats/${profile.user_id}`);
        const data = await response.json();
        const keys = Object.keys(JSON.parse(data));
        setChats(keys);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [accessToken, profile?.user_id]);

  // Fetch messages for the selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const response = await fetch(`http://localhost:5000/messages/${profile.user_id}/${selectedChat}`);
        const data = await response.json();
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [accessToken, profile?.user_id, selectedChat]);

  const handleAddChat = async () => {
    if (!newChatEmail) return;

    try {
      const response = await fetch("http://localhost:5000/start_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: profile.user_id, email: newChatEmail }),
      });

      if (response.ok) {
        alert("Chat added successfully!");
        setIsPopupOpen(false);
        setNewChatEmail("");

        const response = await fetch(`http://localhost:5000/chats/${profile.user_id}`);
        const data = await response.json();
        const keys = Object.keys(JSON.parse(data));
        setChats(keys);
      } else {
        alert("Failed to add chat.");
      }
    } catch (error) {
      console.error("Error adding chat:", error);
    }
  };

  const handleSendChat = async () => {
    if (!messageText || !selectedChat) return;

    try {
      const response = await fetch("http://localhost:5000/send_chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: profile.user_id,
          email: selectedChat,
          message: messageText,
        }),
      });

      if (response.ok) {
        setMessageText("");
        const updatedMessages = await fetch(`http://localhost:5000/messages/${profile.user_id}/${selectedChat}`);
        setMessages(await updatedMessages.json());
      } else {
        alert("Failed to send message.");
      }
    } catch (error) {
      console.error("Error sending chat:", error);
    }
  };

  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="chat-page">
      <div classname="dashboard-left">
        <button className="hamburger" onClick={handleToggle}>
          &#9776;
        </button>
        <div className={`sidebar ${isOpen ? 'open' : ''}`}>
          <button className="back-arrow" onClick={closeMenu}>
            &larr;
          </button>
          <h2>Menu</h2>
          <ul className="menu-items">
                <li onClick={() => { navigate("/home"); closeMenu(); }} title="Home">
          <FaHome />
          
        </li>
        <li onClick={() => { navigate("/dashboard"); closeMenu(); }}  className='menu-button' title="Dashboard">
          <FaTachometerAlt /> 
        </li>
        <li onClick={() => { navigate("/file_upload"); closeMenu(); }}className='menu-button'  title="Upload Reports">
          <FaFileUpload /> 
        </li>
        <li onClick={() => { navigate("/calendar"); closeMenu(); }} className='menu-button' title="Calendar">
          <FaCalendarAlt /> 
        </li>
        <li onClick={() => { navigate("/profile"); closeMenu(); }} className='menu-button' title="User Settings">
          <FaUser /> 
        </li>
          </ul>
          <div className="logout-container-dash">
            <ul>
              <li onClick={() => { logOut(); closeMenu(); }} className="logout-button" title="Log Out">
                <FaSignOutAlt />
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className={`chat-list ${selectedChat ? "deactivated" : ""}`}>
        <div className="chat-header">
          <h2>Chats</h2>
          <div className="search-container">
            <span className="search-icon"></span>
            <input
              type="text"
              className="search-bar"
              placeholder="Search chats..."
            />
          </div>
        </div>
        {chats.map((chat) => (
          <div
            key={chat}
            className={`chat-item ${selectedChat === chat ? "active" : ""}`}
            onClick={() => setSelectedChat(chat)}
          >
            <h4>{chat}</h4>
            <p>Tap here to chat</p>
          </div>
        ))}
        <button className="add-chat-btn" onClick={() => setIsPopupOpen(true)}>
          <span className="plus-icon">+</span>
        </button>
      </div>

      <div className="chat-window">
        {selectedChat ? (
          <div>
            <div className="chat-header-one">
            
              
              <button className="back-arrow-btn" onClick={() => setSelectedChat(null)}>
            &larr;
          
            </button>
              <h4>{selectedChat}</h4>
              <button className="video-call-btn">
                <img src="video.png" alt="Video Call" />
              </button>
            </div>
            <div className="messages">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message ${msg.sender === "you" ? "self" : "them"}`}
                >
                  <p>{msg.content}</p>
                  
                </div>
              ))}
              {/* Ref element to scroll */}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
              />
              <button onClick={handleSendChat} className="send-button">
                <img src="arrow.png" alt="Send" className="send-icon" />
              </button>
            </div>
          </div>
        ) : (
          <p className="no-chat">Select a chat to start messaging</p>
        )}
      </div>
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h3>Add New Chat</h3>
            <input
              type="email"
              placeholder="Enter email"
              value={newChatEmail}
              onChange={(e) => setNewChatEmail(e.target.value)}
            />
            <div className="popup-actions">
              <button onClick={handleAddChat}>Save</button>
              <button onClick={() => setIsPopupOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
