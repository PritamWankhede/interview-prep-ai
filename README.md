# InterviewPrep AI

An AI-powered interview preparation platform built with Next.js 16. Practice real interview questions, get instant AI feedback on your answers, follow a personalized 7-day study plan, and track your progress.

**Live Demo:** [interview-prep-ai-blush-iota.vercel.app](https://interview-prep-ai-blush-iota.vercel.app)

**Built by:** [Pritam Wankhede](https://github.com/PritamWankhede) · [LinkedIn](https://www.linkedin.com/in/pritamwankhede/)

---

## Features

- **AI Interview Coach** — Groq-powered evaluation scoring clarity, depth, and technical accuracy
- **Personalized Study Plan** — AI-generated 7-day roadmap based on your weak areas
- **Question Bank** — 18+ curated questions across DSA, System Design, Frontend, Backend, Database, Behavioral
- **Progress Tracking** — Streaks, weekly charts, category performance breakdown
- **Authentication** — Email/password + Google OAuth via NextAuth v5
- **Redis Caching** — Upstash Redis for question lists, AI feedback, dashboard stats
- **Rate Limiting** — 5 AI calls/min per user, 10 auth attempts/15min per IP
- **Admin Panel** — Full CRUD for question bank management
- **Role-based Access** — USER and ADMIN roles with route protection

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | PostgreSQL via Neon (serverless) |
| ORM | Prisma v6 |
| Auth | NextAuth v5 beta |
| Cache | Upstash Redis |
| AI | Vercel AI SDK + Groq (GPT OSS 20B) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Deployment | Vercel + GitHub Actions CI |

## Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL database (Neon recommended)
- Upstash Redis account
- Groq API key
- Google OAuth credentials

### Installation

```bash
# Clone the repo
git clone https://github.com/PritamWankhede/interview-prep-ai.git
cd interview-prep-ai

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Fill in your credentials in .env.local

# Run database migrations
npx prisma migrate dev

# Seed question bank
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

See `.env.example` for all required variables:

```env
DATABASE_URL=             # Neon PostgreSQL connection string
NEXTAUTH_SECRET=          # Random secret (openssl rand -base64 32)
NEXTAUTH_URL=             # http://localhost:3000
GOOGLE_CLIENT_ID=         # Google OAuth client ID
GOOGLE_CLIENT_SECRET=     # Google OAuth client secret
UPSTASH_REDIS_REST_URL=   # Upstash Redis URL
UPSTASH_REDIS_REST_TOKEN= # Upstash Redis token
GROQ_API_KEY=             # Groq API key
```

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── (dashboard)/     # Dashboard, Practice, Sessions, Profile
│   ├── (admin)/         # Admin question management
│   └── api/             # REST API routes
├── components/
│   ├── auth/            # Login/Register forms
│   ├── dashboard/       # Stats, charts, study plan
│   ├── practice/        # Question cards, answer editor, feedback
│   ├── admin/           # Admin CRUD components
│   └── shared/          # Navbar, Footer, SessionProvider
├── lib/
│   ├── auth.ts          # NextAuth config
│   ├── prisma.ts        # Prisma client singleton
│   ├── redis.ts         # Upstash Redis client
│   ├── cache.ts         # withCache wrapper + invalidation
│   ├── rate-limit.ts    # Redis rate limiter
│   └── cache-keys.ts    # Centralized cache key factory
└── types/               # TypeScript types
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run type-check   # TypeScript check
npm run lint         # ESLint
npm run format       # Prettier format
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Seed question bank
npm run db:studio    # Open Prisma Studio
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens stored in HTTP-only cookies
- Rate limiting on auth (10/15min) and AI (5/min) endpoints
- Input validation with Zod on all API routes
- Soft delete for questions (never hard delete)
- Timing-attack resistant credential checking
