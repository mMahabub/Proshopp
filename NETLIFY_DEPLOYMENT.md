# Netlify Deployment Guide for Proshopp

This guide provides step-by-step instructions for deploying the Proshopp e-commerce application to Netlify.

## Prerequisites

1. A [Netlify account](https://app.netlify.com/signup)
2. GitHub repository with your code
3. All required API keys and credentials

## Step 1: Install Netlify CLI (Optional)

```bash
npm install -g netlify-cli
netlify login
```

## Step 2: Configure Environment Variables in Netlify

**CRITICAL:** The following environment variables MUST be set in Netlify for the application to work:

### Navigate to Environment Variables

1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** for each required variable

### Required Environment Variables

#### 🔴 **AUTH_SECRET** (REQUIRED)
```
Generate with: npx auth secret
```
Copy the generated secret and paste it in Netlify.

**Why required:** NextAuth requires this to sign JWT tokens and encrypt session cookies. Without it, login will fail with "server configuration" error.

#### 🔴 **NEXTAUTH_URL** (REQUIRED)
```
https://your-app-name.netlify.app
```
Replace with your actual Netlify URL after deployment.

**Why required:** NextAuth uses this to construct OAuth callback URLs.

#### 🔴 **DATABASE_URL** (REQUIRED)
```
postgres://username:password@host/database?sslmode=require
```
Your Neon PostgreSQL connection string.

**Why required:** Application cannot connect to database without this.

#### 🟡 **NEXT_PUBLIC_SERVER_URL** (REQUIRED)
```
https://your-app-name.netlify.app
```
Same as your Netlify URL.

**Why required:** Used by the app to construct URLs for redirects and API calls.

#### 🟡 **NEXT_PUBLIC_APP_NAME** (Optional)
```
Proshopp
```

#### 🟡 **NEXT_PUBLIC_APP_DESCRIPTION** (Optional)
```
A modern ecommerce store built with Next.js
```

### Optional Environment Variables

#### Google OAuth (if using Google sign-in)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

#### GitHub OAuth (if using GitHub sign-in)
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`

#### Stripe (if using payment features)
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### UploadThing (if using file uploads)
- `UPLOADTHING_TOKEN`
- `UPLOADTHING_SECRET`
- `UPLOADTHING_APP_ID`

#### Resend (if using email features)
- `RESEND_API_KEY`

## Step 3: Connect Repository to Netlify

### Method 1: Using Netlify Dashboard

1. Log in to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** → **Import an existing project**
3. Choose **GitHub** (or your Git provider)
4. Authorize Netlify to access your repositories
5. Select your `proshopp` repository

### Method 2: Using Netlify CLI

```bash
cd /path/to/proshopp
netlify init
```

Follow the prompts to link your repository.

## Step 4: Configure Build Settings

Netlify should auto-detect Next.js settings, but verify:

- **Build command:** `npm run build`
- **Publish directory:** `.next`
- **Functions directory:** `netlify/functions`

These are already configured in `netlify.toml`.

## Step 5: Install Next.js Plugin

1. Go to **Integrations** in Netlify dashboard
2. Search for "Next.js"
3. Install **Essential Next.js** plugin
4. Or it's already configured in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Step 6: Deploy

### Trigger Deployment

- **Automatic:** Push to your `main` branch on GitHub
- **Manual:** Click **Trigger deploy** in Netlify dashboard
- **CLI:** Run `netlify deploy --prod`

### Build Process

Netlify will:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Run `postinstall` script (generates Prisma Client)
4. Run build command (`npm run build`)
5. Deploy to CDN

## Step 7: Update OAuth Callback URLs

After deployment, update your OAuth provider settings:

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URI:
   ```
   https://your-app-name.netlify.app/api/auth/callback/google
   ```

### GitHub OAuth
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Edit your OAuth App
3. Update **Authorization callback URL**:
   ```
   https://your-app-name.netlify.app/api/auth/callback/github
   ```

### Stripe Webhooks
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add new endpoint:
   ```
   https://your-app-name.netlify.app/api/webhooks/stripe
   ```
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy webhook signing secret to `STRIPE_WEBHOOK_SECRET` in Netlify

## Step 8: Verify Deployment

### Check Build Logs

1. Go to **Deploys** in Netlify dashboard
2. Click on latest deploy
3. Check **Deploy log** for errors

### Common Build Errors

#### "AUTH_SECRET is not defined"
- **Fix:** Add `AUTH_SECRET` to environment variables in Netlify

#### "DATABASE_URL is not defined"
- **Fix:** Add `DATABASE_URL` to environment variables in Netlify

#### "Module not found: Can't resolve 'ws'"
- **Fix:** Already handled by lazy Prisma initialization in `db/prisma.ts`

#### Prisma Client not generated
- **Fix:** Ensure `postinstall` script runs: `"postinstall": "prisma generate"` in `package.json`

### Test Your Application

1. Visit your Netlify URL: `https://your-app-name.netlify.app`
2. Try signing in with test credentials:
   - Email: `admin@example.com`
   - Password: `12345678`
3. Verify authentication works
4. Test OAuth providers (if configured)

## Step 9: Set Up Custom Domain (Optional)

1. Go to **Domain settings** in Netlify
2. Click **Add custom domain**
3. Follow DNS configuration instructions
4. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_SERVER_URL` with new domain

## Troubleshooting

### Login fails with "server configuration" error

**Cause:** Missing `AUTH_SECRET` or `NEXTAUTH_URL`

**Fix:**
1. Go to Netlify environment variables
2. Verify `AUTH_SECRET` is set (generate with `npx auth secret`)
3. Verify `NEXTAUTH_URL` matches your Netlify URL
4. Redeploy after adding variables

### Database connection fails

**Cause:** Missing or invalid `DATABASE_URL`

**Fix:**
1. Verify `DATABASE_URL` in Netlify environment variables
2. Ensure Neon database is accessible from Netlify (check IP allowlist)
3. Test connection string format: `postgres://user:pass@host/db?sslmode=require`

### OAuth redirect errors

**Cause:** Callback URLs not configured in OAuth provider

**Fix:**
1. Update callback URLs in Google/GitHub settings (see Step 7)
2. Ensure URLs match exactly (https, not http)
3. Verify `NEXTAUTH_URL` is set correctly

### Build timeouts

**Cause:** Large dependencies or slow database connection during build

**Fix:**
1. Optimize `node_modules` (remove unused dependencies)
2. Use caching (Netlify caches by default)
3. Increase build timeout in Netlify settings

## Maintenance

### Updating Environment Variables

After changing environment variables:
1. Click **Save** in Netlify
2. Click **Trigger deploy** to rebuild with new variables

### Redeploying

Push to your GitHub repository or click **Trigger deploy** in Netlify.

### Monitoring

- Check **Functions** tab for serverless function logs
- Use **Analytics** for traffic monitoring
- Set up alerts for deploy failures

## Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use `.env.example` as template
3. ✅ Rotate `AUTH_SECRET` regularly
4. ✅ Use test mode for Stripe in non-production environments
5. ✅ Enable branch deploys for testing before production
6. ✅ Set up deploy notifications (email/Slack)

## Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Next.js on Netlify](https://docs.netlify.com/frameworks/next-js/overview/)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Neon Documentation](https://neon.tech/docs)

---

**Last Updated:** January 2025  
**Version:** Next.js 15.1.7, NextAuth v5
