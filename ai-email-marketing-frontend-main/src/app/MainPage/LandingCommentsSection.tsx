import React, { useState, useEffect } from 'react';
import './LandingCommentsSection.module.css';

const comments = [
    { id: 1, author: 'Emma R.', role: 'Marketing Manager at BrightCommerce', text: 'This platform transformed our email marketing strategy...', imgSrc: '/face1.svg' },
    { id: 2, author: 'Daniel T.', role: 'Founder of LuxeHome', text: "We've seen a 25% increase in sales since switching...", imgSrc: '/face2.svg' },
    { id: 3, author: 'David K.', role: 'CEO of StyleNest', text: 'The integration process was seamless...', imgSrc: '/face3.svg' },
    { id: 4, author: 'Sophia L.', role: 'Product Manager at HomeGoods', text: 'Using this platform has significantly improved our workflow...', imgSrc: '/face1.svg' },
    { id: 5, author: 'Mark P.', role: 'Director of Marketing at AllOut', text: 'We are really happy with the results...', imgSrc: '/face2.svg' }
];

const LandingCommentsSection = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    // Loop the index back to the start when it reaches the end
    const nextIndex = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % comments.length);
    };

    const handleIndicatorClick = (index: number) => { // Define `index` as a number
        setActiveIndex(index);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextIndex();
        }, 3000); // Adjust the delay to your preference

        return () => clearInterval(interval);
    }, []);

    // Make sure the array slices correctly if it goes beyond the length
    const visibleComments = [
        comments[activeIndex],
        comments[(activeIndex + 1) % comments.length],
        comments[(activeIndex + 2) % comments.length],
    ];

    return (
        <div className="landing-comments-section">
            <h2 className="section-title">
                Over <span className="title-highlight">2,000</span> e-commerce brands have trusted our platform to boost their email marketing!
            </h2>
            <div className="comments-container">
                <div className="comments-slider">
                    {visibleComments.map((comment, index) => (
                        <div
                            key={comment.id}
                            className={`comment-card ${index === 0 ? 'active' : ''}`}
                            onClick={() => handleIndicatorClick((activeIndex + index) % comments.length)}
                        >
                            <img src={comment.imgSrc} alt={`${comment.author}`} className="comment-image" />
                            <div className="comment-content">
                                <p>{comment.text}</p>
                                <p className="comment-author">– {comment.author}</p>
                                <p className="author-role">{comment.role}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="comment-indicators">
                    {comments.map((_, index) => (
                        <div
                            key={index}
                            className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
                            onClick={() => handleIndicatorClick(index)}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingCommentsSection;
