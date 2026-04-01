/**
 * offlineRunningStore.js
 * 
 * Manages local storage for running history.
 * Ensures that runs are saved completely offline in localStorage.
 */

const STORAGE_KEY = 'consistencygrid_runs';

/**
 * Save a completed run to localStorage
 * @param {Object} runData - { id, date, distance, duration, pace, path }
 */
export function saveRun(runData) {
    if (typeof window === 'undefined') return;
    
    try {
        const existingRuns = getRuns();
        const newRun = {
            ...runData,
            id: runData.id || Date.now().toString(),
            date: runData.date || new Date().toISOString()
        };
        
        existingRuns.push(newRun);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingRuns));
        
        // Dispatch custom event so other components (like Grid) can react instantly
        window.dispatchEvent(new CustomEvent('runDataUpdated'));
        
        return newRun;
    } catch (error) {
        console.error("Failed to save run offline:", error);
    }
}

/**
 * Retrieve all saved runs
 * @returns {Array} List of runs
 */
export function getRuns() {
    if (typeof window === 'undefined') return [];
    
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Failed to fetch offline runs:", error);
        return [];
    }
}

/**
 * Get total distance run today (in km)
 */
export function getTodayRunDistance() {
    const runs = getRuns();
    const today = new Date().toISOString().split('T')[0];
    
    return runs
        .filter(run => run.date.startsWith(today))
        .reduce((sum, run) => sum + (run.distance || 0), 0);
}
