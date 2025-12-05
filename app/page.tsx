// app/page.tsx
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Chrono Flow",
  description: "The Chrono-Flow page with background gradient",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-b  from-[#225a9fa7] from-85 via-[#24548e7a] via-10 to-[#ff6a00c3] to-5 text-white">
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-3xl text-center px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold drop-shadow-lg">
            Time Flies Like A Swift...
          </h1>
          <div className="bg-[url('/swing.png')] bg-cover bg-no-repeat bg-center">
            <div className="w-full h-full lg:h-72 mt-10 text-start bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-3xl md:text-4xl font-extrabold drop-shadow-lg">Try Friday</h2>
              <p className="py-8">Effortlessly manage your work hours with our smart timesheet system. Track tasks, log entries, and stay organized without breaking your flow. Designed for teams who value accuracy, clarity, and a smooth user experience.</p>
              <Link href={"/auth/login"} className="w-fit border flex justify-around items-center px-4 py-2 rounded-2xl shadow-2xl bg-linear-to-r  from-[#006ff6a7] from-85 to-[#ff00f7c3] cursor-pointer">Try it for free <ArrowRight /></Link>
            </div>
            <div className="w-full h-24 mt-8 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">Free timesheet management application.</div>
          </div>
        </div>
      </div>
    </main>
  );
}
