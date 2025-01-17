import React, { useState } from 'react';
import './carousel.module.css';

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
        <div className="carousel-container">
            <div className="carousel-wrapper">
                {items.map((item, index) => {
                    let position = 'nextSlide';
                    if (index === currentIndex) {
                        position = 'activeSlide';
                    } else if (
                        index === currentIndex - 1 ||
                        (currentIndex === 0 && index === items.length - 1)
                    ) {
                        position = 'prevSlide';
                    }

                    return (
                        <div key={item.id} className={`carousel-slide ${position}`}>
                            {position === 'prevSlide' && showArrows && (
                                <button className="carousel-arrow prev-arrow" onClick={handlePrev}>
                                    &#8249;
                                </button>
                            )}
                            <img src={item.imgSrc} alt={item.altText} className="carousel-image" />
                            {position === 'nextSlide' && showArrows && (
                                <button className="carousel-arrow next-arrow" onClick={handleNext}>
                                    &#8250;
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Carousel;
