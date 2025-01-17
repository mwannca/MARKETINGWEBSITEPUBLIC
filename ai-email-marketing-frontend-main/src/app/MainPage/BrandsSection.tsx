'use client'
import React from 'react';

const BrandsSection: React.FC = () => {
    return (
        <div className="findme" style={{marginLeft:'5vw',marginTop:'20vh'}}>
            <img src="/signedupbrands.svg" alt="signedup brands" className=""/>
        </div>
    );
};

const GalleryCard: React.FC<{ discount: string }> = ({discount}) => (
    <div className="bg-gray-800 p-5 rounded shadow-lg min-w-[250px]">
        <p className="text-center font-bold mb-3">{discount}</p>
        <button className="bg-lime-500 px-3 py-2 rounded text-black w-full">Shop Now</button>
    </div>
);

export default BrandsSection;
