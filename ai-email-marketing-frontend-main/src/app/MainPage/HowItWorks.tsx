'use client';
import React from 'react';
import './HowItWorks.css';

const steps = [
    {
        id: 1,
        title: 'Sign Up',
        description: 'Get started by creating your account and integrating your e-commerce platform.',
        imgSrc: '/howitworksimage1.svg',
    },
    {
        id: 2,
        title: 'Choose A Template',
        description: 'Select from a variety of stunning, customizable email templates designed for your brand.',
        imgSrc: '/howitworksimage2.svg',
    },
    {
        id: 3,
        title: 'Personalize Your Content',
        description: 'Use our AI tools to tailor your email with personalized content for your audience.',
        imgSrc: '/howitworksimage3.svg',
    },
    {
        id: 4,
        title: 'Launch & Track',
        description: 'Send your campaign and monitor its success with real-time analytics to optimize performance.',
        imgSrc: '/howitworksimage4.svg',
    },
];

const HowItWorks: React.FC = () => {
    return (
        <div className="how-it-works-container">
            <h4 className="how-it-works-title">HOW IT WORKS</h4>
            <h2 className="how-it-works-heading">
                <span className="highlighted-text">4 Simple Steps</span> to Create the Perfect Email Campaign
            </h2>
            <div className="steps-container">
                {steps.map((step) => (
                    <StepCard key={step.id} step={step} />
                ))}
            </div>
        </div>
    );
};

const StepCard: React.FC<{ step: typeof steps[0] }> = ({ step }) => (
    <div>
        <div className="flex flex-col " style={{marginBottom:"2em"}}>
        <div className="step-header">
            <div className="step-number-circle">{step.id}</div>
            <h4 className="step-title">{step.title}</h4>
        </div>
        <p className="step-description">{step.description}</p>
        </div>
        <div className="step-card">

            <div className="step-image-container">
                <img src={step.imgSrc} alt={step.title} className="step-image"/>
            </div>
        </div>
    </div>
);

export default HowItWorks;
