import React from "react";
import "./footer.css";  // Ensure this file contains the styles below

const Footer = () => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 150; // Height of your fixed navbar
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth"
      });
    }
  };
  
  return (
    <footer className="footer">
      <div className="footer-left">
        <img src="/PT.png" alt="Purry Tails Logo" className="footer-logo" />
      </div>
      
      <div className="footer-right">
        <h4>Contact us </h4>
        <h5>mahir@purrytails.in</h5>
        <div className="footer-social-icons">
          <a href="https://www.instagram.com/purry.tails?igsh=MWZnOW16NjY1anZidA==">
            <img src="insta1.png" alt="Instagram" />
          </a>
        </div>
        <div className="footer-social-icons">
          <a href="https://www.instagram.com/purry.tails?igsh=MWZnOW16NjY1anZidA==">
            <img src="insta1.png" alt="Instagram" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
