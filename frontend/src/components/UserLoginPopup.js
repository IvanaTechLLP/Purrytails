import React from "react";
import "./UserLoginPopup.css";

const UserPopup = ({ onClose, profile, logOut }) => {
  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button as a small cross */}
        <span className="close-button" onClick={onClose}>
          &times; {/* This is the "X" symbol */}
        </span>

        <img src={profile.picture} alt="user" />
        <p>Name: {profile.name}</p>
        <p>Email: {profile.email}</p>
        <button
          onClick={() => {
            console.log("Logout button clicked");
            logOut();
          }}
        >
          Log out
        </button>
      </div>
    </div>
  );
};

export default UserPopup;
