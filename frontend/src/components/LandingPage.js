import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Footer from "./footer";

const LandingPage = () => {
  const navigate = useNavigate();

  const reviews = [
    { author: "Dr. Sarah Johnson", text: "MedDox has revolutionized how we manage patient records. It's intuitive, secure, and incredibly efficient. Highly recommend!" },
    { author: "Dr. Michael Lee", text: "The platform's ease of use and seamless integration with our systems have been game-changers. MedDox has become an essential tool in our practice." },
    { author: "Dr. Emily Davis", text: "A fantastic service that simplifies medical record management. The Smart Health Card feature is particularly useful for emergencies." },
  ];

  
   const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <div className="nav-logo">
          <img src="/dd.png" alt="Doctor Dost Logo" className="logo-image" />
        </div>
        <ul className="name">
          <h3>MedDox</h3>
        </ul>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#reviews">Reviews</a></li>
          <li><a href="#about">About Us</a></li>
          <li onClick={handleLoginClick}><a href="/login">Login</a></li>
          
        </ul>
      </nav>
      <div id="home" className="landing-content">
        <div className="left-side">
          <h1>Your Well-being Comes First</h1>
          <p>Easily and securely share your complete medical history with healthcare providers and family, ensuring better coordination and personalized care.</p>
        </div>
        <div className="right-side">
          <img src="/hero-7f1bb39c.png" alt="Medical Illustration" className="landing-image" />
        </div>
      </div>
      <div className="info-boxes-section">
        <div className="info-box">
          <h2 className="info-number">999+</h2>
          <p className="info-text">Documents Stored</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">99+</h2>
          <p className="info-text">Happy Patients</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">9+</h2>
          <p className="info-text">Partnered Hospitals</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">99+</h2>
          <p className="info-text">Smart Health Cards Provided</p>
        </div>
      </div>
      <div id="whoweare" className="who-are-we-section">
        <div className="who-are-we-content">
          <div className="who-are-we-image">
            <img src="/whoarewe.png" alt="Who Are We" />
          </div>
          <div className="who-are-we-text">
            <h1>Who Are We?</h1>
            <p>
              MedDox is a pioneering digital platform that redefines medical record management. We bring together healthcare professionals, patients, and administrators to enhance the efficiency and personalization of care.
            </p>
            <p>
              Doctor Dost, our AI-powered assistant, simplifies finding and managing medical documents with intuitive, personalized support.
            </p>
            <p>
              Our Smart Health Card provides secure, paperless access to medical information, ensuring swift admissions and comprehensive care, especially in emergencies. With MedDox, we make healthcare seamless, secure, and smarter.
            </p>
          </div>
        </div>
      </div>
      <div id="services" className="who-are-we-section">
        <div className="who-are-we-content">
          <div className="who-are-we-image">
            <img src="/services2.jpg" alt="Who Are We" />
          </div>
          <div className="who-are-we-text">
            <h1>Services</h1>
            <h2> File Manager</h2>
            <p>Our File Manager offers a seamless way to organize your medical documents. Effortlessly access your prescriptions, view laboratory reports and radiology studies, and review comprehensive surgery records. Retrieve your hospital discharge summaries with ease and keep track of your vaccination records effortlessly.</p>
            <h2>Doctor Dost</h2>
            <p> 
            Our platform offers a user-friendly experience with Natural Language Search, allowing patients to easily find documents using everyday language. It provides proactive care through AI Insights, which deliver smart alerts for vaccinations and medication reminders. With Voice Assistance, users can navigate and search hands-free using voice commands. Additionally, our system ensures sensitive data is both protected and automatically updated, combining top-notch security with efficiency.</p>
            
          </div>
          </div>
      </div>
      <div id="services" className="who-are-we-section">
        <div className="who-are-we-content">
          <div className="who-are-we-image">
            <img src="/services1.png" alt="Who Are We" />
          </div>
  
          <div className="who-are-we-text">
            <h2> Smart Card</h2>
            <p>
            Our system offers paperwork-free admissions for quick, hassle-free hospital check-ins. It ensures emergency readiness by storing critical patient information for instant access. With comprehensive patient data and secure data access, it protects sensitive information and prevents breaches. Enhanced privacy is ensured through encryption, and universal compatibility allows use across various healthcare facilities. It also empowers patients by giving them control over their medical data.</p>
            <h2>Insurance</h2>
            <p> 
            Our system enables instant policy verification to reduce wait times and paperwork for health and life insurance. It offers emergency coverage access to insurance details, ensuring timely care during emergencies. With comprehensive policy information and secure, encrypted data, it protects sensitive information and streamlines claims processing. The platform supports universal use across providers and reduces fraud risk with secure access protocols.</p>
            
          </div>
          </div>
      </div>

        


      
      
      <div id="reviews" className="reviews-section">
        <h1>What Our Doctors Say</h1>
        <div className="reviews-container">
          <div className="review-box">
            <p className="review-author">Dr. Sarah Johnson</p>
            <p className="review-text">MedDox has revolutionized how we manage patient records. It's intuitive, secure, and incredibly efficient. Highly recommend!</p>
          </div>
          <div className="review-box review-box-highlight">
            <p className="review-author">Dr. Michael Lee</p>
            <p className="review-text">The platform's ease of use and seamless integration with our systems have been game-changers. MedDox has become an essential tool in our practice.</p>
          </div>
          <div className="review-box">
            <p className="review-author">Dr. Emily Davis</p>
            <p className="review-text">A fantastic service that simplifies medical record management. The Smart Health Card feature is particularly useful for emergencies.</p>
          </div>
        </div>
      </div>
      
      <div id="about" className="about-us-section">
        <h1>Meet Our Founders</h1>
        <div className="founders">
          <div className="founder">
            <img src="/darsh.png" alt="Founder 1" className="founder-image" />
            <h2>Darsh Thakkar</h2>
            <p>Manages business development and technology, ensuring seamless integration of strategy and innovation.</p>
          </div>
          <div className="founder">
            <img src="/mahir.png" alt="Founder 2" className="founder-image" />
            <h2>Mahir Madhani</h2>
            <p>Manages finance, business operations, and marketing, ensuring MedDox’s financial health and market presence.</p>
          </div>
          <div className="founder">
            <img src="/abhay.png" alt="Founder 3" className="founder-image" />
            <h2>Abhay Mathur</h2>
            <p>Drives technological innovation, ensuring that MedDox leverages the latest advancements to deliver a seamless and cutting-edge platform.</p>
          </div>
        </div>
      </div>
      <Footer />
      

      
    </div>
  );
};

export default LandingPage;