# LinkShrink - Deployment Guide (ARCHIVED)

This file has been archived. For current deployment information, see README.md and Dockerfile.

## Quick Reference

### Deployment Options
1. **Vercel** (Recommended) - See hosting-analysis.md
2. **Docker** - Use Dockerfile in root
3. **Traditional Server** - Use pm2 + nginx

### Environment Variables
See .env.example for all required variables.

### Pre-Deployment
- Run `npm run build`
- Run `npm run test`
- Verify all env vars set
- Database initialized with supabase-setup.sql

For full deployment guide, see the original DEPLOYMENT.md in _archive/docs/
