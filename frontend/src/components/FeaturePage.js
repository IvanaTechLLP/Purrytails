import React from 'react';
import './Features.css';

const Features = () => {
  
  return (
    <div className="features-page">
      <section id="smart-retrieval" className="feature-section">
        <h2>Smart Retrieval System</h2>
        <p>Quickly access your pet's documents when needed.</p>
        <img src="/path-to-smart-retrieval-image.jpg" alt="Smart Retrieval" />
      </section>

      <section id="secure-storage" className="feature-section">
        <h2>Secure Storage</h2>
        <p>Your data is encrypted and safely stored.</p>
        <img src="/path-to-secure-storage-image.jpg" alt="Secure Storage" />
      </section>

      <section id="organized-management" className="feature-section">
        <h2>Organized Management</h2>
        <p>Categorize and tag documents for better management.</p>
        <img src="/path-to-organized-management-image.jpg" alt="Organized Management" />
      </section>

      <section id="multi-device-support" className="feature-section">
        <h2>Multi-Device Support</h2>
        <p>Access anytime, anywhere, from any device.</p>
        <img src="/path-to-multi-device-support-image.jpg" alt="Multi-Device Support" />
      </section>
    </div>
  );
};

export default Features;
