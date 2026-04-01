"use client";

import { useRouter } from 'next/navigation';
import { Activity } from 'lucide-react';

export default function RunTrackerBanner() {
    const router = useRouter();

    return (
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <div className="flex items-center gap-4">
                <div className="bg-white/20 p-3 rounded-full">
                    <Activity size={28} className="text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-xl">Daily Running Tracking</h3>
                    <p className="text-orange-100 text-sm mt-1">Track your distance, pace, and time completely offline.</p>
                </div>
            </div>
            
            <button 
                onClick={() => router.push('/run')}
                className="bg-white text-orange-600 font-bold py-3 px-8 rounded-xl shadow-md hover:scale-105 active:scale-95 transition-all w-full md:w-auto"
            >
                Start Run
            </button>
        </div>
    );
}
