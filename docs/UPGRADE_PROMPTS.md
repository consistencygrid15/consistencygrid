# Upgrade Prompts Implementation Guide

## Overview

This guide shows how to add upgrade prompts throughout the app when users hit free plan limits or need to access premium features.

## Components Available

### 1. UpgradeBanner
**File**: `src/components/payment/UpgradeBanner.js`

Compact banner for dashboard and pages.

**Variants**:
- `default` - Full banner with features list
- `compact` - Small banner for dashboard
- `floating` - Bottom-right floating banner

**Usage**:
```javascript
import UpgradeBanner from '@/components/payment/UpgradeBanner';

// Compact banner (dashboard)
<UpgradeBanner variant="compact" showFeatures={false} />

// Default banner
<UpgradeBanner variant="default" showFeatures={true} />

// Floating banner
<UpgradeBanner variant="floating" />
```

---

### 2. UpgradePrompt
**File**: `src/components/payment/UpgradePrompt.js`

Modal that shows when user hits limits.

**Usage**:
```javascript
import UpgradePrompt from '@/components/payment/UpgradePrompt';

const [showPrompt, setShowPrompt] = useState(false);

<UpgradePrompt
  isOpen={showPrompt}
  onClose={() => setShowPrompt(false)}
  title="Upgrade to Pro"
  message="You've reached the limit for habits"
  feature="habits"
  currentCount={3}
  limit={3}
/>
```

---

### 3. useLimitCheck Hook
**File**: `src/hooks/useLimitCheck.js`

Custom hook for checking limits.

**Usage**:
```javascript
import useLimitCheck from '@/hooks/useLimitCheck';

const {
  showUpgradePrompt,
  setShowUpgradePrompt,
  isAtLimit,
  checkLimit,
  currentCount,
  limit
} = useLimitCheck('habits', habitCount, 3);

// Check before adding
const handleAddHabit = () => {
  if (!checkLimit()) {
    return; // Shows upgrade prompt automatically
  }
  // Add habit logic
};
```

---

## Implementation Examples

### Example 1: Dashboard (Already Implemented)

**File**: `src/app/dashboard/page.js`

```javascript
import UpgradeBanner from '@/components/payment/UpgradeBanner';

// Fetch user plan
const user = await prisma.user.findUnique({
  where: { email: session.user.email },
  select: { plan: true }
});

const isFreeUser = !user || user.plan === "free" || !user.plan;

// Show banner for free users
{isFreeUser && (
  <div className="mt-6">
    <UpgradeBanner variant="compact" showFeatures={false} />
  </div>
)}
```

---

### Example 2: Habits Page with Limit Check

**File**: `src/components/habits/HabitCard.js` (example)

```javascript
"use client";

import { useState } from 'react';
import UpgradePrompt from '@/components/payment/UpgradePrompt';
import useLimitCheck from '@/hooks/useLimitCheck';

export default function HabitCard({ habits, user }) {
  const isFreeUser = user.plan === "free" || !user.plan;
  const habitCount = habits.length;
  
  const {
    showUpgradePrompt,
    setShowUpgradePrompt,
    checkLimit
  } = useLimitCheck('habits', habitCount, 3);

  const handleAddHabit = () => {
    // Check limit for free users
    if (isFreeUser && !checkLimit()) {
      return; // Upgrade prompt shown automatically
    }
    
    // Proceed with adding habit
    // ... your add habit logic
  };

  return (
    <div>
      <button onClick={handleAddHabit}>
        Add Habit
      </button>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Upgrade to Pro"
        message="Unlock unlimited habits with Pro"
        feature="habits"
        currentCount={habitCount}
        limit={3}
      />
    </div>
  );
}
```

---

### Example 3: Goals Page with Limit Check

```javascript
"use client";

import { useState } from 'react';
import UpgradePrompt from '@/components/payment/UpgradePrompt';

export default function GoalsPage({ goals, user }) {
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const isFreeUser = user.plan === "free" || !user.plan;
  const goalCount = goals.length;
  const limit = 3;

  const handleAddGoal = () => {
    if (isFreeUser && goalCount >= limit) {
      setShowUpgradePrompt(true);
      return;
    }
    
    // Add goal logic
  };

  return (
    <div>
      <button onClick={handleAddGoal}>
        Add Goal
      </button>

      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        title="Upgrade to Pro"
        message="Unlock unlimited goals with Pro"
        feature="goals"
        currentCount={goalCount}
        limit={limit}
      />
    </div>
  );
}
```

---

### Example 4: Analytics Page (Premium Feature)

```javascript
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UpgradeBanner from '@/components/payment/UpgradeBanner';

export default function AnalyticsPage({ user }) {
  const router = useRouter();
  const isFreeUser = user.plan === "free" || !user.plan;

  // Redirect free users or show upgrade banner
  if (isFreeUser) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Advanced Analytics</h1>
        <UpgradeBanner 
          variant="default" 
          showFeatures={true}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Analytics content for Pro users */}
    </div>
  );
}
```

---

### Example 5: Settings Page with Subscription Info

```javascript
import UpgradeButton from '@/components/payment/UpgradeButton';

export default function SettingsPage({ user }) {
  const isFreeUser = user.plan === "free" || !user.plan;

  return (
    <div>
      {/* Subscription Section */}
      <div className="bg-white rounded-lg p-6 border">
        <h3 className="font-bold text-lg mb-2">Subscription</h3>
        <p className="text-gray-600 mb-4">
          Current Plan: <span className="font-semibold">
            {isFreeUser ? "Free" : "Pro"}
          </span>
        </p>
        
        {isFreeUser && (
          <UpgradeButton 
            planName="Pro" 
            size="md" 
            variant="primary"
          />
        )}
      </div>
    </div>
  );
}
```

---

## Platform-Aware Behavior

All upgrade components automatically detect platform:

### Web Platform
- Shows "Upgrade to Pro" button
- Navigates to `/pricing` page
- Full payment flow available

### Android App
- Shows "Upgrade via Website" button
- Opens external browser
- Directs to website pricing page
- Subscription syncs automatically

**No code changes needed** - components handle this automatically!

---

## Where to Add Upgrade Prompts

### ✅ Already Implemented
- Dashboard (compact banner for free users)
- Pricing page (full payment UI)

### 🔄 Recommended Additions

1. **Habits Page**
   - Show prompt when trying to add 4th habit
   - Use `UpgradePrompt` modal

2. **Goals Page**
   - Show prompt when trying to add 4th goal
   - Use `UpgradePrompt` modal

3. **Analytics Page**
   - Show upgrade banner for free users
   - Use `UpgradeBanner` variant="default"

4. **Calendar Page**
   - Show floating banner for free users
   - Use `UpgradeBanner` variant="floating"

5. **Settings Page**
   - Show subscription status
   - Add `UpgradeButton` for free users

6. **Export Features**
   - Show prompt when free user tries to export
   - Use `UpgradePrompt` modal

---

## Testing

### Test Upgrade Prompts

1. **Simulate Free User**:
   ```sql
   UPDATE User SET plan = 'free' WHERE email = 'test@example.com';
   ```

2. **Test Dashboard**:
   - Visit `/dashboard`
   - Verify compact upgrade banner appears

3. **Test Limit Exceeded**:
   - Add 3 habits (free limit)
   - Try to add 4th habit
   - Verify upgrade prompt appears

4. **Test Platform Detection**:
   ```javascript
   // In browser console
   localStorage.setItem('consistencygrid_platform', 'android');
   location.reload();
   ```
   - Verify "Upgrade via Website" button shows

---

## Customization

### Change Colors

Edit `UpgradeBanner.js` or `UpgradePrompt.js`:

```javascript
// Change from orange to blue
className="bg-gradient-to-r from-blue-500 to-blue-600"
```

### Change Free Plan Limits

Edit `src/lib/subscription-utils.js`:

```javascript
const freeLimit = 5; // Change from 3 to 5
```

### Add Custom Messages

```javascript
<UpgradePrompt
  title="Custom Title"
  message="Custom message here"
  feature="custom_feature"
/>
```

---

## Summary

**Components Created**:
1. ✅ `UpgradeBanner.js` - 3 variants (default, compact, floating)
2. ✅ `UpgradePrompt.js` - Modal for limit exceeded
3. ✅ `UpgradeButton.js` - Reusable upgrade button
4. ✅ `useLimitCheck.js` - Custom hook for limits

**Already Implemented**:
- ✅ Dashboard upgrade banner for free users
- ✅ Platform detection (web vs Android)
- ✅ Automatic upgrade URL routing

**Next Steps**:
1. Add upgrade prompts to Habits page
2. Add upgrade prompts to Goals page
3. Add upgrade banner to Analytics page
4. Test all upgrade flows
