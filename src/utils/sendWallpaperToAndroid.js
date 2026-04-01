import toast from "react-hot-toast";

export function sendWallpaperToAndroid(wallpaperUrl) {
    if (typeof window !== "undefined") {
        if (window.Android && window.Android.saveWallpaperUrl) {

            // Function to trigger the native sync
            const triggerSync = (isRetry = false) => {
                const timestamp = Date.now();
                const connector = wallpaperUrl.includes('?') ? '&' : '?';
                const urlWithTimestamp = `${wallpaperUrl}${connector}t=${timestamp}`;

                console.log(`📱 Sending Auto-Sync to Android (${isRetry ? 'Retry' : 'Initial'}):`, urlWithTimestamp);

                try {
                    window.Android.saveWallpaperUrl(urlWithTimestamp);
                    if (!isRetry) {
                        toast.success("Updating Wallpaper...", {
                            id: 'wallpaper-sync', // Prevent duplicate toasts
                            duration: 3000,
                            icon: '🔄',
                            style: { background: '#333', color: '#fff' }
                        });
                    }
                } catch (e) {
                    console.error("Native bridge error:", e);
                }
            };

            // 1. Trigger immediately
            triggerSync(false);

            // 2. Trigger again after 3 seconds (Double-Tap)
            // This ensures DB consistency and wakes up the app if it missed the first one
            setTimeout(() => {
                triggerSync(true);
            }, 2500);

        } else {
            console.log("🌐 Not running inside Android app or bridge not found");
        }
    }
}
