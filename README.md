# LinkShrink - Modern URL Shortener

A full-stack URL shortening application built with Next.js 16, TypeScript, and Supabase. Create, manage, and track shortened URLs with detailed analytics.

## Features

- 🔗 **URL Shortening** - Create short, memorable links instantly
- 📊 **Analytics** - Track clicks, devices, referrers, and geographic data
- 🎯 **Custom Aliases** - Create branded short links (e.g., `link.shrink/my-campaign`)
- 🏷️ **Tag Organization** - Organize links with custom tags
- 🔐 **QR Codes** - Auto-generate QR codes for every link
- 🔑 **API Keys** - Full API access for developers
- 🔒 **Security** - Enterprise-grade security with Row-Level Security
- 📱 **Responsive Design** - Works perfectly on mobile and desktop
- 🌙 **Dark Mode** - Beautiful dark theme out of the box

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, PostgreSQL
- **Database**: Supabase (PostgreSQL with RLS)
- **Authentication**: NextAuth.js with OAuth support
- **Deployment**: Vercel (recommended)
- **Testing**: Vitest, React Testing Library
- **Type Safety**: TypeScript, Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free tier available)

### Local Development

1. **Clone and install**
```bash
git clone <repository>
cd linkshrink
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
```

3. **Run development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

Required variables (see `.env.example`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=secure_random_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_SHORT_URL_BASE=http://localhost:3000
```

## Development

### Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Create production build
npm run start       # Start production server
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run lint        # Check code quality
npm run type-check  # TypeScript type checking
```

### Project Structure

```
linkshrink/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── [shortCode]/       # Redirect handler
├── components/
│   └── ui/                # Reusable UI components
├── lib/
│   ├── auth.ts            # Auth configuration
│   ├── supabase.ts        # Database client
│   ├── types.ts           # TypeScript types
│   ├── validation.ts      # Input validation
│   └── utils.ts           # Utility functions
├── __tests__/             # Test files
├── public/                # Static assets
└── _archive/              # Archived development files
```

## Deployment

### Quick Start (Recommended: Vercel)

See [DEPLOYMENT_VERCEL.md](./DEPLOYMENT_VERCEL.md) for complete step-by-step deployment guide.

**TL;DR:**
1. Push code to GitHub
2. Import in Vercel dashboard
3. Add environment variables
4. Deploy (auto-deploys on push)
5. Optional: Connect custom domain

**Estimated time: 15 minutes**

### Hosting Analysis

For detailed comparison of hosting options (Vercel, Railway, DigitalOcean, AWS):
See `_archive/dev-tools/HOSTING_ANALYSIS.md`

**Recommendation**: Vercel + Supabase ($0-26/month)

### Docker Deployment

```bash
# Build image
docker build -t linkshrink .

# Run container
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=... \
  -e NEXTAUTH_SECRET=... \
  linkshrink
```

## Database Setup

Database schema is initialized automatically via Supabase.

To manually initialize or reset:
1. Go to Supabase SQL Editor
2. Run queries from `_archive/db-scripts/supabase-setup.sql`
3. Verify with `_archive/db-scripts/verify-database.sql`

## Testing

```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage
```

## Code Quality

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Format code (configured in ESLint)
npm run lint -- --fix
```

## API Documentation

### Public Endpoints

- `GET /:shortCode` - Redirect to original URL
- `POST /api/links` - Create new short link (requires auth)
- `GET /api/analytics` - Get analytics summary (requires auth)

### Protected Endpoints

All `/api/*` endpoints except public redirects require authentication.

See `app/api/` for complete API documentation.

## Security

- ✅ Row-Level Security (RLS) on all database tables
- ✅ NextAuth for secure authentication
- ✅ HTTPS in production
- ✅ Environment variables never committed
- ✅ API keys securely hashed
- ✅ CSRF protection
- ✅ Regular dependency updates

## Performance

- ⚡ ~100ms Time to First Byte (Vercel edge)
- 📦 Optimized bundle size (~200KB gzipped)
- 🖼️ Image optimization with Next.js Image
- 🔄 Incremental Static Regeneration for pages
- 💾 Server-side caching strategies

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## License

This project is open source and available under the MIT License.
