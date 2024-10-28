import React from "react";
import { useNavigate } from "react-router-dom";
import "./UserProfilePage.css";

const UserProfilePage = ({ profile, logOut }) => {
  const navigate = useNavigate();

  if (!profile) {
    return <p>Loading...</p>; 
    }

  return (
    <div className="profile-page">
      <button className="back-button" onClick={() => navigate(-1, { state: { showPopup: false } })}>
        Go Back
      </button>
      <img src={profile.picture} alt="user" className="profile-image" />
      <p>Name: {profile.name}</p>
      <p>Email: {profile.email}</p>
      <button
        onClick={() => {
          logOut();
          navigate("/login");
        }}
      >
        Log out
      </button>
    </div>
  );
};

export default UserProfilePage;
