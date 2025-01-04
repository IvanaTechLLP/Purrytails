import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";
import Footer from "./footer";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const reviews = [
  {
    author: "Dhruv Gupta",
    text: "I love this platform! It has transformed how I manage my dogs' health records. I can share their information with vets quickly, and I no longer worry about losing important documents. Purry Tail makes it simple to keep everything organized. I feel more confident knowing that the health information is secure and accessible whenever I need it."
  },
  {
    author: "Himani Thakkar",
    text: "As a busy pet parent, I always struggled to keep track of my cat's health records, vaccinations, and vet visits. Purry Tails has been a game-changer for me! I can easily access and update all my cat's information in one place. The reminders for vaccinations and appointments have made my life so much easier. I highly recommend it to all pet parents!"
  },
  {
    author: "Kritika Bharadia",
    text: "Purry Tails is a must-have for any pet parent! I appreciate being able to track my dogs' health histories and medications easily. The ability to set reminders for vet appointments and medication refills has been invaluable. It's comforting to know I can keep everything related to my pets' health in one secure place. Thank you for creating such a fantastic resource!"
  }
];


const LandingPage = () => {
  const [activeService, setActiveService] = useState(null);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false); // State for mobile menu
  const [showAllSteps, setShowAllSteps] = useState(false);
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
    setIsOpen(false)
  }
  const [isOpen, setIsOpen] = useState(false);

  const handleLoginClick = () => {
    navigate("/login");
  };
  const handleToggle = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };
  const closeMenu = () => {
    setIsOpen(false);
  };
  const redirectToFeature = (featureId) => {
    navigate(`/features#${featureId}`);
  }
  const [selectedPerk, setSelectedPerk] = useState(null);

  const openPopup = (perk) => {
      setSelectedPerk(perk);
  };

  const closePopup = () => {
      setSelectedPerk(null);
  };
  const handleSeeMoreClick = () => {
    setShowAllSteps(true); // Show all steps when "See More" is clicked
  };
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);

  const nextReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex + 1) % reviews.length);
  };

  const prevReview = () => {
    setCurrentReviewIndex((prevIndex) => (prevIndex - 1 + reviews.length) % reviews.length);
  };

  

  

  return (
    <div className="landing-container">
      <nav className="landing-nav">
        {/*
  <div className="dashboard-left">
    <button className="hamburger" onClick={handleToggle}>
      &#9776;
    </button>
    <div className={`sidebar-one ${isOpen ? 'open' : ''}`}>
      <button className="back-arrow" onClick={closeMenu}>
        &larr;
      </button>
      <h2>Menu</h2>
      <ul className="menu-items">
        <li><a onClick={() => scrollToSection("ourmission")} className="menu-item">Our Mission</a></li>
        <li><a onClick={() => scrollToSection("perks")} className="menu-item">Our Perks</a></li>
        <li><a onClick={() => scrollToSection("reviews")} className="menu-item">Testimonials</a></li>
        <li><a onClick={() => scrollToSection("about")} className="menu-item">About Us</a></li>
        <li onClick={handleLoginClick}><a href="/login" className="menu-item">Login</a></li>
      </ul>
    </div>
  </div>
  */}

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
{/*}
  <li><a onClick={() => scrollToSection("perks")} className="right">Our Perks</a></li>
    
    */}
    <li><a onClick={() => scrollToSection("reviews")} className="right">Testimonials</a></li>
    <li><a onClick={() => scrollToSection("about")} className="right">About Us</a></li>
    <li onClick={handleLoginClick}><a href="/login" className="right">Login</a></li>
  </ul>
</nav>

      <a href="https://forms.gle/4TisKeNinVJcxGS9A" target="_blank" rel="noopener noreferrer">
      <button className="contact-us-button">
        Contact Us
      </button>
      </a>
      
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
              <p>Connect with fellow pet parents for tips, support, and shared experiences</p>
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

      {/*}
      <div className="landing-container1">
    
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
          */}
      <div class="banner">
        
  <div class="text-box">
  {/*<img src="pawscription.png" alt="Care for Your Companion" />*/}
  <h1>Care for your Companion, one 'paw'scription at a time.</h1>
  </div>
</div>



<section className="features-section">
  <h2>Why Choose Us?</h2>
  <div className="features-container">
  <div className="feature-box" onClick={() => redirectToFeature('organized-management')}>
      <div className="circle-icon">
        <img src="F.time.png" alt="Feature 3" className="icon-image" />
        <div className="hover-overlay">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="#fff"
    viewBox="0 0 16 16"
    className="play-icon"
  >
    <path d="M4.268 1.961C3.2 1.324 2 2.09 2 3.39v9.22c0 1.3 1.2 2.066 2.268 1.429l8.931-4.61c1.07-.553 1.07-2.305 0-2.858L4.268 1.961z" />
  </svg>
</div>
      </div>
      <h2 className="feature-title">HEALTH TIMELINE</h2>
      <p className="feature-description">Brief timeline outlining your pets' medical history.</p>
    </div>
    <div className="feature-box" onClick={() => redirectToFeature('smart-retrieval')}>
      <div className="circle-icon">
        <img src="F.retrieval.png" alt="Feature 1" className="icon-image" />
        <div className="hover-overlay">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="#fff"
    viewBox="0 0 16 16"
    className="play-icon"
  >
    <path d="M4.268 1.961C3.2 1.324 2 2.09 2 3.39v9.22c0 1.3 1.2 2.066 2.268 1.429l8.931-4.61c1.07-.553 1.07-2.305 0-2.858L4.268 1.961z" />
  </svg>
</div>
      </div>
      <h2 className="feature-title">SMART RETRIEVAL</h2>
      <p className="feature-description">Access past records using simple words.</p>
    </div>
    <div className="feature-box" onClick={() => redirectToFeature('multi-device-support')}>
      <div className="circle-icon">
        <img src="F.multi.png" alt="Feature 4" className="icon-image" />
        <div className="hover-overlay">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="#fff"
    viewBox="0 0 16 16"
    className="play-icon"
  >
    <path d="M4.268 1.961C3.2 1.324 2 2.09 2 3.39v9.22c0 1.3 1.2 2.066 2.268 1.429l8.931-4.61c1.07-.553 1.07-2.305 0-2.858L4.268 1.961z" />
  </svg>
</div>
      </div>
      <h2 className="feature-title">ACCESS ANYWHERE</h2>
      <p className="feature-description">Access your pet's records anytime on any device.</p>
    </div>
    <div className="feature-box" onClick={() => redirectToFeature('secure-storage')}>
      <div className="circle-icon">
        <img src="F.secure.png" alt="Feature 2" className="icon-image" />
        <div className="hover-overlay">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="50"
    height="50"
    fill="#fff"
    viewBox="0 0 16 16"
    className="play-icon"
  >
    <path d="M4.268 1.961C3.2 1.324 2 2.09 2 3.39v9.22c0 1.3 1.2 2.066 2.268 1.429l8.931-4.61c1.07-.553 1.07-2.305 0-2.858L4.268 1.961z" />
  </svg>
</div>
      </div>
      <h2 className="feature-title">SECURE DATA</h2>
      <p className="feature-description">Keep your pet's data secure, without losing documents. </p>
  
    </div>
  </div>
</section>

<div className="landing-container">
<div id="journey" className="journey-section">
  <h1>Welcome to Your Companion's Health Journey</h1>

  {/* Always visible Journey Steps */}
  <div className="journey-step left">
    <div className="image-container">
      <img className="left-image" src="login-left.jpg" alt="Step 1" />
    </div>
    <div className="text-container">
      <h2>1 SIGN IN</h2>
      <ul className="journey-custom-list">
  <li className="journey-custom-item">- Sign in with Google</li>
  <li className="journey-custom-item">- Access from any device</li>
  <li className="journey-custom-item">- Quick, easy setup</li>
</ul>

<h4>"Your Gateway to Smarter Healthcare!"</h4>
    </div>
  </div>

  <div className="journey-step right">
    <div className="image-container">
      <img className="right-image" src="right-details.png" alt="Step 2" />
    </div>
    <div className="text-container">
      <h2>2 ENTER YOUR PROFILE DETAILS</h2>
      
      <ul className="journey-custom-list">
     
  <li className="journey-custom-item">- Add pet vitals (age, weight, etc.)</li>
  <li className="journey-custom-item">- Upload a cute pet photo</li>
  <li className="journey-custom-item">- Fill Out Pet parent details</li>
  
</ul>
      <h4>"Where Your Story Begins!"</h4>
    </div>
  </div>

  <div className="journey-step left">
    <div className="image-container">
      <img className="left-image" src="image-upload.jpg" alt="Step 3" />
    </div>
    <div className="text-container">
      <h2>3 UPLOAD REPORTS</h2>
      
      <ul className="journey-custom-list">
      <li className="journey-custom-item">- Save time with easy uploads</li>
  <li className="journey-custom-item">- Upload reports in any format</li>
  <li className="journey-custom-item">- Let AI extract key medical details</li>

</ul>
      <h4>"Effortless Upload, Smarter Insights!"</h4>
    </div>
  </div>

  <div className="journey-step right">
    <div className="image-container">
      <img className="right-image" src="right-dashboard.png" alt="Step 4" />
    </div>
    <div className="text-container">
      <h2>4 DASHBOARD</h2>
      
      <ul className="journey-custom-list">
  <li className="journey-custom-item">- Manage all reports in one place</li>
  <li className="journey-custom-item">- Use AI chatbot for quick access</li>
  <li className="journey-custom-item">- Find documents with simple queries</li>
</ul>

      <h4>"Stay Informed, Stay Empowered!"</h4>
    
    </div>
  </div>

  <div className="journey-step left">
    <div className="image-container">
      <img className="left-image" src="left-timeline.jpg" alt="Step 5" />
    </div>
    <div className="text-container">
      <h2>5 HEALTH TIMELINE</h2>
      
      <ul className="journey-custom-list">

  <li className="journey-custom-item">- Easy access to timeline summary</li>
  <li className="journey-custom-item">- Download or share with doctors</li>
  <li className="journey-custom-item">- Easily spot trends in your health</li>
</ul>
    
      <h4>"Your Complete Medical Journey at a Glance!"</h4>
    </div>
  </div>
</div>




<div id="reviews" className="reviews-section">
      <h1>What Our Users Say</h1>
      <div className="reviews-navigation-container">
    <img 
      src="/paw-left.png" 
      alt="Previous Review" 
      onClick={prevReview} 
      className="nav-button"
    />
    <div className="review-box">
      <p className="review-author">{reviews[currentReviewIndex].author}</p>
      <p className="review-text">{reviews[currentReviewIndex].text}</p>
    </div>
    <img 
      src="/paw-right.png" 
      alt="Next Review" 
      onClick={nextReview} 
      className="nav-button"
    />
  </div>
    </div>
      
      
      </div>


      <div id="about" className="about-us-section">
        <h1>Meet Our Founders</h1>
        <div className="founders">
          <div className="founder">
            <img src="/darsh-1.png" alt="Founder 1" className="founder-image" />
            <h2>Darsh Thakkar</h2>
            <p>A dedicated pet parent for over 10 years and passionate animal lover. Manages business development and technology integration for Purry Tails.</p>
                  
                  </div>
          <div className="founder">
            <img src="/mahir-1.png" alt="Founder 2" className="founder-image" />
            <h2>Mahir Madhani</h2>
            <p>Compassionate advocate for pets and their well-being. Manages finance and marketing, ensuring Purry Tails' financial health and market presence.</p>
          </div>
          <div className="founder">
            <img src="/abhay-1.png" alt="Founder 3" className="founder-image" />
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