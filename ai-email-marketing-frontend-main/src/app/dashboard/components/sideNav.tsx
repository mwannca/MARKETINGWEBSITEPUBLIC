'use client';
import Image from 'next/image';
import React from 'react';
import { MdSpaceDashboard } from 'react-icons/md';
import { GrProjects } from 'react-icons/gr';
import { RiShoppingBag4Line } from 'react-icons/ri';
import { CgLogOut, CgTemplate } from 'react-icons/cg';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { logOut } from '@/app/auth/actions';

export default function SideNav() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        try {
            await logOut();
            router.push('/auth/signin');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="fixed left-0 top-0 border-r border-zinc-800 bg-gradient-to-b from-black to-zinc-900 h-screen w-[250px] z-20">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 text-2xl font-semibold m-6">
                <Link href="/dashboard" passHref>
                    <Image
                        alt="MailSpark Logo"
                        src="/IMG_8769-removebg-preview (1).png"
                        width={50}
                        height={50}
                        style={{ cursor: 'pointer' }}
                    />
                </Link>
                <Link href="/dashboard" passHref>
                    <h1 className="text-lime-400">MailSpark</h1>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-col mx-6 gap-4 mt-20">
                <Link href="/dashboard">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                            pathname === '/dashboard'
                                ? 'bg-lime-400 text-black'
                                : 'text-white hover:bg-zinc-700'
                        } transition-all duration-300`}
                    >
                        <MdSpaceDashboard className="h-6 w-6" />
                        Dashboard
                    </div>
                </Link>

                <Link href="/dashboard/projects">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                            pathname === '/dashboard/projects'
                                ? 'bg-lime-400 text-black'
                                : 'text-white hover:bg-zinc-700'
                        } transition-all duration-300`}
                    >
                        <GrProjects className="h-5 w-5" />
                        Projects
                    </div>
                </Link>

                <Link href="/dashboard/brands">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                            pathname === '/dashboard/brands'
                                ? 'bg-lime-400 text-black'
                                : 'text-white hover:bg-zinc-700'
                        } transition-all duration-300`}
                    >
                        <RiShoppingBag4Line className="h-5 w-5" />
                        Brands
                    </div>
                </Link>

                <Link href="/dashboard/profileSettings">
                    <div
                        className={`flex items-center gap-3 p-3 rounded-lg text-lg ${
                            pathname === '/dashboard/profileSettings'
                                ? 'bg-lime-400 text-black'
                                : 'text-white hover:bg-zinc-700'
                        } transition-all duration-300`}
                    >
                        <CgTemplate className="h-5 w-5 fill-white" />
                        Subscription Settings
                    </div>
                </Link>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 p-3 rounded-lg text-lg text-white hover:bg-zinc-700 transition-all duration-300"
                >
                    <CgLogOut className="h-5 w-5 fill-white" />
                    Logout
                </button>
            </div>
        </div>
    );
}
