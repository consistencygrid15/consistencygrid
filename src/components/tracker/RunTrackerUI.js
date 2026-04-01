"use client";

import { useState, useEffect } from 'react';
import { Play, Pause, Square, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRunTracker } from '@/hooks/useRunTracker';
import { saveRun } from '@/lib/offlineRunningStore';

function formatTime(totalSeconds) {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
        return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function formatPace(pace) {
    if (!pace || pace === Infinity || pace === 0) return "--:--";
    const mins = Math.floor(pace);
    const secs = Math.floor((pace - mins) * 60);
    return `${mins}:${String(secs).padStart(2, '0')}`;
}

export default function RunTrackerUI() {
    const router = useRouter();
    const { 
        status, distance, duration, currentPace, path, error, 
        startRun, pauseRun, stopRun, resetRun 
    } = useRunTracker({ minimumAccuracy: 25, updateInterval: 3000 });

    const [showSummary, setShowSummary] = useState(false);

    const handleStartClick = () => {
        // Trigger native Android permission prompt explicitly
        if (typeof window !== 'undefined' && window.Android && window.Android.requestLocationPermission) {
            window.Android.requestLocationPermission();
        }
        // Then start the web geolocation watcher
        startRun();
    };

    const handleStop = () => {
        stopRun();
        setShowSummary(true);
    };

    const handleSaveRun = () => {
        saveRun({
            distance,
            duration,
            pace: currentPace,
            path
        });
        resetRun();
        router.push('/dashboard');
    };

    const handleDiscard = () => {
        resetRun();
        router.push('/dashboard');
    };

    if (showSummary) {
        return (
            <div className="flex min-h-screen flex-col bg-gray-900 text-white p-6">
                <div className="flex-1 flex flex-col justify-center items-center text-center space-y-8">
                    <h2 className="text-3xl font-bold text-orange-400">Run Completed</h2>
                    
                    <div className="space-y-4 w-full max-w-sm bg-gray-800 p-6 rounded-2xl shadow-lg">
                        <div>
                            <p className="text-sm text-gray-400 font-medium">Distance</p>
                            <p className="text-5xl font-black">{distance.toFixed(2)} <span className="text-lg">km</span></p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-700">
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Time</p>
                                <p className="text-2xl font-bold">{formatTime(duration)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-400 font-medium">Avg Pace</p>
                                <p className="text-2xl font-bold">{formatPace(currentPace)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-sm space-y-4 mt-8">
                        <button 
                            onClick={handleSaveRun}
                            className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg shadow-md transition-colors"
                        >
                            Save Activity
                        </button>
                        <button 
                            onClick={handleDiscard}
                            className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-red-400 font-semibold rounded-xl text-lg transition-colors"
                        >
                            Discard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="flex items-center p-4 pt-8">
                <button 
                    onClick={() => router.push('/dashboard')}
                    className="p-2 bg-gray-800 rounded-full text-gray-300 hover:text-white"
                >
                    <ChevronLeft size={24} />
                </button>
                <div className="ml-4 font-semibold text-lg">Running Tracker</div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mx-4 mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
                    {error}
                </div>
            )}

            {/* Main Stats Display */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-12">
                
                {/* Distance Header */}
                <div className="text-center w-full">
                    <p className="text-gray-400 text-lg font-medium tracking-wider mb-2">DISTANCE</p>
                    <div className="flex items-baseline justify-center">
                        <span className="text-8xl font-black tracking-tighter shadow-sm">{distance.toFixed(2)}</span>
                        <span className="text-2xl ml-2 font-semibold text-gray-400">km</span>
                    </div>
                </div>

                {/* Secondary Stats Grid */}
                <div className="grid grid-cols-2 gap-8 w-full max-w-md px-4">
                    <div className="text-center">
                        <p className="text-gray-400 text-sm font-medium tracking-widest mb-1">PACE</p>
                        <p className="text-3xl font-bold font-mono">{formatPace(currentPace)}</p>
                        <p className="text-xs text-gray-500 mt-1">/km</p>
                    </div>
                    <div className="text-center">
                        <p className="text-gray-400 text-sm font-medium tracking-widest mb-1">TIME</p>
                        <p className="text-3xl font-bold font-mono">{formatTime(duration)}</p>
                        <p className="text-xs text-gray-500 mt-1">duration</p>
                    </div>
                </div>
                
                {/* GPS Indicator */}
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 bg-gray-800 px-3 py-1.5 rounded-full">
                    <div className={`h-2 w-2 rounded-full ${status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    {status === 'active' ? 'GPS Active' : 'GPS Standby'}
                </div>
            </div>

            {/* Controls Dock */}
            <div className="bg-gray-800 p-8 pb-12 rounded-t-3xl shadow-2xl flex justify-center items-center gap-6">
                
                {status === 'idle' && (
                    <button 
                        onClick={handleStartClick}
                        className="flex items-center justify-center gap-2 px-12 py-5 bg-orange-500 text-white rounded-full font-black text-xl shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Play size={24} fill="currentColor" />
                        START
                    </button>
                )}

                {status === 'active' && (
                    <button 
                        onClick={pauseRun}
                        className="flex items-center justify-center h-20 w-20 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Pause size={32} fill="currentColor" />
                    </button>
                )}

                {status === 'paused' && (
                    <>
                        <button 
                            onClick={stopRun}
                            className="flex items-center justify-center h-16 w-16 bg-red-500 text-white rounded-full shadow-lg shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Square size={24} fill="currentColor" />
                        </button>
                        <button 
                            onClick={startRun} // Resumes the run without clearing state
                            className="flex items-center justify-center h-20 w-20 bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all"
                        >
                            <Play size={32} fill="currentColor" className="ml-1" />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
