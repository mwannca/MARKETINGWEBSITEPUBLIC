'use client'
import React from 'react';
import './HeroSection.css';

import Carousel from './components/Carousel'; // Assuming a custom carousel component or a library carousel.

const carouselItems = [
    {
        id: 1,
        imgSrc: '/slide1.svg',
        altText: 'First Slide',
        description: 'Customizable templates designed to meet your needs.',
    },
    {
        id: 2,
        imgSrc: '/slid2.svg', // Corrected path to match assets
        altText: 'Second Slide',
        description: 'Drag-and-drop design with AI assistance.',
    },
    {
        id: 3,
        imgSrc: '/slide3.svg',
        altText: 'Third Slide',
        description: 'Advanced analytics to monitor campaign success.',
    },
];
const HeroSection: React.FC = () => {
  return (
      <div className="hero-container-wrapper">
          <div className="hero-container">
              <div className="hero-box">
                  {/* Content Section */}
                  <div className="hero-top-text">
                      <p>AI EMAIL MARKETING FOR E-COMMERCE BRANDS & AGENCIES</p>
                      <h1 className="hero-title">Effortlessly Create Beautiful Emails in Minutes</h1>
                      <p className="hero-subtitle">
                          Explore the full potential of our all-in-one email marketing solution
                      </p>
                      <div className="hero-buttons">
                          <button className="hero-button primary">Try It Now</button>
                          <button className="hero-button secondary">See Features</button>
                      </div>
                  </div>

                  {/* Box Section (Overlay on Carousel) */}

                  {/* Carousel */}

              </div>
          </div>
          <div className="box-container">
              <Carousel items={carouselItems} showArrows={true} />
              {/*<img src="/hero.png" alt="MailSpark Logo" className="image"/>*/}
          </div>
      </div>
  );
};

export default HeroSection;
