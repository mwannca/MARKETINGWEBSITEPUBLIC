import React, { useState } from 'react';
import './carousel2.module.css';

interface CarouselItem {
    id: number;
    imgSrc: string;
    altText: string;
    description: string;
}

interface CarouselProps {
    items: CarouselItem[];
    showArrows?: boolean;
}

const Carousel: React.FC<CarouselProps> = ({ items, showArrows = true }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handlePrev = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? items.length - 1 : prevIndex - 1
        );
    };

    const handleNext = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === items.length - 1 ? 0 : prevIndex + 1
        );
    };

    return (
        <div className="custom-carousel-container">
            {showArrows && (
                <button className="custom-carousel-arrow custom-prev-arrow" onClick={handlePrev}>
                    &#8249;
                </button>
            )}
            <div className="custom-carousel-wrapper">
                {items.map((item, index) => {
                    let position = 'nextSlide';
                    if (index === currentIndex) {
                        position = 'activeSlide';
                    } else if (
                        index === currentIndex - 1 ||
                        (currentIndex === 0 && index === items.length - 1)
                    ) {
                        position = 'prevSlide';
                    } else if (
                        index === currentIndex + 1 ||
                        (currentIndex === items.length - 1 && index === 0)
                    ) {
                        position = 'nextSlide';
                    } else if (
                        index === currentIndex - 2 ||
                        (currentIndex === 0 && index === items.length - 2) ||
                        (currentIndex === 1 && index === items.length - 1)
                    ) {
                        position = 'secondPrevSlide';
                    } else if (
                        index === currentIndex + 2 ||
                        (currentIndex === items.length - 2 && index === 0) ||
                        (currentIndex === items.length - 1 && index === 1)
                    ) {
                        position = 'secondNextSlide';
                    }

                    return (
                        <div key={item.id} className={`custom-carousel-slide ${position}`}>
                            <img src={item.imgSrc} alt={item.altText} className="custom-carousel-image" />
                        </div>
                    );
                })}
            </div>
            {showArrows && (
                <button className="custom-carousel-arrow custom-next-arrow" onClick={handleNext}>
                    &#8250;
                </button>
            )}
            {/* Carousel Indicators */}
            <div className="custom-carousel-indicators">
                {items.map((_, index) => (
                    <span
                        key={index}
                        className={`custom-indicator-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                    ></span>
                ))}
            </div>
        </div>
    );
};

export default Carousel;
