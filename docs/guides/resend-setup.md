# Email Verification & Resend Setup Guide

This guide explains how the email verification system works and how to handle the "Domain Not Verified" error you encountered.

## 1. Why you saw the 403 Error
Resend (our email provider) requires you to verify that you own a domain (like `consistencygrid.com`) before you can send emails from any address on that domain.

## 2. Testing Without a Domain
I have updated the system to automatically use Resend's testing address in development:
- **Sender Address:** `onboarding@resend.dev`
- **Current Behavior:** It now detects if you are in development and uses the testing address automatically.

> [!IMPORTANT]
> When using `onboarding@resend.dev`, Resend **only** allows you to send emails to the **exact same email address** you used to create your Resend account. This is for testing purposes.

## 3. How to Verify Your Own Domain (For Production)
When you are ready to launch and send emails from `onboarding@consistencygrid.com`:
1. Log in to [Resend Dashboard](https://resend.com/domains).
2. Click **Add Domain**.
3. Enter `consistencygrid.com`.
4. Add the provided DNS records to your domain provider (e.g., Godaddy, Namecheap, Cloudflare).
5. Once verified, the emails will start sending from your custom domain.

## 4. Troubleshooting: How to Manually Verify a User
If you are testing and cannot receive the email, you can manually verify a user in the database using the Prisma Studio:
1. Run `npx prisma studio` in your terminal.
2. Find the user in the `User` table.
3. Set the `emailVerified` field to any date/time.
4. Clear the `verificationToken` and `verificationTokenExpiry` fields.
5. Save changes.

## 5. Changing Your Domain Later

When you decide to move from `consistencygrid.netlify.app` to a custom domain (e.g., `yourapp.com`):

1. **Update Resend:**
   - Go to [Resend Domains](https://resend.com/domains) and add your new domain.
   - Verify the DNS records for the new domain.
2. **Update Environment Variables:**
   - In your Netlify dashboard (or wherever you host), update:
     - `NEXTAUTH_URL` to `https://yourapp.com`
     - `NEXT_PUBLIC_SITE_URL` to `https://yourapp.com`
3. **Update Code (Optional but Recommended):**
   - In `src/lib/mail.js`, update the fallback email address in the `fromAddress` logic if you want to use a specific email on your new domain.
4. **Redeploy:** Trigger a new build to apply the changes.
