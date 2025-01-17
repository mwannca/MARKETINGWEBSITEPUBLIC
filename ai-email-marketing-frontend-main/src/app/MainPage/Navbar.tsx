'use client';
import React, { useEffect, useState } from 'react';
import './Navbar.css';
import Link from 'next/link';
import Image from 'next/image';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';
import {getCookie} from "@/app/auth/actions";

// Usage to get the 'Token'
const Navbar: React.FC = () => {
    const [isSignedIn, setIsSignedIn] = useState<boolean>(false);

    useEffect(() => {
        const checkUserSignIn = async () => {
            // Get the token
            const token = await getCookie('Token');

            if (token) {
                try {
                    const decodedToken: any = jwtDecode(token);
                    const currentTime = Math.floor(Date.now() / 1000);

                    // If the token is still valid, set signed-in state to true
                    if (decodedToken && decodedToken.exp > currentTime) {
                        setIsSignedIn(true);
                    }
                } catch (error) {
                    console.error('Invalid token:', error);
                }
            }
        };

        checkUserSignIn();
    }, []);
    return (
        <div className="navbar-wrapper">
            <div className="navbar-container">
                {/* Logo */}
                <div className="logo">
                    <Image src="/IMG_8769-removebg-preview (1).png" alt="MailSpark Logo" className="logo-image" width={40} height={40} />
                    <span className="logo-text">MailSpark</span>
                </div>

                {/* Links */}
                <div className="navbar-links">
                    <a href="#use-cases">Use Cases</a>
                    <a href="#blog">Blog</a>
                    <a href="#pricing">Pricing</a>
                </div>

                {/* Sign In & Sign Up Buttons */}
                <div className="auth-buttons">
                    {isSignedIn ? (
                        <Link href="/dashboard" passHref>
                            <button className="sign-up-button">Dashboard</button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/auth/signin" passHref>
                                <button className="sign-up-button">Sign In</button>
                            </Link>
                            <Link href="/auth/signup" passHref>
                                <button className="sign-up-button">Sign Up</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Navbar;
