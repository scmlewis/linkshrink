# Graph Report - .  (2026-05-04)

## Corpus Check
- Corpus is ~29,673 words - fits in a single context window. You may not need a graph.

## Summary
- 173 nodes · 209 edges · 21 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]

## God Nodes (most connected - your core abstractions)

## Surprising Connections (you probably didn't know these)
- `API Keys API Route` --uses_crypto_from--> `TypeScript`  [EXTRACTED]
   →   _Bridges community 3 → community 2_
- `LinkShrink` --uses--> `TypeScript`  [EXTRACTED]
   →   _Bridges community 3 → community 0_
- `LinkShrink` --uses for database--> `Supabase`  [EXTRACTED]
   →   _Bridges community 2 → community 0_
- `Dashboard Home` --renders--> `Button Component`  [EXTRACTED]
   →   _Bridges community 1 → community 9_
- `Dashboard Home` --uses utility functions--> `Utilities Library`  [EXTRACTED]
   →   _Bridges community 1 → community 7_

## Hyperedges (group relationships)
- **Authentication Flow** — session-provider, next-auth, signup-route, account-route, users-table [INFERRED]
- **Styling Pipeline** — tailwind-css, postcss, postcss-config, tailwind-config [INFERRED]
- **API Key Management** — api-keys-route, api-keys-table, users-table [INFERRED]
- **Data Persistence Layer** — supabase, users-table, links-table, tags-table, analytics-table, api-keys-table [INFERRED]
- **Authentication Flow** —  [INFERRED]
- **Dashboard Section** —  [INFERRED]
- **Link Management API** —  [INFERRED]
- **Analytics System** —  [INFERRED]
- **Link Redirect System** —  [INFERRED]
- **Link Analytics System** — db_users_table, db_links_table, db_analytics_table [INFERRED]
- **Form Management System** — lib_useForm, lib_validation, test_useForm, test_validation [INFERRED]
- **API Route Test Suite** — test_account_route, test_api_keys_route, test_user_route, test_export_route, test_preferences_route [INFERRED]
- **Deployment Pipeline** — deployment_local, deployment_vercel, db_schema [INFERRED]
- **Tech Stack** — nextjs, react, typescript, tailwind, supabase, postgresql, nextauth, vercel [INFERRED]
- **Core Features** — url_shortening, analytics, custom_aliases, tag_org, qr_codes, api_keys, dark_mode, responsive [INFERRED]
- **Testing Infrastructure** — vitest, testing_lib, github_actions [INFERRED]
- **Deployment Options** — vercel, railway, aws, digitalocean, cloudflare [INFERRED]
- **Documentation Set** — readme, deploy_vercel, quick_start, housekeeping, hosting_analysis, proj_summary [INFERRED]
- **Containerization** — docker, docker_compose, dockerfile [INFERRED]
- **UI Component System** — badge_component, button_component, card_component, checkbox_component, divider_component, input_component, modal_component, select_component, textarea_component, spinner_component, skeleton_component, toast_component, error_boundary_component, error_page_component, ui_index [INFERRED]
- **Form Management** — form_field_component, input_component, textarea_component, select_component, validation_module, use_form_hook [INFERRED]
- **Backend Services** — supabase_module, auth_module, links_module, analytics_module, types_module [INFERRED]
- **URL Processing** — shortener_module, links_module [INFERRED]

## Communities (21 total, 10 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.0
Nodes (28): Analytics System, API Key Management, API Layer, _archive/INDEX.md, Authentication System, Component Library, Custom Aliases, Dark Mode Theme (+20 more)

### Community 1 - "Community 1"
Cohesion: 0.0
Nodes (28): createLink(), deleteLink(), getLink(), getLinkByShortCode(), getUserLinks(), incrementClickCount(), recordClick(), updateLink() (+20 more)

### Community 2 - "Community 2"
Cohesion: 0.0
Nodes (19): Account API Route, Analytics API Route, Analytics Database Table, API Keys API Route, API Keys Database Table, Docker, docker-compose.yml, Dockerfile (+11 more)

### Community 3 - "Community 3"
Cohesion: 0.0
Nodes (16): Error Boundary, ESLint Configuration, Root Layout Component, Next.js Configuration, Next.js Type Definitions, Next.js Framework, Next.js 16, Home Page (+8 more)

### Community 4 - "Community 4"
Cohesion: 0.0
Nodes (16): Badge, Button, Card, Checkbox, Divider, ErrorBoundary, ErrorPage, FormField (+8 more)

### Community 5 - "Community 5"
Cohesion: 0.0
Nodes (14): Analytics Table, API Keys Table, Links Table, Preferences Table, Database Schema, Tags Table, Users Table, Database Verification (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.0
Nodes (10): useForm Hook, Validation Module, useForm Tests, Validation Tests, Email Validator, Max Length Validator, Min Length Validator, Password Validator (+2 more)

### Community 7 - "Community 7"
Cohesion: 0.0
Nodes (9): Vercel Deployment, Utilities Library, buildShortUrl Tests, Utils Tests, buildShortUrl Function, copyToClipboard Function, formatDate Function, formatNumber Function (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.0
Nodes (9): analytics, auth, links, shortener, supabase, types, useForm, utils (+1 more)

### Community 9 - "Community 9"
Cohesion: 0.0
Nodes (7): Button Component, useForm Hook, Analytics Page, AuthError Page, SignIn Page, SignUp Page, next-auth

### Community 10 - "Community 10"
Cohesion: 0.0
Nodes (5): AWS, Cloudflare Pages, DigitalOcean, HOSTING_ANALYSIS.md, Railway

## Knowledge Gaps
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.