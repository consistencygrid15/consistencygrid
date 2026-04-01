# Implementation Files for ConsistencyGridWallpaper App

## This folder shows the exact files you need to create in your React Native app

---

## 📁 File Structure to Add

```
ConsistencyGridWallpaper/
├── src/
│   ├── services/
│   │   └── paymentService.js          ← ADD THIS
│   └── components/
│       ├── PaymentButton.js           ← ADD THIS
│       └── UpgradePrompt.js           ← ADD THIS
│
└── android/
    └── app/
        └── src/
            ├── main/
            │   ├── AndroidManifest.xml    ← UPDATE THIS
            │   └── java/com/consistencygridwallpaper/
            │       ├── MainActivity.kt    ← UPDATE THIS
            │       └── PaymentModule.kt   ← ADD THIS (Optional)
            │
            └── [build files]
```

---

## 🔧 FILE 1: Payment Service

**Location**: `src/services/paymentService.js`

```javascript
/**
 * Payment Service - ConsistencyGridWallpaper App
 * 
 * Handles opening website for payment (bypasses PlayStore 15%)
 * Stores subscription data locally
 */

import { Platform, Linking, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WEBSITE_URL = 'https://consistencygrid.com';
const PLATFORM_STORAGE_KEY = 'cg_platform';
const SUBSCRIPTION_STORAGE_KEY = 'cg_subscription';

class PaymentService {
    /**
     * Initialize app - mark as Android
     */
    static async init() {
        try {
            // Mark this as Android app (website will detect via this)
            await AsyncStorage.setItem(PLATFORM_STORAGE_KEY, 'android');
            console.log('✅ Payment Service initialized');
        } catch (error) {
            console.error('❌ Failed to init PaymentService:', error);
        }
    }

    /**
     * Open pricing page on website in external browser
     * This is KEY to avoiding PlayStore 15% commission!
     */
    static async openPricingPage() {
        try {
            const url = `${WEBSITE_URL}/pricing?source=app&platform=android`;
            
            const canOpen = await Linking.canOpenURL(url);
            if (!canOpen) {
                Alert.alert(
                    'Cannot Open Website',
                    'Your device cannot open external URLs. Please try again.'
                );
                return false;
            }

            // Open in browser (NOT in app WebView)
            await Linking.openURL(url);
            console.log('✅ Opened pricing page');
            return true;
        } catch (error) {
            console.error('❌ Error opening pricing:', error);
            Alert.alert('Error', 'Failed to open pricing page');
            return false;
        }
    }

    /**
     * Save subscription after payment
     * Called from deep link handler
     */
    static async saveSubscription(data) {
        try {
            await AsyncStorage.setItem(
                SUBSCRIPTION_STORAGE_KEY,
                JSON.stringify({
                    token: data.token,
                    plan: data.plan,
                    status: data.status,
                    expiryDate: data.expiryDate,
                    savedAt: new Date().toISOString(),
                })
            );
            console.log('✅ Subscription saved:', data.plan);
            return true;
        } catch (error) {
            console.error('❌ Failed to save subscription:', error);
            return false;
        }
    }

    /**
     * Get current subscription status
     */
    static async getSubscription() {
        try {
            const data = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
            if (!data) {
                return {
                    plan: 'free',
                    status: 'inactive',
                    isPremium: false,
                };
            }

            const subscription = JSON.parse(data);
            
            // Check if expired
            const expiryTime = new Date(subscription.expiryDate).getTime();
            const now = new Date().getTime();
            const isExpired = now > expiryTime;

            return {
                ...subscription,
                isPremium: !isExpired && subscription.status === 'active',
                isExpired,
            };
        } catch (error) {
            console.error('❌ Error getting subscription:', error);
            return {
                plan: 'free',
                status: 'inactive',
                isPremium: false,
            };
        }
    }

    /**
     * Clear subscription (logout)
     */
    static async clearSubscription() {
        try {
            await AsyncStorage.removeItem(SUBSCRIPTION_STORAGE_KEY);
            console.log('✅ Subscription cleared');
            return true;
        } catch (error) {
            console.error('❌ Error clearing subscription:', error);
            return false;
        }
    }

    /**
     * Check if user is premium
     */
    static async isPremium() {
        const subscription = await this.getSubscription();
        return subscription.isPremium;
    }
}

export default PaymentService;
```

---

## 🔧 FILE 2: Payment Button Component

**Location**: `src/components/PaymentButton.js`

```javascript
/**
 * Payment Button Component
 * Shows upgrade button in app
 */

import React, { useState } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import PaymentService from '../services/paymentService';

export const PaymentButton = ({ onSuccess = null }) => {
    const [loading, setLoading] = useState(false);
    const [isPremium, setIsPremium] = useState(false);

    React.useEffect(() => {
        checkPremium();
    }, []);

    const checkPremium = async () => {
        const premium = await PaymentService.isPremium();
        setIsPremium(premium);
    };

    const handlePress = async () => {
        setLoading(true);
        const success = await PaymentService.openPricingPage();
        setLoading(false);

        if (success && onSuccess) {
            onSuccess();
        }
    };

    if (isPremium) {
        return (
            <View style={styles.premiumContainer}>
                <Text style={styles.premiumText}>✨ Premium Active</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={styles.button}
            onPress={handlePress}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" size="small" />
            ) : (
                <Text style={styles.buttonText}>Upgrade Plan</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 12,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    premiumContainer: {
        backgroundColor: '#10b981',
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 8,
        alignItems: 'center',
        marginVertical: 12,
    },
    premiumText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PaymentButton;
```

---

## 🔧 FILE 3: Upgrade Prompt (Optional)

**Location**: `src/components/UpgradePrompt.js`

```javascript
/**
 * Upgrade Prompt Component
 * Shows modal/prompt when user hits free tier limits
 */

import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
} from 'react-native';
import PaymentService from '../services/paymentService';

export const UpgradePrompt = ({ visible, onClose, feature = 'Feature' }) => {
    const [loading, setLoading] = useState(false);

    const handleUpgrade = async () => {
        setLoading(true);
        await PaymentService.openPricingPage();
        setLoading(false);
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    {/* Header */}
                    <Text style={styles.emoji}>🔒</Text>
                    <Text style={styles.title}>Premium Feature</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        {feature} is available in the Premium plan.
                        Upgrade now to unlock all features!
                    </Text>

                    {/* Features List */}
                    <View style={styles.featuresList}>
                        <FeatureItem text="Unlimited wallpapers" />
                        <FeatureItem text="Custom colors & themes" />
                        <FeatureItem text="Priority support" />
                        <FeatureItem text="Ad-free experience" />
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={onClose}
                            disabled={loading}
                        >
                            <Text style={styles.cancelText}>Not Now</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.upgradeButton}
                            onPress={handleUpgrade}
                            disabled={loading}
                        >
                            <Text style={styles.upgradeText}>
                                {loading ? '...' : 'Upgrade Now'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const FeatureItem = ({ text }) => (
    <View style={styles.featureItem}>
        <Text style={styles.checkmark}>✓</Text>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        alignItems: 'center',
    },
    emoji: {
        fontSize: 48,
        marginBottom: 12,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        color: '#1f2937',
    },
    message: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 20,
    },
    featuresList: {
        width: '100%',
        marginBottom: 24,
    },
    featureItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
    },
    checkmark: {
        color: '#10b981',
        fontSize: 18,
        marginRight: 12,
        fontWeight: 'bold',
    },
    featureText: {
        fontSize: 14,
        color: '#374151',
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
    },
    cancelText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },
    upgradeButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
        alignItems: 'center',
    },
    upgradeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default UpgradePrompt;
```

---

## 🔧 FILE 4: Update AndroidManifest.xml

**Location**: `android/app/src/main/AndroidManifest.xml`

Add this inside the `<activity>` tag for MainActivity:

```xml
<!-- Deep link for payment success callback -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <data
        android:scheme="consistencygrid"
        android:host="payment-success" />
</intent-filter>

<!-- Deep link to pricing page -->
<intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    
    <data
        android:scheme="https"
        android:host="consistencygrid.com"
        android:pathPrefix="/pricing" />
</intent-filter>
```

---

## 🔧 FILE 5: Update MainActivity.kt

**Location**: `android/app/src/main/java/com/consistencygridwallpaper/MainActivity.kt`

Update to handle deep links:

```kotlin
package com.consistencygridwallpaper

import android.content.Intent
import android.net.Uri
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultReactActivityDelegate

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Mark this as Android app
        val prefs = getSharedPreferences("consistencygrid", MODE_PRIVATE)
        prefs.edit().putString("platform", "android").apply()
        
        // Handle deep links from payment/pricing
        handleDeepLink(intent)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val uri: Uri? = intent?.data
        
        if (uri != null) {
            when {
                // Payment success callback
                uri.scheme == "consistencygrid" && uri.host == "payment-success" -> {
                    val token = uri.getQueryParameter("token")
                    val plan = uri.getQueryParameter("plan")
                    val expiryDate = uri.getQueryParameter("expiryDate")
                    
                    if (token != null) {
                        // Store subscription data
                        val prefs = getSharedPreferences("consistencygrid", MODE_PRIVATE)
                        prefs.edit()
                            .putString("subscription_token", token)
                            .putString("subscription_plan", plan)
                            .putString("subscription_expiry", expiryDate)
                            .putString("subscription_status", "active")
                            .apply()
                        
                        // Emit event to React Native
                        val event = Arguments.createMap().apply {
                            putString("token", token)
                            putString("plan", plan)
                            putString("expiryDate", expiryDate)
                        }
                        
                        ReactNativeHost.instance?.currentReactContext?.let { context ->
                            RNEventEmitter.emitEvent("PaymentSuccess", event, context)
                        }
                    }
                }
            }
        }
    }

    override fun getMainComponentName(): String = "ConsistencyGridWallpaper"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName)
}
```

---

## 📱 FILE 6: Update App.js (or App.tsx)

Add this to your main App component:

```javascript
import React, { useEffect } from 'react';
import { Linking } from 'react-native';
import PaymentService from './src/services/paymentService';

export default function App() {
    useEffect(() => {
        // Initialize payment service
        PaymentService.init();

        // Handle deep links
        setupDeepLinking();
    }, []);

    const setupDeepLinking = () => {
        // Listen for deep links
        const subscription = Linking.addEventListener('url', handleDeepLink);

        // Get initial URL if app opened via link
        Linking.getInitialURL()
            .then((url) => {
                if (url != null) {
                    handleDeepLink({ url });
                }
            })
            .catch((error) => console.error('Error getting initial URL:', error));

        return () => subscription.remove();
    };

    const handleDeepLink = async (event) => {
        if (!event.url) return;

        if (event.url.includes('payment-success')) {
            // Extract payment parameters
            const url = new URL(event.url);
            
            await PaymentService.saveSubscription({
                token: url.searchParams.get('token'),
                plan: url.searchParams.get('plan'),
                expiryDate: url.searchParams.get('expiryDate'),
                status: 'active',
            });

            // Trigger any subscription update listeners
            // (Your app should check for subscription changes)
        }
    };

    return (
        // Your app JSX
        // Use <PaymentButton /> where needed
    );
}
```

---

## 📋 INSTALLATION STEPS

### Step 1: Add Dependencies
```bash
cd D:\startup\ConsistencyGridWallpaper

# Install AsyncStorage if not already installed
npm install @react-native-async-storage/async-storage
```

### Step 2: Create Service & Component Files
- Create `src/services/paymentService.js`
- Create `src/components/PaymentButton.js`
- Create `src/components/UpgradePrompt.js` (optional)

### Step 3: Update Android Files
- Update `android/app/src/main/AndroidManifest.xml`
- Update `android/app/src/main/java/com/consistencygridwallpaper/MainActivity.kt`

### Step 4: Update App.js
- Import PaymentService
- Add deep link handler
- Add PaymentButton to UI

### Step 5: Test
```bash
react-native run-android

# Test:
# 1. Click "Upgrade" button
# 2. Should open website in browser
# 3. Complete payment on website
# 4. Should redirect back to app via deep link
# 5. App should show "✨ Premium Active"
```

---

## 🎯 Quick Reference

### Use PaymentButton in your screens:
```javascript
import PaymentButton from '@/components/PaymentButton';

// In your component:
<PaymentButton />
```

### Show upgrade prompt when hitting limit:
```javascript
import { UpgradePrompt } from '@/components/UpgradePrompt';

const [showUpgrade, setShowUpgrade] = useState(false);

// When user hits limit:
setShowUpgrade(true);

// In JSX:
<UpgradePrompt
    visible={showUpgrade}
    onClose={() => setShowUpgrade(false)}
    feature="Custom Wallpapers"
/>
```

### Check if user is premium:
```javascript
const isPremium = await PaymentService.isPremium();

if (!isPremium) {
    // Show limited features
} else {
    // Show all features
}
```

---

## ✅ Summary

✅ Website detects app → hides payment UI  
✅ App opens website in browser → no PlayStore commission  
✅ Users pay via Razorpay → 2% commission only  
✅ Payment success → deep link back to app  
✅ Subscription synced locally → app shows premium features  

**SAVE 13% per transaction!** 💰

