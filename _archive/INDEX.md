# Archive Directory

This folder contains archived development files and historical references. These are not needed for production but are preserved for:
- Historical documentation
- Reference materials
- Setup scripts for reinitializing database
- Development tools

## Contents

### `docs/`
**Archived Documentation**
- `AGENTS.md` - Copilot agent configuration
- `CLAUDE.md` - References to AGENTS
- `DEPLOYMENT.md` - Old deployment guide (see DEPLOYMENT_VERCEL.md in root)
- `PROJECT_SUMMARY.md` - Development history and summary

### `db-scripts/`
**Database Setup & Verification**
- `supabase-setup.sql` - Complete schema setup (kept for reference/reinitializing)
- `verify-database.sql` - Database verification queries

### `dev-tools/`
**Development Tools & Analysis**
- `HOSTING_ANALYSIS.md` - Hosting platform comparison (Vercel recommended)
- `README.md` - Dev tools reference

### `.github/prompts/ui-ux-pro-max/`
**Design System Tools** (archived but files remain in `.github` for reference)
- Design system generator scripts
- UI/UX data and guidelines
- Framework-specific styling rules

## When to Use Archive Files

✅ **Use archived files for:**
- Reference when resetting database
- Understanding development decisions
- Reviewing historical design process
- Reinitializing from scratch

❌ **Don't use for:**
- Current deployment (see DEPLOYMENT_VERCEL.md)
- Production decisions
- Current development

## Current Production Files

See root directory for:
- `DEPLOYMENT_VERCEL.md` - Current deployment guide
- `README.md` - Main project documentation
- `.env.example` - Environment template
- `Dockerfile` - Production containerization

## Migration Notes

**Original files moved from root:**
- `AGENTS.md` → `_archive/docs/AGENTS.md`
- `CLAUDE.md` → `_archive/docs/CLAUDE.md`
- `DEPLOYMENT.md` → `_archive/docs/DEPLOYMENT.md` (superseded by DEPLOYMENT_VERCEL.md)
- `PROJECT_SUMMARY.md` → `_archive/docs/PROJECT_SUMMARY.md`
- `supabase-setup.sql` → `_archive/db-scripts/supabase-setup.sql`
- `verify-database.sql` → `_archive/db-scripts/verify-database.sql`

**Kept in root:**
- `.github/prompts/ui-ux-pro-max/` - For design inspiration (not archived)

## Archive Maintenance

- Archive folder is versioned in Git
- Provides full project history
- Can be referenced for troubleshooting
- Consider removing if repo size becomes an issue

Last updated: 2026-05-02
