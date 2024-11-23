import React, { useState, useEffect } from 'react';
import './ChatWindow.css';
import { FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from "react-router-dom";

const ChatWindow = ({ profile,logOut }) => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState("");
  const [messageText, setMessageText] = useState(""); // State to track the message input
  const [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  // Fetch chats from the backend
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch(`http://localhost:5000/chats/${profile.user_id}`);
        const data = await response.json();
        const keys = Object.keys(JSON.parse(data));
        console.log(keys)
        setChats(keys);
      } catch (error) {
        console.error('Error fetching chats:', error);
      }
    };
    fetchChats();
  }, [profile.user_id]);

  // Fetch messages for the selected chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedChat) return;

      try {
        const response = await fetch(`http://localhost:5000/messages/${profile.user_id}/${selectedChat}`);
        const data = await response.json();
        console.log(data)
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchMessages();
  }, [profile.user_id, selectedChat]);

  // Add a new chat
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
        // Refresh the chat list
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

  // Handle sending the chat message
  const handleSendChat = async () => {
    if (!messageText || !selectedChat) return; // Don't send empty or undefined messages

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
        // Once the message is sent, clear the input field and update the message list
        setMessageText(""); // Clear the message input
        const updatedMessages = await fetch(`http://localhost:5000/messages/${profile.user_id}/${selectedChat}`);
        setMessages(await updatedMessages.json()); // Update the message list
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
        <li onClick={() => { navigate("/home"); closeMenu(); }}>Home</li>
        <li onClick={() => { navigate("/dashboard"); closeMenu(); }}>Dashboard</li>
        <li onClick={() => { navigate("/file_upload"); closeMenu(); }}>Upload Reports</li>
        <li onClick={() => { navigate("/calendar"); closeMenu(); }}>Calendar</li>
        
        
          
        <li onClick={() => { navigate("/profile"); closeMenu(); }}>View User Details</li>
          
        </ul>
        <div className="logout-container-dash">
        <ul>
          
          <li onClick={() => { logOut(); closeMenu(); }} className="logout-button">
            <FaSignOutAlt />
          </li>
        </ul>
        </div>
      </div>
      </div>
      <div className="chat-list">
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
        <h3>{selectedChat}</h3>
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
                  <span>{msg.time}</span>
                </div>
              ))}
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)} // Track the message input
              />
            <button onClick={handleSendChat} className="send-button">
              <img src="arrow.png" alt="Send" className="send-icon" />
            </button>


            </div>
          </div>
        ) : (
          <p>Select a chat to start messaging</p>
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
