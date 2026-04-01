# Components Directory

This directory contains all React components for the ConsistencyGrid application, organized by feature and functionality.

## Directory Structure

### `/auth`
Authentication-related components:
- `LoginForm.js` - User login form with email/password
- `SignupForm.js` - User registration form
- `GoogleSignInButton.js` - Google OAuth sign-in button

### `/dashboard`
Dashboard page components:
- `DashboardStats.js` - Statistics cards (habits, goals, streaks)
- `HabitProgress.js` - Habit progress visualization
- `GoalProgress.js` - Goal progress tracking
- `StreakCalendar.js` - Streak calendar heatmap
- `QuickActions.js` - Quick action buttons
- And more...

### `/generator`
Wallpaper generator components:
- `WallpaperPreview.js` - Live wallpaper preview
- `ThemeSelector.js` - Theme selection UI
- `ResolutionSelector.js` - Device resolution picker
- `CustomizationPanel.js` - Customization options
- And more...

### `/habits`
Habit tracking components:
- `HabitList.js` - List of all habits
- `HabitCard.js` - Individual habit card
- `HabitForm.js` - Create/edit habit form
- `HabitCompletionToggle.js` - Mark habit complete

### `/goals`
Goal management components:
- `GoalList.js` - List of all goals
- `GoalCard.js` - Individual goal card
- `GoalForm.js` - Create/edit goal form
- `SubgoalList.js` - Subgoal management
- And more...

### `/reminders`
Reminder components:
- `ReminderList.js` - List of reminders
- `ReminderForm.js` - Create/edit reminder
- `ReminderCard.js` - Individual reminder display

### `/settings`
Settings page components:
- `ProfileSettings.js` - User profile settings
- `AccountSettings.js` - Account management
- `ThemeSettings.js` - Theme preferences
- `NotificationSettings.js` - Notification preferences
- `DataExport.js` - Export user data

### `/ui`
Reusable UI components:
- `Button.js` - Custom button component
- `Input.js` - Form input component
- `Modal.js` - Modal dialog
- `LoadingSpinner.js` - Loading indicator
- `Toast.js` - Toast notifications
- `Card.js` - Card container

### `/layout`
Layout components:
- `DashboardLayout.js` - Main dashboard layout with navigation
- `Navbar.js` - Navigation bar

### `/wallpaper`
Wallpaper rendering components:
- `CanvasWallpaperEngine.js` - Main wallpaper rendering engine
- `CanvasWallpaperRenderer.js` - Canvas rendering logic
- Various theme-specific renderers

### `/common`
Common/shared components:
- `Header.js` - Page header
- `Footer.js` - Page footer
- `ErrorBoundary.js` - Error boundary wrapper
- And more...

## Component Guidelines

### Naming Conventions
- Use PascalCase for component files: `MyComponent.js`
- Use descriptive names that indicate purpose
- Suffix with component type when helpful: `LoginForm.js`, `HabitCard.js`

### Component Structure
```javascript
/**
 * ComponentName - Brief description
 * 
 * @component
 * @param {Object} props
 * @param {string} props.propName - Description
 * @returns {JSX.Element}
 */
export default function ComponentName({ propName }) {
  // Component logic
  return (
    // JSX
  );
}
```

### Best Practices
1. Keep components focused on a single responsibility
2. Extract reusable logic into custom hooks (`/src/hooks`)
3. Use prop destructuring for clarity
4. Add JSDoc comments for complex components
5. Handle loading and error states
6. Ensure accessibility (ARIA labels, keyboard navigation)
7. Use semantic HTML elements

## Usage

Import components using absolute paths with the `@/` alias:

```javascript
import LoginForm from '@/components/auth/LoginForm';
import Button from '@/components/ui/Button';
import DashboardLayout from '@/components/layout/DashboardLayout';
```
