// Google Analytics configuration
export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || '';

// Track page views
export const pageview = (url) => {
    if (!GA_TRACKING_ID) return;
    
    window.gtag?.('config', GA_TRACKING_ID, {
        page_path: url,
    });
};

// Track custom events
export const event = (action, params) => {
    if (!GA_TRACKING_ID) return;
    
    window.gtag?.('event', action, params);
};

// Track goal completion
export const trackGoalCompletion = (goalName, goalCategory) => {
    event('goal_completed', {
        goal_name: goalName,
        goal_category: goalCategory,
        timestamp: new Date().toISOString(),
    });
};

// Track habit completion
export const trackHabitCompletion = (habitName) => {
    event('habit_completed', {
        habit_name: habitName,
        timestamp: new Date().toISOString(),
    });
};

// Track user signup
export const trackSignup = (method) => {
    event('sign_up', {
        method: method,
        timestamp: new Date().toISOString(),
    });
};

// Track user login
export const trackLogin = (method) => {
    event('login', {
        method: method,
        timestamp: new Date().toISOString(),
    });
};

// Track wallpaper generation
export const trackWallpaperGenerated = (theme, type) => {
    event('wallpaper_generated', {
        theme: theme,
        wallpaper_type: type,
        timestamp: new Date().toISOString(),
    });
};
