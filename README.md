# BharatOS

An AI-powered civic companion that helps citizens access government services, report public issues, and get personalized assistance.

## What it does

Instead of searching through confusing government websites, you tell BharatOS what you want to achieve. It creates a step-by-step plan (called a Journey) with all the tasks you need to complete.

**Examples:**
- "I want to start a dairy business" -> Creates a journey with steps like MSME registration, Mudra loan, cattle insurance
- "I need a passport" -> Shows document checklist, application steps, police verification process
- "What schemes am I eligible for?" -> Checks your profile and shows benefits worth up to Rs X lakh

## Features

- **Goal-based Journey Planning** - Tell the AI what you want to do, it builds the plan
- **Document Intelligence** - Upload documents, AI validates them and flags issues
- **Opportunity Finder** - Finds government schemes you qualify for with estimated benefits
- **Civic Issue Reporting** - Report problems like potholes, water issues, track resolution
- **Multilingual Support** - Works in Indian languages (AI detects and responds in your language)
- **No Login Required** - Session-based, privacy-first approach

## Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes, Server Actions
- **Database:** SQLite via Prisma ORM
- **AI:** Google Gemini 2.0 Flash
- **Deployment:** Vercel

## How to Run (Local Development)

1. Clone the repo
2. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`
3. Run `npm install`
4. Run `npx prisma generate`
5. Run `npx prisma migrate dev`
6. Run `npm run dev`
7. Open http://localhost:3000

## Deploy to Production

### Option 1: Vercel + Neon Postgres (Recommended)

1. Push the code to your GitHub repository
2. Create a free account on [Neon](https://neon.tech) and create a Postgres database
3. Get your `DATABASE_URL` from Neon dashboard
4. Go to [Vercel](https://vercel.com) and import your GitHub repo
5. Add these environment variables in Vercel:
   - `DATABASE_URL` - your Neon Postgres connection string
   - `GEMINI_API_KEY` - your Google Gemini API key
6. Deploy

### Option 2: Any Node.js Hosting (SQLite)

If your hosting platform supports persistent storage, you can use SQLite:
1. Set `DATABASE_URL=file:./data.db` in environment
2. Run `npm run build` and `npm start`

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Database connection string (`file:./dev.db` for SQLite, or Postgres URL for production) |
| `GEMINI_API_KEY` | Your Google Gemini API key |

## Running Tests

```bash
npm test            # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright) - requires dev server running
```

## Project Structure

```
src/
  app/           # Pages and API routes
  components/    # Reusable UI components
  lib/           # AI client, prompts, DB helpers, schemas
prisma/          # Database schema and migrations
```

## How the AI works

1. User types a goal
2. AI classifies the intent (journey, document, complaint, schemes, general)
3. For journeys: AI checks if enough info exists, asks clarifying questions if needed
4. AI generates a structured journey plan with ordered tasks
5. User can track progress, upload documents, mark tasks complete
6. AI finds eligible schemes based on profile data
