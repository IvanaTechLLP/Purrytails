import React from "react";
import "./footer.css";  // Create a new CSS file for styling the footer

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
  }
  return (
    <footer className="footer">
      <div className="footer-left">
      <img src="/PT.png" alt="Instagram" className="footer-logo"/>
        
      </div>
      <div className="footer-center">
        <div className="footer-nav">
          <ul>
          <li><a onClick={() => scrollToSection("ourmission")}>Our Mission</a></li>
          <li><a onClick={() => scrollToSection("perks")} className="left">Our Perks</a></li>
          <li><a onClick={() => scrollToSection("reviews")}>Testimnonials</a></li>
          <li><a onClick={() => scrollToSection("about")}>About Us</a></li>
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