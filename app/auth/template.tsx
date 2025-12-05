import type { Metadata } from "next";
import AuthGuardServer from "../component/AuthGuard";


export const metadata: Metadata = {
    title: "Authentication | Tuesday",
    description: "Authentication | Tuesday",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (

        <AuthGuardServer redirectIfAuthenticated redirectAuthenticatedTo="/timesheets">
            {children}
        </AuthGuardServer>

    );
}
