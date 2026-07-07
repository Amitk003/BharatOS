# BharatOS - Final Product Requirements Document

## What We Are Building

BharatOS is a web platform that helps Indian citizens interact with government services. Instead of a chatbot that answers questions, BharatOS builds step-by-step "Civic Journeys" for real-life goals like starting a business, applying for a passport, or finding government schemes.

---

## Core Philosophy

```
Other apps: Question -> Answer
BharatOS:    Goal -> Journey -> Tasks -> Tracking -> Completion
```

We do not answer questions. We own outcomes.

---

## Target Users

- Rural citizens who need help navigating government services
- Small business owners looking for schemes and loans
- Senior citizens needing pension and health services
- Students needing education-related documents
- Any citizen who finds government portals confusing

---

## Features (Scoped for Hackathon)

### Feature 1: Goal Understanding + Journey Planner (P0)

User types a goal like "I want to start a dairy business". The AI:
1. Classifies the intent
2. Asks clarifying questions (location, land, income)
3. Generates a multi-step journey with ordered tasks
4. Shows progress as tasks are completed

### Feature 2: Document Intelligence (P0)

User uploads a document (Aadhaar, PAN, etc.). The AI:
1. Extracts text and fields from the document image
2. Validates against the citizen profile
3. Flags mismatches, expiry, or unreadable sections
4. Stores validation result

### Feature 3: Opportunity Finder (P0)

Based on citizen profile, the AI:
1. Scans available schemes
2. Calculates eligibility
3. Shows estimated total benefits in rupees
4. Links to relevant journey steps

### Feature 4: Multilingual Support (P1)

- User can type in Hindi, Tamil, Bengali, etc.
- AI detects language and responds in same language
- Internal processing stays in English for accuracy

### Feature 5: Complaint Tracker (P2)

- User can report civic issues (pothole, water, electricity)
- Creates a case with timeline
- Tracks status: Submitted -> Assigned -> Resolved

---

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js (App Router) + Tailwind CSS | Single repo, fast development, easy deploy |
| Backend | Next.js API Routes + Server Actions | No separate backend needed |
| Database | SQLite (dev) / PostgreSQL (prod) via Prisma | Relational, simple, reliable |
| AI | Gemini 2.5 Flash (Google AI SDK) | Fast, cheap, multimodal, structured outputs |
| UI Library | shadcn/ui | Clean components, accessible |
| Deployment | Vercel | 1-click from GitHub |
| Testing | Vitest + Playwright | Unit + E2E coverage |

---

## Database Schema (Simplified)

```
User
  - id, name, phone, createdAt

CitizenProfile (one-to-one with User)
  - age, occupation, income, education, disability
  - maritalStatus, locationState, hasLand
  - language, benefitsClaimed (JSON)

Journey (one-to-many with User)
  - title, description, status, progress

Task (one-to-many with Journey)
  - title, description, status, order
  - documentType (if task needs a document)

Document (one-to-many with User)
  - name, type, fileUrl, status
  - extractedData (JSON from AI)
  - errorDetails

CivicCase (one-to-many with User)
  - title, description, status, category
  - timeline (JSON array of events)
```

---

## AI Prompt Workflow

### Layer 1: System Instruction (fixed)

```
You are BharatOS, a civic AI assistant for Indian citizens.
Your job is to help users accomplish real-life goals by creating step-by-step plans called Journeys.
You do NOT give simple answers. You build actionable plans.
Always respond in the user's detected language.
```

### Layer 2: Intent Classification

```
Classify the user message into one of:
- JOURNEY_GOAL: User wants to accomplish something (start business, get passport, find schemes)
- DOCUMENT_QUERY: User asking about documents
- COMPLAINT: User wants to report an issue
- SCHEME_ELIGIBILITY: User asking what they qualify for
- GENERAL: Anything else
```

### Layer 3: Journey Generation (structured output)

```
Given user goal: "{goal}"
Given citizen profile: {profile JSON}

Generate a journey with tasks. Each task must have:
- title: string
- description: string
- order: number
- documentType: string | null

Return as valid JSON matching this schema:
{ "title": string, "tasks": [{ "title": string, "description": string, "order": number, "documentType": string | null }] }
```

### Layer 4: Document Validation (structured output)

```
Given document image and citizen profile:
Extract and validate. Return JSON:
{
  "documentType": string,
  "extractedFields": { "name": string, "dob": string, "number": string },
  "isValid": boolean,
  "issues": string[],
  "suggestions": string[]
}
```

### Layer 5: Opportunity Scan

```
Given citizen profile {profile JSON}:
Find government schemes this person likely qualifies for.
Return JSON:
{
  "schemes": [{ "name": string, "description": string, "estimatedBenefit": number, "eligibilityStatus": "ELIGIBLE" | "LIKELY" | "NEEDS_INFO" }],
  "totalEstimatedBenefit": number
}
```

---

## User Flow (Demo Script)

### Screen 1: Landing
- Clean hero section with search bar
- Text: "What do you want to achieve today?"

### Screen 2: Goal Input
- User types: "I want to start a dairy business in my village"
- AI asks: "Which state are you in? Do you own agricultural land?"
- User answers

### Screen 3: Journey Board
- AI generates a 6-step journey:
  1. Get Aadhaar updated (if needed)
  2. Open Jan Dhan account
  3. Apply for Mudra loan
  4. Register MSME/Udyam
  5. Apply for electricity subsidy
  6. Get cattle insurance
- Each task shows as a card with status badge

### Screen 4: Document Upload
- User clicks "Upload Aadhaar" task
- Uploads image
- AI validates: "Document verified. Name: Amit Kumar, DOB: 15/Jan/1995. All fields match your profile."
- Task marked complete

### Screen 5: Opportunity Dashboard
- Shows: "You qualify for 4 schemes worth up to Rs 4.2 lakh"
- Lists each scheme with estimated benefit

### Screen 6: Report Issue
- User: "There is a pothole on my street"
- Creates case with auto-filled location
- Shows timeline: Submitted -> Assigned to Municipal Corporation -> Resolved

---

## Testing Plan

### Unit Tests (Vitest)
- AI response parsers match Zod schemas
- Database CRUD operations work
- Journey progress calculation is correct

### E2E Test (Playwright)
- Full flow: type goal -> see journey -> upload document -> see dashboard
- Tests that UI renders correctly for all states (loading, empty, error)

### Contract Tests
- Every AI call validates response against a Zod schema
- Failing schema = automatic retry with fixed prompt

---

## Directory Structure

```
bharatos/
  app/
    page.tsx              # Landing page
    layout.tsx            # Root layout
    dashboard/
      page.tsx            # Dashboard
    journey/
      [id]/
        page.tsx          # Single journey view
    documents/
      page.tsx            # Document vault
    cases/
      page.tsx            # Case/complaint tracker
  components/
    ui/                   # shadcn components
    chat-bar.tsx          # Goal input component
    journey-board.tsx     # Journey task list
    document-upload.tsx   # Upload + validation
    opportunity-card.tsx  # Scheme eligibility card
    civic-score.tsx       # Health score meter
  lib/
    ai.ts                 # Gemini API client
    prompts.ts            # All prompt templates
    schemas.ts            # Zod schemas for AI output
    prisma.ts             # Database client
  prisma/
    schema.prisma         # Database schema
  __tests__/
    ai.test.ts            # AI response tests
    journey.test.ts       # Journey logic tests
```

---

## What We Are NOT Building (MVP)

- User authentication system (session-based guest mode only)
- Full graph database (relational tables with edges)
- Custom OCR pipeline (Gemini multimodal handles this)
- Background cron jobs (on-demand AI calls only)
- Mobile apps (responsive web only)
- Payment integration
- Real government API integration (simulated for demo)

---

## Success Metrics for Hackathon

- Demo runs without bugs for 5 minutes
- All 3 P0 features work end-to-end
- Multilingual support works for Hindi and English
- Tests pass (at least 5 unit + 1 E2E)
- Deployed on Vercel with public URL
- README explains everything in simple language

---

## Summary

BharatOS wins by showing a working product that solves a real problem. Not by having the most features. The dairy business demo with the Rs 4.2 lakh opportunity number is what judges will remember and talk about.

Build less. Polish more. Demo perfectly.
