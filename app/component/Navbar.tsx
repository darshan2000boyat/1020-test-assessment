"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = () => {
        // Delete all cookies (client-side)
        document.cookie.split(";").forEach((cookie) => {
            document.cookie = cookie
                .replace(/^ +/, "")
                .replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/");
        });

        // Redirect to login
        router.push("/auth/login");
    };

    return (
        <div className="navbar bg-white shadow-sm flex items-center">
            <div className="flex-none">
                <button className="px-2 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block h-5 w-5 stroke-current">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>

            <div className="flex-1">
                <a className="font-bold px-4 text-xl">Tuesday.com</a>
            </div>

            <div className="flex-none px-4">
                <button onClick={handleLogout} className="cursor-pointer">
                    <LogOut />
                </button>
            </div>
        </div>
    );
};

export default Navbar;
