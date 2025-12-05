import type { Metadata } from "next";
import AuthGuardServer from "../component/AuthGuard";
import Navbar from "../component/Navbar";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className='min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 text-black'>
            <AuthGuardServer protectedRoute redirectUnauthenticatedTo="/auth/login">
                <Navbar />
                {children}
            </AuthGuardServer>
        </main>

    );
}
