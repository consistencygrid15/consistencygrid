# 🚀 Deployment Guide - ConsistencyGrid

This guide will help you deploy ConsistencyGrid to production.

## 📋 Prerequisites

- Node.js 18+ installed
- A database (SQLite for development, PostgreSQL recommended for production)
- Google OAuth credentials (optional, for Google sign-in)
- A hosting provider account (Vercel, Netlify, or similar)

---

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# NextAuth Configuration (REQUIRED)
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-random-secret-key-here

# Database (REQUIRED)
DATABASE_URL="file:./dev.db"  # For SQLite (development)
# OR for PostgreSQL (production):
# DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Google OAuth (OPTIONAL - for Google sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Site URL (REQUIRED for SEO)
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Google Verification (OPTIONAL - for Google Search Console)
NEXT_PUBLIC_GOOGLE_VERIFICATION=your-verification-code
```

### Generating NEXTAUTH_SECRET

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

---

## 🚀 Deploy to Vercel (Recommended)

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/yourusername/consistencygrid.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables in the Vercel dashboard
   - Click "Deploy"

3. **Configure Database**
   - For production, use a PostgreSQL database (Vercel Postgres, Supabase, or Railway)
   - Update `DATABASE_URL` in Vercel environment variables
   - Run migrations: `npx prisma migrate deploy`

### Option 2: Deploy via CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add environment variables when asked.

---

## 🌐 Deploy to Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`

2. **Environment Variables**
   - Add all variables from `.env.example` in Netlify dashboard
   - Go to Site settings → Environment variables

3. **Deploy**
   - Connect your GitHub repository
   - Netlify will auto-deploy on push

---

## 🗄️ Database Setup

### For Production (PostgreSQL)

1. **Create a PostgreSQL database** (Supabase, Railway, or AWS RDS)

2. **Update Prisma Schema** (if needed)
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

---

## 🔐 Google OAuth Setup

1. **Create OAuth Credentials**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://your-domain.com/api/auth/callback/google` (production)

2. **Add to Environment Variables**
   ```env
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Google OAuth configured (if using)
- [ ] Site URL updated in environment variables
- [ ] Test authentication flow
- [ ] Test wallpaper generation
- [ ] Verify sitemap.xml is accessible
- [ ] Check robots.txt
- [ ] Test on mobile devices
- [ ] Set up error monitoring (Sentry, etc.)

---

## 🐛 Troubleshooting

### Build Fails

- Check Node.js version (18+ required)
- Verify all dependencies are installed
- Check for TypeScript/ESLint errors

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check database is accessible from hosting provider
- Run `npx prisma generate` before build

### Authentication Not Working

- Verify `NEXTAUTH_URL` matches your domain
- Check `NEXTAUTH_SECRET` is set
- Verify OAuth redirect URIs are correct

### Images Not Loading

- Check `NEXT_PUBLIC_SITE_URL` is set correctly
- Verify image routes are accessible
- Check CORS settings if using external images

---

## 📊 Monitoring & Analytics

Consider adding:

- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Performance**: Vercel Analytics, Web Vitals

---

## 🔄 Continuous Deployment

Both Vercel and Netlify support automatic deployments:

- **Vercel**: Auto-deploys on push to main branch
- **Netlify**: Auto-deploys on push to main branch (configured in `netlify.toml`)

---

## 📝 Additional Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review error logs in your hosting provider dashboard
3. Check Next.js and Prisma documentation
4. Open an issue on GitHub

---

**Happy Deploying! 🎉**
