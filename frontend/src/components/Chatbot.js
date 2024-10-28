import React, { useState, useEffect, useRef } from "react";
import "./Chatbot.css"; // Import CSS file for styling

const Chatbot = ({ profile, setReports, showChatbot, setShowChatbot }) => {
  const [messages, setMessages] = useState([
    { user: "agent", message: "Hi there! How can I help you today?" },
  ]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Added states for speech recognition
  const recognitionRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        console.log("Speech recognition started");
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserInput((prevInput) => prevInput + " " + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setError("Speech recognition error: " + event.error);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended");
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      setError("Speech recognition not supported in this browser.");
    }
  }, []);

  // Handle Mic Button Click
  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
        setError(null); // Clear any previous errors
      } else {
        setError("Speech recognition not supported in this browser.");
      }
    }
  };

  const sendMessage = async () => {
    if (userInput.trim() === "") {
      return;
    }

    setMessages((prevMessages) => [
      ...prevMessages,
      { user: "user", message: userInput },
    ]);
    setUserInput("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/llm_chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput, user_id: profile.user_id, user_type: profile.user_type }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server.");
      }

      const data = await response.json();
      console.log(data.relevant_reports);
      if (data.relevant_reports && profile.user_type == "patient") setReports(data.relevant_reports);

      const response_str = data.response.replace(/^"|"$/g, ""); // Remove double quotes from the response
      setMessages((prevMessages) => [
        ...prevMessages,
        { user: "agent", message: response_str },
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = document.getElementById("message-list").lastChild;
      if (lastMessage) {
        lastMessage.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages]);

  // Return null if the chatbot is not visible
  if (!showChatbot) return null;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-content">
          <img
            src="/dd.png"
            alt="Chat"
            width={32}
            height={32}
            className="chat-logo"
          />
          <span>Doctor Dost</span>
        </div>
        <button
          className="chat-close-button"
          onClick={() => setShowChatbot(false)} // Close chatbot when clicked
        >
          &times;
        </button>
      </div>

      <div className="chat-messages" id="message-list">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`chat-message ${
              message.user === "user" ? "user-message" : "agent-message"
            }`}
          >
            {message.message}
          </div>
        ))}
        {loading && <div className="chat-loading">Typing...</div>}
        {error && <div className="chat-error">{error}</div>}
      </div>

      <div className="chat-input">
        {/* Mic button with onClick handler */}
        <button
          className={`mic-button ${isRecording ? "recording" : ""}`}
          type="button"
          onClick={handleMicClick}
        >
          <img src="/mic1.png" alt="Mic" width={24} height={24} />
        </button>

        <input
          id="chat"
          className="chat-input-field"
          placeholder="Send a Message..."
          name="chat"
          onChange={(e) => setUserInput(e.target.value)}
          value={userInput}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" type="button" onClick={sendMessage}>
          <img src="/send.svg" alt="Send" width={20} height={20} />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
