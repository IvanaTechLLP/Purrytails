import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Timeline.css";

const Timeline = ({ profile }) => {
  const [overviews, setOverviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.user_id) {
      fetchOverviews();
    }
  }, [profile?.user_id]);

  const fetchOverviews = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/reports_dashboard/${profile.user_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch overviews");
      }

      const data = await response.json();
      setOverviews(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="timeline-loading">Loading timeline...</div>;
  }

  if (error) {
    return <div className="timeline-error">Error: {error}</div>;
  }

  return (
    <div className="timeline-container">
      <button
        className="back-button"
        onClick={() => navigate("/dashboard")}
      >
        &larr; Back to Dashboard
      </button>
      <h1 className="timeline-title">Timeline Overview</h1>
      {overviews.length > 0 ? (
        <div className="timeline">
          {overviews.map((overview, index) => (
            <div key={index} className="timeline-item">
              <div className="timeline-date">{overview.date}</div>
              <div className="timeline-content">
                <h3>{overview.title}</h3>
                <p>{overview.overview}</p>
                {overview.link && (
                  <a
                    href={overview.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="timeline-link"
                  >
                    View Details
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="timeline-empty">No overviews available.</p>
      )}
    </div>
  );
};

export default Timeline;
