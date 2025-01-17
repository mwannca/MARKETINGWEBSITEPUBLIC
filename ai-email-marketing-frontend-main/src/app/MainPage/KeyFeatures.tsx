'use client';
import React, { useState } from 'react';
import './KeyFeatures.css';

const features = [
    {
        id: 1,
        title: 'AI Copy Suggestions',
        description: 'Get AI-generated suggestions to improve your email copy.',
        imgSrc: '/assets/icons/ai-copy-icon.svg',
        icon: '/aiicon.svg',
    },
    {
        id: 2,
        title: 'Drag-and-Drop Design',
        description: 'Easily design beautiful emails with drag-and-drop features.',
        imgSrc: '/dragandrop.svg',
        icon: '/dragicon.svg',
    },
    {
        id: 3,
        title: 'Pre-designed Templates',
        description: 'Choose from a variety of templates to get started quickly.',
        imgSrc: '/assets/icons/templates-icon.svg',
        icon: '/dragicon.svg',
    },
    {
        id: 4,
        title: 'Advanced Analytics',
        description: 'Monitor the performance of your campaigns in real-time.',
        imgSrc: '/assets/icons/analytics-icon.svg',
        icon: '/dragicon.svg',
    },
];

export default function KeyFeatures() {
    const [activeFeature, setActiveFeature] = useState(features[1]);

    const handleFeatureClick = (feature: typeof features[0]) => {
        setActiveFeature(feature);
    };

    return (
        <div className="key-features-container">
            <div className="key-features-column text-column">
                <h4 className="key-features-title">KEY FEATURES</h4>
                <h2 className="key-features-heading">
                    Your <span className="highlighted-text">AI-Powered</span> Email Assistant
                </h2>
                <div className="features-list">
                    {features.map((feature) => (
                        <button
                            key={feature.id}
                            onClick={() => handleFeatureClick(feature)}
                            className={`feature-button ${
                                feature.id === activeFeature.id ? 'active-button' : ''
                            }`}
                        >
                            <img src={feature.icon} alt={`${feature.title} icon`} className="feature-icon" />
                            <span className="feature-title">{feature.title}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="key-features-column image-column">
                    <img src={activeFeature.imgSrc} alt={activeFeature.title} className="feature-image" />
            </div>
        </div>
    );
}
