# LinkShrink Deployment to Vercel

Complete step-by-step guide to deploy LinkShrink to production using Vercel.

## Prerequisites

- GitHub account with repository push access
- Supabase account (free tier ok)
- Vercel account (free)
- Code committed to GitHub

## Step 1: Prepare Your Repository

```bash
# Ensure code is committed
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

## Step 2: Create Vercel Account & Import Project

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub account (recommended)
3. Click "Import Project"
4. Select your LinkShrink repository
5. Vercel will auto-detect Next.js configuration

## Step 3: Configure Environment Variables in Vercel

In Vercel dashboard → Project Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=generate_with: openssl rand -base64 32
NEXTAUTH_URL=https://your-domain.vercel.app (for staging)
GOOGLE_ID=your_google_oauth_id (if using)
GOOGLE_SECRET=your_google_oauth_secret (if using)
NEXT_PUBLIC_SHORT_URL_BASE=https://your-domain.vercel.app
```

### Where to Find These Values

**Supabase credentials:**
1. Go to Supabase project settings
2. Copy URL from "Project URL"
3. Copy keys from "API" section

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
# OR use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Deploy

1. Click "Deploy" button
2. Vercel will:
   - Run `npm install`
   - Run `npm run build`
   - Deploy to edge network
   
Your app will be live at: `https://your-project-name.vercel.app`

## Step 5: Verify Deployment

Test the deployed app:
- ✅ Visit landing page
- ✅ Test sign up / sign in
- ✅ Test link creation
- ✅ Test redirect (short link)
- ✅ Test analytics
- ✅ Test API keys

## Step 6: Set Up Custom Domain (Optional)

1. In Vercel dashboard → Domains
2. Click "Add Domain"
3. Enter your domain (e.g., link.shrink)
4. Follow DNS setup instructions
5. Wait 24-48 hours for propagation

### Update NEXTAUTH_URL and NEXT_PUBLIC_SHORT_URL_BASE

Once domain is active, update environment variables:
```
NEXTAUTH_URL=https://link.shrink
NEXT_PUBLIC_SHORT_URL_BASE=https://link.shrink
```

## Step 7: Configure Automatic Deployments

By default, Vercel auto-deploys on push to main branch.

### Preview Deployments
- Pull requests get automatic preview URLs
- Test changes before merging
- Great for collaboration

### Production Branch
- Only main branch deploys to production
- Other branches get preview deployments

## Step 8: Monitoring & Analytics

### Enable Vercel Analytics
1. Dashboard → Project Settings → Analytics
2. Enable Web Analytics
3. Monitor Core Web Vitals

### Monitor Error Logs
1. Dashboard → Deployments → Recent
2. Click deployment to see build logs
3. Check real-time logs for errors

## Step 9: Set Up Alerts & Monitoring

### Error Tracking
Vercel includes basic error tracking. For more:

1. **Sentry** (recommended for errors):
   - Create account at sentry.io
   - Add Sentry to Next.js

2. **LogRocket** (for session replay):
   - Add LogRocket SDK
   - Debug user issues

## Step 10: Database Backups

### Supabase Backups
Supabase automatically backs up daily.

To ensure safety:
1. Go to Supabase project settings
2. Enable "Backup" (Pro plan includes full backups)
3. Configure retention policy

### Export Data
```bash
# Use Supabase CLI to export
supabase db pull
```

## Rollback & Updates

### Rollback to Previous Deployment
1. Dashboard → Deployments
2. Find previous working deployment
3. Click three dots → Promote to Production
4. Vercel will instantly revert

### Deploy Updates
```bash
# Make changes locally
git commit -m "feat: update feature"
git push origin main  # Auto-deploys!
```

## Troubleshooting

### Build Fails
```bash
# Check build logs in Vercel dashboard
# Common issues:
# - Missing env var: Check "Environment Variables" section
# - TypeScript errors: Run `npm run build` locally first
# - Missing dependency: Run `npm install` locally
```

### Deployment Hangs
- Check Vercel status page
- Try canceling and redeploying
- Check GitHub branch status

### Environment Variables Not Loading
1. Verify all variables are set in Vercel dashboard
2. Trigger manual deployment (Settings → Deployment Trigger)
3. Check variable names have no extra spaces

### Database Connection Issues
```bash
# Test local connection first
npm run dev

# Then verify in Vercel logs
# Check: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
```

## Performance Optimization

### Monitor Performance
1. Use Vercel Analytics dashboard
2. Check Core Web Vitals
3. Monitor API response times

### Optimize Images
Images should be optimized automatically by Next.js Image component.

### Cache Strategy
Vercel handles caching automatically. To customize:
- Add cache headers in `next.config.ts`
- Configure ISR (Incremental Static Regeneration)

## Security Checklist

- [ ] All environment variables are secure (no defaults)
- [ ] Database is behind Supabase RLS policies
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] OAuth secrets are stored only in Vercel env
- [ ] Database backups are configured
- [ ] Monitor for suspicious activity

## Cost Monitoring

### Free Tier Includes
- Unlimited deployments
- 100 GB bandwidth/month (generous!)
- Automatic scaling
- HTTPS

### When to Upgrade
- If exceeding 100 GB bandwidth (~1M links/month)
- Need priority support
- Need advanced analytics

Check costs at: Dashboard → Settings → Billing

## Production Checklist

Before going live:
- [ ] Build passes locally: `npm run build`
- [ ] Tests pass: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] OAuth configured (if using)
- [ ] Custom domain ready
- [ ] Email configured (if notifications enabled)
- [ ] Analytics connected
- [ ] Error tracking set up
- [ ] Database backups enabled

## Next Steps

1. ✅ Follow steps 1-5 above
2. Test thoroughly on staging
3. Add custom domain
4. Monitor for first week
5. Collect user feedback
6. Iterate and improve

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- NextAuth Docs: https://next-auth.js.org

---

**Estimated deployment time: 15-20 minutes**

Go to [Vercel Dashboard](https://vercel.com/dashboard) to get started!
