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

## How to Run

1. Clone the repo
2. Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`
3. Run `npm install`
4. Run `npx prisma migrate dev`
5. Run `npm run dev`
6. Open http://localhost:3000

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | SQLite database path (default: `file:./dev.db`) |
| `GEMINI_API_KEY` | Your Google Gemini API key |

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
