# ConsistencyGrid - Developer Quick Reference

## 🔧 Common Development Tasks

### Start Development Server
```bash
npm run dev
```
Access at: http://localhost:3000

### Database Commands
```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Open Prisma Studio (Database GUI)
npx prisma studio

# Reset database (WARNING: Deletes all data)
npx prisma migrate reset
```

---

## 📁 Project Structure Quick Reference

```
consistencygrid/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # NextAuth
│   │   │   ├── habits/        # Habit endpoints
│   │   │   ├── settings/      # Settings endpoints
│   │   │   └── dashboard/     # Dashboard stats
│   │   ├── dashboard/         # Dashboard page
│   │   ├── generator/         # Wallpaper generator
│   │   ├── habits/            # Habits page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Signup page
│   │   └── w/[token]/         # Public wallpaper
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   ├── habits/            # Habit components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Reusable UI components
│   └── lib/
│       ├── prisma.js          # Prisma client
│       └── token.js           # Token generation
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── dev.db                 # SQLite database
└── public/                    # Static files
```

---

## 🔌 API Endpoints Reference

### Authentication
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get session

### Habits
- `GET /api/habits` - List all habits
- `POST /api/habits` - Create habit
- `GET /api/habits/me` - Get user's habits
- `GET /api/habits/today` - Today's habits with completion
- `POST /api/habits/toggle` - Toggle habit completion

### Settings
- `GET /api/settings/me` - Get user + settings
- `POST /api/settings/save` - Save wallpaper settings

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

### Wallpaper
- `GET /w/[token]` - Public wallpaper page
- `GET /w/[token]/image.png` - Wallpaper PNG image

---

## 🗄️ Database Schema Quick Reference

### User
```prisma
id          String   (Primary Key)
name        String?
email       String   (Unique)
image       String?
publicToken String   (Unique)
createdAt   DateTime
updatedAt   DateTime
```

### WallpaperSettings
```prisma
id                  String
userId              String   (Unique, Foreign Key)
dob                 DateTime
lifeExpectancyYears Int      (Default: 80)
theme               String   (Default: "dark-minimal")
width               Int      (Default: 1080)
height              Int      (Default: 2400)
showLifeGrid        Boolean  (Default: true)
showYearGrid        Boolean  (Default: true)
showAgeStats        Boolean  (Default: true)
showQuote           Boolean  (Default: false)
quote               String?
goalEnabled         Boolean  (Default: false)
goalTitle           String?
goalStartDate       DateTime?
goalDurationDays    Int?
goalUnit            String?
```

### Habit
```prisma
id        String   (Primary Key)
userId    String   (Foreign Key)
title     String
isActive  Boolean  (Default: true)
createdAt DateTime
updatedAt DateTime
```

### HabitLog
```prisma
id        String   (Primary Key)
habitId   String   (Foreign Key)
userId    String   (Foreign Key)
date      DateTime
done      Boolean  (Default: false)
createdAt DateTime
updatedAt DateTime
```

---

## 🎨 Component Patterns

### Client Component with Data Fetching
```javascript
"use client";

import { useEffect, useState } from "react";

export default function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/endpoint");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No data</p>;

  return <div>{/* Render data */}</div>;
}
```

### API Route Pattern
```javascript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function GET() {
  // 1. Check authentication
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 2. Get user from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return Response.json({ message: "User not found" }, { status: 404 });
  }

  // 3. Fetch data
  const data = await prisma.someModel.findMany({
    where: { userId: user.id },
  });

  // 4. Return response
  return Response.json({ data }, { status: 200 });
}
```

---

## 🐛 Debugging Tips

### Check if user is authenticated
```javascript
// In browser console
fetch('/api/auth/session').then(r => r.json()).then(console.log)
```

### View database in browser
```bash
npx prisma studio
```
Opens at: http://localhost:5555

### Check API response
```javascript
// In browser console
fetch('/api/habits/today')
  .then(r => r.json())
  .then(console.log)
```

### Clear browser cache
- Chrome: Ctrl+Shift+Delete
- Clear cookies for localhost:3000

---

## 🚨 Common Issues & Solutions

### Issue: "Prisma Client not found"
```bash
npx prisma generate
```

### Issue: Database locked
```bash
# Stop dev server, then:
npx prisma migrate reset
npm run dev
```

### Issue: NextAuth session not working
1. Check `.env` has `NEXTAUTH_SECRET`
2. Restart dev server
3. Clear browser cookies

### Issue: Image not loading in wallpaper
1. Check if settings are saved
2. Verify publicToken exists
3. Check browser console for errors

### Issue: Habits not showing
1. Check if user is logged in
2. Verify habits exist in database (Prisma Studio)
3. Check API response in Network tab

---

## 📝 Code Style Guide

### File Naming
- Components: `PascalCase.js` (e.g., `HabitCard.js`)
- API Routes: `lowercase/route.js`
- Utilities: `camelCase.js`

### Component Structure
```javascript
// 1. Imports
import { useState } from "react";

// 2. Component
export default function Component() {
  // 3. State
  const [state, setState] = useState();

  // 4. Effects
  useEffect(() => {}, []);

  // 5. Handlers
  function handleClick() {}

  // 6. Render
  return <div></div>;
}
```

### CSS Classes
- Use Tailwind utility classes
- Order: layout → spacing → sizing → colors → effects
- Example: `flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-gray-900 shadow-sm hover:bg-gray-50`

---

## 🎯 Testing Checklist

Before deploying:
- [ ] Test login/logout flow
- [ ] Create a habit and mark it complete
- [ ] Save wallpaper settings
- [ ] Download wallpaper PNG
- [ ] Copy auto-update link
- [ ] Test on mobile viewport
- [ ] Check all API endpoints return correct data
- [ ] Verify database migrations work
- [ ] Test with fresh database

---

## 🚀 Deployment Checklist

1. **Environment Variables**
   - Set `DATABASE_URL` (production database)
   - Set `NEXTAUTH_URL` (production URL)
   - Set `NEXTAUTH_SECRET`
   - Set Google OAuth credentials

2. **Database**
   - Run migrations: `npx prisma migrate deploy`
   - Generate client: `npx prisma generate`

3. **Build**
   - Test build: `npm run build`
   - Fix any build errors

4. **Deploy**
   - Push to Vercel/Netlify
   - Verify environment variables
   - Test production site

---

## 📚 Useful Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth Docs](https://next-auth.js.org)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Canvas API Docs](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

---

## 💡 Pro Tips

1. **Use Prisma Studio** for quick database inspection
2. **Console.log API responses** when debugging
3. **Check Network tab** for failed requests
4. **Use React DevTools** to inspect component state
5. **Test with real data** early and often
6. **Keep components small** and focused
7. **Extract reusable logic** into custom hooks
8. **Document complex algorithms** with comments

---

Happy coding! 🎉
