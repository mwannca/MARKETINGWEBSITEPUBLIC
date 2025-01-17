import React from 'react';
import './Footer.css'; // Import CSS for styling

const Footer = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                <div className="footer-left">
                    <div className="logo">
                        <img src="/IMG_8769-removebg-preview (1).png" alt="MailSpark Logo" className="logo-image"/>
                        <span className="logo-text">MailSpark</span>
                    </div>
                    <p className="footer-description">
                        High-Tech Horizons: Where innovation fuels your business
                    </p>
                </div>

                <div className="footer-links">
                    <nav>
                        <ul className="footer-nav-list">
                            <li><a href="#key-features">Key Features</a></li>
                            <li><a href="#how-it-works">How it works</a></li>
                            <li><a href="#use-cases">Use Cases</a></li>
                            <li><a href="#testimonials">Testimonials</a></li>
                        </ul>
                    </nav>
                </div>
            </div>

            <div className="footer-bottom">
                <p className="footer-copyright">
                    © 2024 ActivityBeds. All rights reserved
                </p>

                <div className="footer-social-icons">
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/facebook.svg" alt="Facebook"/>
                    </a>
                    <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/youtube.svg" alt="YouTube"/>
                    </a>
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/instagram.svg" alt="Instagram"/>
                    </a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-icon">
                        <img src="https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/linkedin.svg" alt="LinkedIn"/>
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
