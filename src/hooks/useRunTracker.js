import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Calculate the great circle distance between two points on the earth
 * using the Haversine formula.
 * @returns distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const rad = Math.PI / 180;
    const phi1 = lat1 * rad;
    const phi2 = lat2 * rad;
    const deltaPhi = (lat2 - lat1) * rad;
    const deltaLambda = (lon2 - lon1) * rad;

    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceMeters = R * c;
    
    return distanceMeters / 1000; // Convert to kilometers
}

export function useRunTracker(options = { minimumAccuracy: 25, updateInterval: 3000 }) {
    const [status, setStatus] = useState('idle'); // idle, active, paused, finished
    const [distance, setDistance] = useState(0); // in km
    const [duration, setDuration] = useState(0); // in seconds
    const [currentPace, setCurrentPace] = useState(0); // minutes per km
    const [path, setPath] = useState([]); // Array of {lat, lng, timestamp}
    
    const [error, setError] = useState(null);

    const watchIdRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const lastValidPositionRef = useRef(null);
    
    // Timer Effect
    useEffect(() => {
        if (status === 'active') {
            timerIntervalRef.current = setInterval(() => {
                setDuration(prev => prev + 1);
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [status]);

    // Pace Calculation Effect
    useEffect(() => {
        if (distance > 0.05) { // Only calculate pace after 50 meters to avoid infinite/erratic values
            const minutes = duration / 60;
            const pace = minutes / distance;
            setCurrentPace(pace);
        } else {
            setCurrentPace(0);
        }
    }, [distance, duration]);

    const handleSuccess = useCallback((position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const timestamp = position.timestamp;

        // Filter out highly inaccurate GPS signals (e.g. initial locks or indoor jumps)
        if (accuracy > options.minimumAccuracy) {
            console.log(`Skipping weak GPS signal. Accuracy: ${accuracy}m`);
            return;
        }

        const newPoint = { lat: latitude, lng: longitude, timestamp };

        setPath((prevPath) => {
            const currentPath = [...prevPath];
            const lastPoint = lastValidPositionRef.current;

            if (lastPoint) {
                const distAdded = calculateDistance(
                    lastPoint.lat, lastPoint.lng,
                    latitude, longitude
                );

                // Ignore erratic giant jumps (e.g. > 1km in a single tick)
                if (distAdded > 0.005 && distAdded < 1.0) {
                    setDistance(prev => prev + distAdded);
                }
            }

            lastValidPositionRef.current = newPoint;
            return [...currentPath, newPoint];
        });
    }, [options.minimumAccuracy]);

    const handleError = useCallback((err) => {
        console.error("Geolocation Error:", err);
        setError(err.message);
    }, []);

    const startRun = useCallback(() => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your device");
            return;
        }

        setError(null);
        setStatus('active');
        
        // Clear old data if restarting from idle
        if (status === 'idle') {
            setDistance(0);
            setDuration(0);
            setCurrentPace(0);
            setPath([]);
            lastValidPositionRef.current = null;
        }

        watchIdRef.current = navigator.geolocation.watchPosition(
            handleSuccess,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    }, [handleSuccess, handleError, status]);

    const pauseRun = useCallback(() => {
        setStatus('paused');
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const stopRun = useCallback(() => {
        setStatus('finished');
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
    }, []);

    const resetRun = useCallback(() => {
        pauseRun();
        setStatus('idle');
        setDistance(0);
        setDuration(0);
        setCurrentPace(0);
        setPath([]);
        lastValidPositionRef.current = null;
    }, [pauseRun]);

    return {
        status,
        distance,
        duration,
        currentPace,
        path,
        error,
        startRun,
        pauseRun,
        stopRun,
        resetRun
    };
}
