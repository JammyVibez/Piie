# P!!E Social Media Platform

## Overview
P!!E is a social media platform with features including user registration, login, onboarding, posts, fusion posts (collaborative content), rooms, communities, and real-time interactions.

## Tech Stack
- **Framework**: Next.js 16 with App Router
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **Authentication**: JWT tokens with bcrypt password hashing

## Project Structure
```
p!!e/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── posts/         # Post CRUD operations
│   │   ├── fusion/        # Fusion post operations
│   │   ├── users/         # User profile and follow operations
│   │   ├── bookmarks/     # Bookmark management
│   │   ├── notifications/ # Notification system
│   │   └── search/        # Search functionality
│   └── auth/              # Auth pages (login, register, onboarding)
├── components/            # React components
├── lib/                   # Utility functions
│   ├── prisma.ts         # Prisma client
│   └── auth.ts           # JWT authentication helpers
├── prisma/               # Database schema
└── public/               # Static assets
```

## Recent Changes (December 2025)

### Extended Platform Features
- **Gamification System**: Added XP events, challenges, achievements, badges, leaderboard seasons, and challenge progress tracking
- **Audio Rooms**: Implemented community voice chat with participant management (join, leave, mute, raise hand, speaker roles)
- **Community Features**: Full posts, comments, likes, threads, and real-time chat within communities
- **Dual Storage Strategy**: Supabase Storage as primary with automatic Cloudinary fallback when quota is exceeded
- **Real-time Subscriptions**: Supabase Realtime for live messaging, community updates, and notifications
- **Enhanced Settings**: Password change, account deletion, user preferences, and system settings APIs

### New API Routes
- `/api/audio-rooms/*` - Audio room creation, joining, leaving, participant management
- `/api/communities/[id]/posts/*` - Community posts with likes and comments
- `/api/communities/[id]/threads/*` - Discussion threads with likes and shares
- `/api/communities/[id]/chat` - Real-time community chat
- `/api/challenges` - Challenge management with progress tracking
- `/api/onboarding` - User onboarding flow with role selection
- `/api/settings/user` - User notification and privacy preferences
- `/api/settings/system` - System-wide configuration (storage provider, etc.)
- `/api/settings/password` - Password change functionality
- `/api/settings/account/delete` - Account deletion

### New Services
- `lib/storage-service.ts` - Dual storage (Supabase + Cloudinary) with automatic fallback
- `lib/realtime/subscriptions.ts` - Supabase Realtime manager for live updates
- `lib/gamification/xp-service.ts` - XP calculation, level progression, achievement tracking
- `lib/gamification/leaderboard-service.ts` - Global and seasonal leaderboard rankings
- `hooks/use-realtime.tsx` - React hooks for real-time subscriptions

### Previous Updates
- Replaced all mock data with real Prisma database operations
- Implemented JWT authentication across all protected API routes
- Updated frontend components to use API calls with auth headers
- Fixed FusionPostCard component to handle undefined content
- Created user search API for finding users by name/username/email
- Fixed bookmark API to properly save/delete bookmarks in database
- Created reports API for content moderation
- Updated settings page to save profile changes to database
- All social interactions (like, comment, follow, share, repost, bookmark, report) now save to PostgreSQL

## API Authentication
All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

Tokens are stored in localStorage as `auth_token` after login.

## Database Configuration
- Uses Prisma 7 with configuration in `prisma.config.ts`
- `DATABASE_URL` for runtime queries
- `DIRECT_URL` for migrations
- Schema defined in `schema.prisma` with 50+ tables

## Running the Project
```bash
cd p!!e && npm run dev -- -p 5000 -H 0.0.0.0
```

## Database Setup
The project uses Prisma 7 with PostgreSQL. To set up the database:
```bash
cd p!!e
npx prisma generate  # Generate Prisma client
npx prisma db push   # Push schema to database
```

## Known Issues
- Story carousel and some UI components use placeholder image paths that return 404s
- WebSocket HMR warnings in development (doesn't affect functionality)

## Key Features
- **Posts**: Create, read, update, delete with pagination
- **Fusion Posts**: Collaborative layered content creation
- **User Profiles**: Follow/unfollow, badges, achievements
- **Bookmarks**: Save posts to collections
- **Notifications**: Real-time notification system
- **Search**: Full-text search across posts, users, communities
- **Communities**: Group-based content sharing
