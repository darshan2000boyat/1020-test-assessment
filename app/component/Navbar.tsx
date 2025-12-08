"use client";

import React from 'react';
import { LogOut } from 'lucide-react';
import { useRouter } from "next/navigation";

const Navbar = () => {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.replace("/auth/login");
    };

    return (
        <div className="navbar bg-white shadow-sm flex items-center">
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
