import React, { useState } from "react";
import "./LandingPage.css";
import Footer from "./footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const LandingPage = () => {
  const [activeService, setActiveService] = useState(null);
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


  const reviews = [
    { author: "Dr. Sarah Johnson", text: "MedDox has revolutionized how we manage patient records. It's intuitive, secure, and incredibly efficient. Highly recommend!" },
    { author: "Dr. Michael Lee", text: "The platform's ease of use and seamless integration with our systems have been game-changers. MedDox has become an essential tool in our practice." },
    { author: "Dr. Emily Davis", text: "A fantastic service that simplifies medical record management. The Smart Health Card feature is particularly useful for emergencies." },
  ];

  
  
  return (
    <div className="landing-container">
      <nav className="landing-nav">
        <ul className="nav-links left-group">
          <li><a onClick={() => scrollToSection("ourmission")} className="left">Our Mission</a></li>
          <li><a onClick={() => scrollToSection("perks")} className="left">Our Perks</a></li>
        </ul>

        <div className="nav-logo">
        <a href="#">
          <img src="/PT.png" alt="Doctor Dost Logo" className="logo-image" />
          </a>
        </div>

        <ul className="nav-links right-group">
          <li><a onClick={() => scrollToSection("reviews")} className="right">Testimonials</a></li>
          <li><a onClick={() => scrollToSection("about")} className="right">About Us</a></li>
        </ul>
      </nav>
      

      {/* Carousel Section */}
      <div id="carouselExample" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img src="/c1.png" className="d-block w-100" alt="Slide 1" />
            <div className="carousel-caption">
              <h5>Empowering Your Pet's Health</h5>
              <p>Your pet's medical history, vaccination records, and important documents in one secure place.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/c2.jpeg" className="d-block w-100" alt="Slide 2" />
            <div className="carousel-caption">
              <h5>Access Anytime, Anywhere</h5>
              <p>Access your pet's information on-the-go, whether at the vet's office or during travel.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/c3.jpeg" className="d-block w-100" alt="Slide 3" />
            <div className="carousel-caption ">
              <h5>Share with Caregivers</h5>
              <p>Easily share your pet's records with vets, pet sitters, and family members for better care.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img src="/Designer.png" className="d-block w-100" alt="Slide 3" />
            <div className="carousel-caption ">
              <h5>Join Our Pet Community</h5>
              <p>Connect with fellow pet owners for tips, support, and shared experiences</p>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
       </div>

      <div className="landing-container1">
        <div id="home" className="landing-content">
          <div className="left-side">
            <h1>Care for Your Companion, One "Paw"scription at a Time</h1>
            <p>Securely store and access your pet’s prescriptions in one place, ensuring you never miss a treatment. We handle the details so you can enjoy the cuddles.</p>
          </div>
          <img src="/Designer1.png" alt="Medical Illustration" className="landing-image" />
        </div>

   
      
        <div className="info-boxes-section">
        <div className="info-box">
          <h2 className="info-number">999+</h2>
          <p className="info-text">Documents Stored</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">99+</h2>
          <p className="info-text">Happy Pets</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">9+</h2>
          <p className="info-text">Partnered Vets</p>
        </div>
        <div className="info-box">
          <h2 className="info-number">99+</h2>
          <p className="info-text">Smart Health Cards Provided</p>
        </div>
      </div>
      </div>
      <div id="whoweare" className="who-are-we-section">
        <div id ="ourmission" className="who-are-we-content">
        <div className="who-are-we-text">
            <h1>Medication Errors Happen to Pets, Too</h1>
            <p>Medication errors in pets are a significant concern in veterinary care, often leading to serious health consequences. Many pet owners are unaware of the potential for these errors, and communication breakdowns between veterinarians and owners contribute to the issue.</p>
            <p>
                Our mission is to enhance the health and well-being of pets by providing pet owners and veterinarians with innovative digital solutions that streamline veterinary care, improve communication, and empower informed decision-making. We are dedicated to creating a seamless experience that ensures pets receive the best possible care throughout their lives.
            </p>
        </div>
        <div className="who-are-we-images">
            <div className="who-are-we-image">
                <img src="/001.png" alt="Image 1" />
            </div>
            <div className="who-are-we-image">
                <img src="/002.png" alt="Image 2" />
            </div>
        </div>
      </div>
      </div>

<div className="landing-container1">
<div id="perks" className="perks-section">
    <h1>Welcome to Your Companion's Health Journey</h1>
    <div className="perks-content">
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/upload1.png" alt="Upload Reports" />
            </div>
            <h2>Upload Reports</h2>
            <p>Easily upload and digitize your pet's medical reports.</p>
        </div>
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/manage1.png" alt="File Manager" />
            </div>
            <h2>File Manager</h2>
            <p>Manage your pet's medical reports all in one place</p>
        </div>
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/send1.png" alt="Send Reports" />
            </div>
            <h2>Send Reports</h2>
            <p>Share your pet's medical reports with Veterany Doctors.</p>
        </div>
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/reminder1.png" alt="Set Reminders" />
            </div>
            <h2>Set Reminders</h2>
            <p>Add Reminders for next visit for check-ups and vaccination.</p>
        </div>
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/chatbot1.png" alt="Chatbot" />
            </div>
            <h2>Chatbot</h2>
            <p>A Chatbot that helps you and the doctors to smart search and retrive information from all the reports.</p>
        </div>
        <div className="perk-item">
            <div className="perk-icon">
                <img src="/access1.png" alt="Smart Card" />
            </div>
            <h2>Smart Card</h2>
            <p>A medical identification for your pets, that can be easily scanned and access the records.</p>
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
      </div>
      
      <div id="about" className="about-us-section">
        <h1>Meet Our Founders</h1>
        <div className="founders">
          <div className="founder">
            <img src="/darsh.png" alt="Founder 1" className="founder-image" />
            <h2>Darsh Thakkar</h2>
            <p>A dedicated pet parent for over 10 years and passionate animal lover. Manages business development and technology integration for Purry Tails.</p>
                  
                  </div>
          <div className="founder">
            <img src="/mahir.png" alt="Founder 2" className="founder-image" />
            <h2>Mahir Madhani</h2>
            <p>Compassionate advocate for pets and their well-being. Manages finance and marketing, ensuring Purry Tails' financial health and market presence.</p>
          </div>
          <div className="founder">
            <img src="/abhay.png" alt="Founder 3" className="founder-image" />
            <h2>Abhay Mathur</h2>
            <p>A devoted pet lover. Drives technological innovation, ensuring Purry Tails leverages the latest advancements for a cutting-edge platform. </p>
          </div>
        </div>
      </div>
      <Footer />
      

      
    </div>
  );
};

export default LandingPage;