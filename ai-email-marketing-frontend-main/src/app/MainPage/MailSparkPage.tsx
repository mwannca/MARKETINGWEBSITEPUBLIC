'use client'
import React from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import KeyFeatures from './KeyFeatures';
import HowItWorks from './HowItWorks';
import DesignGallery from './DesignGallery';
import BrandsSection from './BrandsSection';
import Carousel from "@/app/MainPage/components/Carousel";
import LandingCommentsSection from "@/app/MainPage/LandingCommentsSection";
const MailSparkPage: React.FC = () => {
  return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white" style={{    background: '#13190D'}}>
          <Navbar/>
          <HeroSection/>
          <BrandsSection/>
          <KeyFeatures/>
          <HowItWorks/>
          <DesignGallery/>
          <LandingCommentsSection/>
      </div>
  );
};

export default MailSparkPage;
