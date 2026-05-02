# LinkShrink - Deployment Guide

## Prerequisites

Before deploying LinkShrink, ensure you have:

- Node.js 18+ installed
- A Supabase account (PostgreSQL database)
- NextAuth.js configured with OAuth providers (optional)
- Environment variables configured
- Docker (for containerized deployment)

## Environment Setup

### 1. Create `.env.local` file

Copy the `.env.example` file and update with your values:

```bash
cp .env.example .env.local
```

### 2. Required Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_SECRET=generate_with: `openssl rand -base64 32`
NEXTAUTH_URL=http://localhost:3000

# OAuth Providers (Optional)
GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret

# Short URL Base
NEXT_PUBLIC_SHORT_URL_BASE=https://link.shrink
```

## Database Setup

### 1. Initialize Supabase Database

```bash
# Execute the SQL schema in your Supabase SQL editor
# File: supabase-setup.sql
```

### 2. Verify Tables

Run this query to verify all tables are created:

```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

Should return:
- users
- links
- tags
- analytics
- api_keys
- preferences

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

### 3. Run Tests

```bash
npm run test           # Run all tests
npm run test:watch     # Watch mode
```

### 4. Linting

```bash
npm run lint
```

## Building for Production

### 1. Create Production Build

```bash
npm run build
```

### 2. Test Production Build Locally

```bash
npm start
```

### 3. Verify Build

- Check `/dist` folder is created
- No TypeScript errors
- No ESLint errors

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

```bash
git push origin main
```

### Option 2: Docker Deployment

```bash
# Build image
docker build -t linkshrink .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_url \
  -e NEXTAUTH_SECRET=your_secret \
  linkshrink
```

### Option 3: Traditional Server

1. Build the app: `npm run build`
2. Transfer to server: `scp -r . your-server:/app`
3. Install on server: `npm install --production`
4. Set up PM2: `pm2 start npm -- start`
5. Configure reverse proxy (Nginx)

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database initialized and tables verified
- [ ] Tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] Build completes without errors: `npm run build`
- [ ] OAuth credentials configured (if using)
- [ ] NEXTAUTH_SECRET is secure and random
- [ ] Database backups configured
- [ ] SSL certificate configured (if using custom domain)
- [ ] Monitoring and error tracking setup

## Post-Deployment

### 1. Verify Deployment

- Test sign up/sign in
- Test link creation and redirect
- Test analytics tracking
- Monitor error logs

### 2. Monitor Performance

- Check server logs
- Monitor database performance
- Set up alerts for errors
- Monitor API response times

### 3. Backup Strategy

- Daily automated database backups
- Weekly full system backups
- Test restore procedures monthly

## Scaling Considerations

- **Database**: Consider connection pooling with PgBouncer for high traffic
- **Cache**: Add Redis for session caching
- **CDN**: Use Cloudflare for static assets
- **Analytics**: Consider archiving old analytics data

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Error

```bash
# Verify connection string
psql $DATABASE_URL -c "SELECT version();"
```

### Environment Variables Not Loading

- Restart dev server: `Ctrl+C` and `npm run dev`
- Verify `.env.local` is not in `.gitignore`
- Check variable names match exactly

## Support

For deployment issues:
1. Check logs: `pm2 logs linkshrink`
2. Verify environment variables: `printenv | grep NEXT`
3. Test database connection
4. Review error tracking service

## Security

- Never commit `.env.local`
- Rotate secrets regularly
- Use HTTPS in production
- Enable rate limiting
- Monitor for suspicious activity
- Keep dependencies updated: `npm audit`
