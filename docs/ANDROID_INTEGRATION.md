# Android WebView Integration Guide

## Overview

This guide explains how to integrate the ConsistencyGrid web app into your Android WebView application with platform detection support.

## Prerequisites

- Android Studio
- Kotlin/Java knowledge
- Existing WebView app setup

## Integration Steps

### 1. Set Platform Flag on WebView Initialization

When your WebView loads the ConsistencyGrid website, set a platform flag to identify it as the Android app.

#### Kotlin Example

```kotlin
// MainActivity.kt or your WebView activity

import android.webkit.WebView
import android.webkit.WebViewClient
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()
        loadConsistencyGrid()
    }

    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true // Required for localStorage
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
        }

        webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                
                // Set platform flag after page loads
                setPlatformFlag()
            }
        }
    }

    private fun setPlatformFlag() {
        val javascript = """
            (function() {
                try {
                    localStorage.setItem('consistencygrid_platform', 'android');
                    console.log('[Android] Platform flag set successfully');
                } catch (e) {
                    console.error('[Android] Failed to set platform flag:', e);
                }
            })();
        """.trimIndent()

        webView.evaluateJavascript(javascript, null)
    }

    private fun loadConsistencyGrid() {
        // Load your ConsistencyGrid website
        val url = "https://consistencygrid.com" // or your production URL
        webView.loadUrl(url)
    }
}
```

#### Java Example

```java
// MainActivity.java

import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        webView = findViewById(R.id.webView);
        setupWebView();
        loadConsistencyGrid();
    }

    private void setupWebView() {
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setDatabaseEnabled(true);

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                setPlatformFlag();
            }
        });
    }

    private void setPlatformFlag() {
        String javascript = 
            "(function() {" +
            "  try {" +
            "    localStorage.setItem('consistencygrid_platform', 'android');" +
            "    console.log('[Android] Platform flag set successfully');" +
            "  } catch (e) {" +
            "    console.error('[Android] Failed to set platform flag:', e);" +
            "  }" +
            "})();";

        webView.evaluateJavascript(javascript, null);
    }

    private void loadConsistencyGrid() {
        String url = "https://consistencygrid.com";
        webView.loadUrl(url);
    }
}
```

### 2. Handle External Links (Important!)

When users click "Upgrade via Website", the app should open the link in an external browser (not in the WebView). This is required for Play Store compliance.

#### Kotlin Example

```kotlin
webView.webViewClient = object : WebViewClient() {
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url.toString()
        
        // If URL contains pricing page, open in external browser
        if (url.contains("/pricing") || url.contains("upgrade")) {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
            startActivity(intent)
            return true // Don't load in WebView
        }
        
        // Load other URLs in WebView
        return false
    }

    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        setPlatformFlag()
    }
}
```

#### Java Example

```java
webView.setWebViewClient(new WebViewClient() {
    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        String url = request.getUrl().toString();
        
        // If URL contains pricing page, open in external browser
        if (url.contains("/pricing") || url.contains("upgrade")) {
            Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
            startActivity(intent);
            return true; // Don't load in WebView
        }
        
        // Load other URLs in WebView
        return false;
    }

    @Override
    public void onPageFinished(WebView view, String url) {
        super.onPageFinished(view, url);
        setPlatformFlag();
    }
});
```

### 3. Optional: Add JavaScript Interface

For more robust platform detection, you can inject a custom JavaScript interface:

#### Kotlin Example

```kotlin
class AndroidInterface(private val context: Context) {
    @JavascriptInterface
    fun getPlatform(): String {
        return "android"
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return BuildConfig.VERSION_NAME
    }
}

// In your activity:
webView.addJavascriptInterface(AndroidInterface(this), "Android")
```

Then in JavaScript, you can check:
```javascript
if (typeof window.Android !== 'undefined') {
    console.log('Platform:', window.Android.getPlatform());
    console.log('App Version:', window.Android.getAppVersion());
}
```

### 4. Session Persistence

Ensure cookies and localStorage persist across app restarts:

```kotlin
webView.settings.apply {
    // ... other settings ...
    
    // Enable cookies
    CookieManager.getInstance().setAcceptCookie(true)
    CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
}
```

### 5. Testing

#### Test Platform Detection

1. Build and run your app
2. Open Chrome DevTools on your computer
3. Connect your Android device via USB
4. Navigate to `chrome://inspect`
5. Inspect your WebView
6. In console, run:
   ```javascript
   localStorage.getItem('consistencygrid_platform')
   // Should return: "android"
   ```

#### Test Payment UI Hiding

1. Navigate to `/pricing` in the app
2. Verify you see "Upgrade via Website" button
3. Verify NO payment forms are visible
4. Click the upgrade button
5. Verify it opens in external browser (Chrome/default browser)

#### Test Subscription Sync

1. Subscribe on the website (in external browser)
2. Return to the app
3. Navigate to dashboard or settings
4. Verify Pro features are unlocked
5. Verify subscription status shows "Pro"

## Complete Example

Here's a complete `MainActivity.kt` with all best practices:

```kotlin
package com.consistencygrid.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.webkit.*
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webView)
        setupWebView()
        loadConsistencyGrid()
    }

    private fun setupWebView() {
        // WebView settings
        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            cacheMode = WebSettings.LOAD_DEFAULT
            
            // Enable cookies
            CookieManager.getInstance().setAcceptCookie(true)
            CookieManager.getInstance().setAcceptThirdPartyCookies(webView, true)
        }

        // WebView client for URL handling
        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url.toString()
                
                // Open pricing/payment pages in external browser
                if (url.contains("/pricing") || 
                    url.contains("/payment") ||
                    url.contains("upgrade")) {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(intent)
                    return true
                }
                
                return false
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                setPlatformFlag()
            }
        }

        // Optional: Add JavaScript interface
        webView.addJavascriptInterface(AndroidInterface(this), "Android")
    }

    private fun setPlatformFlag() {
        val javascript = """
            (function() {
                try {
                    localStorage.setItem('consistencygrid_platform', 'android');
                    console.log('[Android] Platform marked successfully');
                } catch (e) {
                    console.error('[Android] Platform marking failed:', e);
                }
            })();
        """.trimIndent()

        webView.evaluateJavascript(javascript, null)
    }

    private fun loadConsistencyGrid() {
        val url = "https://consistencygrid.com"
        webView.loadUrl(url)
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    // JavaScript Interface
    inner class AndroidInterface(private val context: Context) {
        @JavascriptInterface
        fun getPlatform(): String = "android"

        @JavascriptInterface
        fun getAppVersion(): String = BuildConfig.VERSION_NAME
    }
}
```

## Troubleshooting

### Platform flag not being set

**Problem**: `localStorage.getItem('consistencygrid_platform')` returns `null`

**Solutions**:
1. Ensure `domStorageEnabled = true` in WebView settings
2. Check that `onPageFinished` is being called
3. Verify JavaScript is enabled
4. Check console for errors

### Payment UI still showing in app

**Problem**: Payment buttons visible in Android app

**Solutions**:
1. Clear app data and cache
2. Verify platform flag is set correctly
3. Check that you're using the latest web app code
4. Inspect localStorage in Chrome DevTools

### External links not opening

**Problem**: Clicking "Upgrade via Website" doesn't open browser

**Solutions**:
1. Verify `shouldOverrideUrlLoading` is implemented
2. Check URL matching logic
3. Ensure app has internet permission in AndroidManifest.xml

### Subscription not syncing

**Problem**: User subscribed on website but app shows Free plan

**Solutions**:
1. Verify user is logged in with same account
2. Check session/cookie persistence
3. Force refresh the app
4. Check API calls in Network tab

## AndroidManifest.xml

Don't forget to add required permissions:

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.consistencygrid.app">

    <!-- Required permissions -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:usesCleartextTraffic="true"
        android:theme="@style/Theme.ConsistencyGrid">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
```

## Play Store Compliance Checklist

Before submitting to Play Store:

- [ ] No payment UI visible in app
- [ ] No pricing information displayed in app
- [ ] "Upgrade via Website" opens external browser
- [ ] No in-app browser for payment pages
- [ ] No mention of "cheaper on website"
- [ ] Subscription syncs automatically
- [ ] Session persists across app restarts

## Support

For issues or questions, refer to:
- [Platform Detection Documentation](../docs/PLATFORM_DETECTION.md)
- [Implementation Plan](../brain/implementation_plan.md)
