'use client'
import React from 'react';
import Carousel from "@/app/MainPage/components/Carousel";
import './DesignGallery.css';
import Carousel2 from "@/app/MainPage/components/Carousel2";
const carouselItems = [
    {
        id: 1,
        imgSrc: '/slider2/image1.svg',
        altText: 'First Slide',
        description: 'Customizable templates designed to meet your needs.',
    },
    {
        id: 2,
        imgSrc: '/slider2/image2.svg',
        altText: 'Second Slide',
        description: 'Drag-and-drop design with AI assistance.',
    },
    {
        id: 3,
        imgSrc: '/slider2/image3.svg',
        altText: 'Third Slide',
        description: 'Advanced analytics to monitor campaign success.',
    },
    {
        id: 4,
        imgSrc: '/slider2/image4.svg',
        altText: 'Third Slide',
        description: 'Advanced analytics to monitor campaign success.',
    },
    {
        id: 5,
        imgSrc: '/slider2/image5.svg',
        altText: 'Third Slide',
        description: 'Advanced analytics to monitor campaign success.',
    },
];
const DesignGallery: React.FC = () => {
  return (
      <div className=" design-gallery">
          <h4 className="how-it-works-title">Design Gallery</h4>
          <h2 className="how-it-works-heading">
              Explore Our <span className="highlighted-text">Design Showcases</span>
          </h2>
          <div className="">
              <Carousel2 items={carouselItems} showArrows={true}/>
              {/*<img src="/hero.png" alt="MailSpark Logo" className="image"/>*/}
          </div>
      </div>
  );
};

const GalleryCard: React.FC<{ discount: string }> = ({discount}) => (
    <div className="bg-gray-800 p-5 rounded shadow-lg min-w-[250px]">
        <p className="text-center font-bold mb-3">{discount}</p>
        <button className="bg-lime-500 px-3 py-2 rounded text-black w-full">Shop Now</button>
  </div>
);

export default DesignGallery;
