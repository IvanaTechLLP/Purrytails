import React from "react";
import "./footer.css";  // Create a new CSS file for styling the footer

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-left">
      <img src="/PT.png" alt="Instagram" className="footer-logo"/>
        
      </div>
      <div className="footer-center">
        <div className="footer-nav">
          <ul>
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#reviews">Testimnonials</a></li>
          <li><a href="#about">About Us</a></li>
          </ul>
        </div>
      </div>
      <div className="footer-right">
        <h4>Have Something To Talk About With Our Professionals?</h4>
        <div className="footer-subscribe">
          <input type="email" placeholder="Your Email" />
          <button>➤</button>
        </div>
        <div className="footer-social-icons">
          <a href="https://www.instagram.com/_.med_docs._?igsh=MTZrYzk4b3Z1bzc1MA=="><img src="/insta1.png" alt="Instagram" /></a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;