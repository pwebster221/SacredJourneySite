# Paths of Reverence - Project Documentation

> A comprehensive technical reference for the Sacred Journey tarot practice application

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [API Client Reference](#api-client-reference)
6. [Content Collections](#content-collections)
7. [Pages & Routes](#pages--routes)
8. [API Endpoints](#api-endpoints)
9. [Components](#components)
10. [Styling System](#styling-system)
11. [Workflow Modes](#workflow-modes)
12. [Type Reference](#type-reference)
13. [Configuration](#configuration)
14. [Troubleshooting](#troubleshooting)

---

## Overview

**Paths of Reverence** is an Astro-based SSR web application for daily tarot and spiritual practice tracking. The app integrates with a Neo4j middleware API ("Sacred Journey" API) to manage weekly readings, daily entries, and AI-powered interpretation workflows.

### Key Features

- **Weekly Readings**: Draw 11 cards (7 planetary + 4 domain) for each week
- **Daily Practice**: Explore each day's planetary card through four life domains
- **Conversational AI**: Claude-powered chat sessions for guided introspection
- **Domain System**: Body, Mind, Heart, Spirit aspects for holistic exploration
- **Practice History**: Archive of past readings with searchable history

### Philosophy

The app functions as a **sacred witness** rather than a fortune-telling tool. It uses tarot as a symbolic framework for self-reflection and personal insight, emphasizing:

- Contemplative interpretation over prediction
- Personal growth and self-inquiry
- Weaving themes across life domains
- Continuity through daily synthesis

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Astro SSR Application                   │
│  (pathsofreverence.dubtown.design)                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐    ┌──────────────┐    ┌─────────────┐  │
│   │   Pages      │    │  Components  │    │   Layouts   │  │
│   │   (SSR)      │    │              │    │             │  │
│   └──────┬───────┘    └──────────────┘    └─────────────┘  │
│          │                                                  │
│   ┌──────▼───────┐    ┌──────────────┐                     │
│   │  API Routes  │    │  Content     │                     │
│   │  /api/*      │    │  Collections │                     │
│   └──────┬───────┘    └──────┬───────┘                     │
│          │                   │                              │
└──────────┼───────────────────┼──────────────────────────────┘
           │                   │
           ▼                   ▼
┌──────────────────┐  ┌───────────────────────────────────────┐
│   Anthropic API  │  │   Sacred Journey API                  │
│   (Claude)       │  │   (Neo4j Middleware)                  │
│                  │  │   neo4jmiddleware.robin-alligator.ts  │
└──────────────────┘  └───────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Framework | Astro 5.16+ with SSR |
| Language | TypeScript (strict mode) |
| Styling | CSS Custom Properties + Scoped Styles |
| Fonts | Cinzel (display) + Cormorant Garamond (body) |
| AI | Claude API via Anthropic SDK |
| Backend | Neo4j Middleware API (external) |
| Monitoring | Sentry + Spotlight.js |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Access to the Sacred Journey API

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd astro-site

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Environment Configuration

```env
# Sacred Journey API (Neo4j middleware)
PUBLIC_API_BASE=https://neo4jmiddleware.robin-alligator.ts.net

# Anthropic API for Claude chat sessions
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Development

```bash
# Start development server (http://localhost:4321)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run Astro CLI commands
npm run astro -- <command>
```

---

## Project Structure

```
astro-site/
├── public/
│   └── favicon.svg
├── src/
│   ├── assets/
│   │   ├── astro.svg
│   │   └── background.svg
│   ├── components/
│   │   ├── SpreadDisplay.astro
│   │   └── Welcome.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── sacred-journey.ts    # API client
│   │   └── tarot-data.ts        # Card deck data
│   ├── pages/
│   │   ├── api/
│   │   │   ├── chat.ts
│   │   │   └── generate-interpretation.ts
│   │   ├── history/
│   │   │   ├── index.astro
│   │   │   └── week/[start].astro
│   │   ├── practice/
│   │   │   ├── [date].astro
│   │   │   ├── new-week.astro
│   │   │   ├── pending.astro
│   │   │   ├── prepare/[date].astro
│   │   │   ├── respond/[id].astro
│   │   │   └── session/[date].astro
│   │   └── index.astro
│   └── content.config.ts        # Content collections
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── CLAUDE.md                    # AI assistant instructions
```

### Path Aliases

```typescript
@/*           → src/*
@lib/*        → src/lib/*
@components/* → src/components/*
@layouts/*    → src/layouts/*
```

---

## API Client Reference

The `SacredJourneyClient` class (`src/lib/sacred-journey.ts`) provides type-safe methods for interacting with the Neo4j middleware API.

### Initialization

```typescript
import { sacredJourney } from '@lib/sacred-journey';

// Or create a custom instance
import { SacredJourneyClient } from '@lib/sacred-journey';
const client = new SacredJourneyClient('https://custom-api.example.com');
```

### Weekly Operations

#### `createWeeklyReading(request: WeeklyReadingRequest): Promise<any>`

Creates a new weekly reading with 11 cards.

```typescript
await sacredJourney.createWeeklyReading({
  week_start: '2025-01-05',
  planetary_cards: {
    Sunday: 'The Sun',
    Monday: 'The High Priestess',
    Tuesday: 'The Tower',
    Wednesday: 'The Magician',
    Thursday: 'Wheel of Fortune',
    Friday: 'The Empress',
    Saturday: 'The Star'
  },
  domain_cards: {
    Body: 'Four of Pentacles',
    Mind: 'Ace of Swords',
    Heart: 'Two of Cups',
    Spirit: 'The Hermit'
  }
});
```

#### `getWeeklyProgress(weekStart: string): Promise<any>`

Gets progress for a specific week.

```typescript
const progress = await sacredJourney.getWeeklyProgress('2025-01-05');
// Returns: { reading_id, status, days_complete, ... }
```

#### `getCurrentSpread(): Promise<CurrentSpread>`

Gets the current week's cards and today's status.

```typescript
const spread = await sacredJourney.getCurrentSpread();
// Returns: { reading_id, week_start, planetary_cards, domain_cards, today, days_complete }
```

### Daily Operations

#### `beginDailyEntry(entryDate?: string): Promise<DailyEntryResponse>`

Creates or retrieves a daily entry.

```typescript
const entry = await sacredJourney.beginDailyEntry('2025-01-07');
// Returns: { entry_id, date, day_of_week, planetary_card, domains, interpretation_ids }
```

#### `getDailyInterpretations(entryDate: string): Promise<DailyInterpretationsResponse | null>`

Gets interpretations with full card details. Most reliable for card data.

```typescript
const interps = await sacredJourney.getDailyInterpretations('2025-01-07');
// Returns: { entry_id, planetary_card, domain_cards, interpretations, planetary_card_detail, domain_cards_detail }
```

#### `getInterpretationContext(entryDate: string, userId?: string): Promise<InterpretationContext>`

Gets full context for interpretation including user profile.

```typescript
const context = await sacredJourney.getInterpretationContext('2025-01-07', 'user-123');
// Returns: { entry_id, planetary_ruler, domain_cards, yesterday_synthesis, user_context, ... }
```

#### `getDailyContext(entryDate: string, userId?: string): Promise<DailyContext>`

Gets context specifically for chat sessions.

```typescript
const context = await sacredJourney.getDailyContext('2025-01-07');
```

### Conversational Workflow

#### `bulkCompleteDaily(request: BulkCompleteDailyRequest): Promise<any>`

Saves an entire day's session in one API call. Used by chat sessions.

```typescript
await sacredJourney.bulkCompleteDaily({
  entry_date: '2025-01-07',
  interpretations: {
    Mind: {
      prepared_interpretation: 'The Ace of Swords brings...',
      introspection_question: 'What clarity is seeking you?',
      response: 'I feel that...',
      domain_eval: 'Mental clarity emerging'
    },
    Heart: { /* ... */ },
    Body: { /* ... */ },
    Spirit: { /* ... */ }
  },
  auto_synthesize: false,
  synthesis_content: 'Today revealed a theme of...'
});
```

### Legacy Interpretation Flow

#### `prepareInterpretation(id, interpretation, question): Promise<any>`

Prepares an interpretation with AI-generated content.

#### `respondToInterpretation(id, response): Promise<any>`

Records user's response to an introspection question.

#### `evaluateInterpretation(id, evaluation): Promise<any>`

Adds final evaluation/synthesis for a domain.

#### `getPendingInterpretations(): Promise<{ pending: PendingInterpretation[] }>`

Gets all interpretations awaiting response.

### Profile Operations

#### `getUserContextBlock(userId: string): Promise<UserContextBlock>`

Gets user's astrological chart and spiritual context.

#### `getProfileStatistics(userId: string): Promise<any>`

Gets practice statistics for a user.

### History Operations

#### `getHistoryArchive(limit?, includeEntries?): Promise<any>`

Gets historical readings with optional entry details.

```typescript
const history = await sacredJourney.getHistoryArchive(10, true);
// Returns: { readings, recent_entries }
```

### Utility Methods

#### `addTransits(entryDate, transits): Promise<any>`

Adds planetary transit data to a daily entry.

#### `createDailySynthesis(entryDate, content?): Promise<any>`

Creates or auto-generates the daily synthesis.

#### `healthCheck(): Promise<boolean>`

Checks API availability.

---

## Content Collections

Defined in `src/content.config.ts`, collections fetch data from the Sacred Journey API at build/request time.

### Weekly Readings Collection

```typescript
const weeklyReadings = defineCollection({
  loader: async () => {
    const response = await fetch(`${API_BASE}/sacred-journey/history?limit=50`);
    const data = await response.json();
    return data.readings.map(reading => ({ id: reading.reading_id, ...reading }));
  },
  schema: z.object({
    reading_id: z.string(),
    week_start: z.coerce.date(),
    week_end: z.coerce.date().optional(),
    status: z.enum(['active', 'complete']),
    days_complete: z.number().default(0),
    total_interpretations: z.number().default(0),
    weekly_synthesis: z.string().nullable().optional()
  })
});
```

### Daily Entries Collection

Fetches individual daily practice entries with interpretation counts.

### Interpretations Collection

Fetches pending interpretation questions awaiting user response.

### Users Collection

Fetches user profiles for multi-user support.

### Usage in Pages

```astro
---
import { getCollection } from 'astro:content';

const readings = await getCollection('weeklyReadings');
const pendingInterpretations = await getCollection('interpretations');
---
```

---

## Pages & Routes

### Route Map

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.astro` | Current week spread and today's status |
| `/practice/new-week` | `practice/new-week.astro` | Create new weekly reading |
| `/practice/[date]` | `practice/[date].astro` | Daily practice view |
| `/practice/session/[date]` | `practice/session/[date].astro` | Chat session interface |
| `/practice/prepare/[date]` | `practice/prepare/[date].astro` | Prepare interpretations (legacy) |
| `/practice/respond/[id]` | `practice/respond/[id].astro` | Respond to questions (legacy) |
| `/practice/pending` | `practice/pending.astro` | View pending interpretations |
| `/history` | `history/index.astro` | Archive of past readings |
| `/history/week/[start]` | `history/week/[start].astro` | View specific week |

### Home Page (`/`)

Displays:
- Current week's 7 planetary cards (one per day)
- 4 domain cards (fixed for the week)
- Today's practice status with interpretation progress
- Quick actions: Start Chat Session, View Practice

Handles edge cases:
- No active week → prompts to create new week
- API error → shows connection issue message

### Chat Session Page (`/practice/session/[date]`)

The primary workflow interface featuring:
- Real-time streaming chat with Claude
- Cards panel showing planetary ruler and domain cards
- Yesterday's synthesis for continuity
- Session completion with structured data extraction
- Debug panel for troubleshooting

**Data Loading Strategy:**
1. Try `getDailyInterpretations(date)` - most reliable for cards
2. Fallback: `getInterpretationContext(date)` - for synthesis/context
3. Final fallback: `getCurrentSpread()` - works for current week

**Session Completion Flow:**
1. User clicks "Complete Session"
2. Claude outputs `session-complete` JSON block
3. Client parses and calls `bulk_complete_daily`
4. Redirects to practice page

### New Week Page (`/practice/new-week`)

Form-based interface for drawing cards:
- 7 planetary card inputs with planet symbols (☉ ☽ ♂ ☿ ♃ ♀ ♄)
- 4 domain card inputs (Body, Mind, Heart, Spirit)
- Autocomplete against 78-card Tarot deck
- Week start date picker (defaults to Sunday)

---

## API Endpoints

### POST `/api/chat`

Streaming proxy for Claude API with Sacred Journey system prompt.

**Request:**
```typescript
interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  context: {
    date: string;
    planetary_card: string;
    domain_cards: Record<string, string>;
    yesterday_synthesis?: string | null;
    user_context?: string | null;
  };
}
```

**Response:** Server-sent event stream with `data: {"text": "..."}` chunks.

**System Prompt Includes:**
- Today's date and planetary ruler card
- Domain cards with explicit mapping
- Yesterday's synthesis for continuity
- User profile/context if available
- Conversational workflow instructions
- Session completion format specification

### POST `/api/generate-interpretation`

Generates individual interpretations using Claude (legacy flow).

**Request:**
```typescript
interface GenerationRequest {
  domain: string;
  planetary_card: string;
  planetary_card_detail: Record<string, any>;
  domain_card: string;
  domain_card_detail: Record<string, any>;
}
```

**Response:**
```typescript
interface GenerationResponse {
  interpretation: string;
  introspection_question: string;
}
```

---

## Components

### SpreadDisplay.astro

Renders the 11-card weekly spread.

**Props:**
```typescript
interface Props {
  planetaryCards: Record<string, string>;  // Day → Card mapping
  domainCards: Record<string, string>;      // Domain → Card mapping
  currentDay?: string;                       // Highlights today's card
  compact?: boolean;                         // Compact display mode
}
```

**Usage:**
```astro
<SpreadDisplay
  planetaryCards={spread.planetary_cards}
  domainCards={spread.domain_cards}
  currentDay="Monday"
/>
```

### Layout.astro

Master layout providing:
- HTML document structure
- Navigation header (Today, Practice, Archive)
- Main content slot
- Footer
- Global CSS variables and base styles
- Font loading (Cinzel, Cormorant Garamond)

**Props:**
```typescript
interface Props {
  title?: string;        // Page title (default: "Paths of Reverence")
  description?: string;  // Meta description
}
```

---

## Styling System

### Color Palette

```css
:root {
  /* Backgrounds */
  --color-bg-deep: #0a0a0f;
  --color-bg: #12121a;
  --color-bg-elevated: #1a1a24;
  --color-bg-card: #22222e;

  /* Gold Accent */
  --color-gold: #c9a227;
  --color-gold-light: #e6c656;
  --color-gold-dim: #8b7019;

  /* Text */
  --color-text: #e8e6e3;
  --color-text-muted: #a8a5a0;
  --color-text-dim: #6b6860;

  /* Domain Colors */
  --color-accent-body: #7c9885;    /* Earth green */
  --color-accent-mind: #8b9dc3;    /* Air blue */
  --color-accent-heart: #c98b8b;   /* Water rose */
  --color-accent-spirit: #c9a8d3;  /* Fire violet */

  /* Borders */
  --color-border: #2a2a38;
  --color-border-light: #3a3a48;
}
```

### Typography

```css
:root {
  --font-display: 'Cinzel', serif;  /* Headers, navigation, labels */
  --font-body: 'Cormorant Garamond', serif;  /* Body text, content */
}
```

### Spacing Scale

```css
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
}
```

### Component Classes

```css
/* Card container */
.card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--card-radius);
  padding: var(--space-lg);
}

/* Buttons */
.btn { /* Ghost button */ }
.btn-primary { /* Filled gold button */ }

/* Domain modifiers */
.domain-body { --domain-color: var(--color-accent-body); }
.domain-mind { --domain-color: var(--color-accent-mind); }
.domain-heart { --domain-color: var(--color-accent-heart); }
.domain-spirit { --domain-color: var(--color-accent-spirit); }
```

---

## Workflow Modes

### Conversational Workflow (Primary)

The recommended approach using a natural dialogue flow:

```
1. OPEN
   └── Claude orients to today's planetary ruler and domain cards

2. EXPLORE
   └── All 4 domains discussed in natural conversation
   └── Themes weave together organically

3. DISTILL
   └── A single introspection question emerges from dialogue

4. REFLECT
   └── User responds to the question

5. SYNTHESIZE
   └── Claude captures the day's insights

6. COMPLETE
   └── Session data saved via bulk_complete_daily API
```

**Key Features:**
- Single flowing conversation
- Themes connect across domains
- One question instead of four
- More natural exploration

### Legacy Step-by-Step Workflow

The original approach with separate phases:

```
For each domain (Body, Mind, Heart, Spirit):
  1. PREPARE
     └── AI generates interpretation + question
     └── Status: prepared → ready

  2. RESPOND
     └── User answers introspection question
     └── Status: ready → responded

  3. EVALUATE
     └── AI provides domain synthesis
     └── Status: responded → complete
```

**Status Progression:**
```
prepared → ready → responded → complete
```

---

## Type Reference

### Core Types

```typescript
// Weekly reading creation
interface WeeklyReadingRequest {
  week_start: string;
  planetary_cards: {
    Sunday: string;
    Monday: string;
    Tuesday: string;
    Wednesday: string;
    Thursday: string;
    Friday: string;
    Saturday: string;
  };
  domain_cards: {
    Body: string;
    Mind: string;
    Heart: string;
    Spirit: string;
  };
}

// Current week state
interface CurrentSpread {
  reading_id: string;
  week_start: string;
  week_status: 'active' | 'complete';
  planetary_cards: Record<string, string>;
  domain_cards: Record<string, string>;
  today: CurrentDailySpread | null;
  days_complete: number;
}

// Today's practice
interface CurrentDailySpread {
  entry_id: string;
  date: string;
  day_of_week: string;
  planetary_card: string;
  domain_cards: Record<string, string>;
  interpretations: CurrentInterpretation[];
  synthesis: string | null;
  status: 'active' | 'complete';
}

// Individual interpretation
interface CurrentInterpretation {
  interpretation_id: string;
  domain: string;
  status: 'prepared' | 'ready' | 'responded' | 'complete';
  prepared_interpretation?: string;
  introspection_question?: string;
  response?: string;
  domain_eval?: string;
}
```

### Bulk Completion Types

```typescript
interface BulkDomainInterpretation {
  prepared_interpretation: string;
  introspection_question: string;
  response: string;
  domain_eval: string;
}

interface BulkCompleteDailyRequest {
  entry_date: string;
  interpretations: {
    Mind: BulkDomainInterpretation;
    Heart: BulkDomainInterpretation;
    Body: BulkDomainInterpretation;
    Spirit: BulkDomainInterpretation;
  };
  auto_synthesize?: boolean;
  synthesis_content?: string;
}
```

### User Context Types

```typescript
interface UserContextBlock {
  interpreted_chart: InterpretedChart | null;
  spiritual_identity: string | null;
  active_intentions: ActiveIntention[];
  transit_focus: string[];
}

interface InterpretedChart {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  ic_sign: string;
  ic_themes?: string[];
  configurations?: ChartConfiguration[];
  notable_placements?: Record<string, string>;
}

interface ActiveIntention {
  intention_id: string;
  theme: string;
  question: string;
  started: string;
  active: boolean;
}
```

### Enriched Card Types

```typescript
interface EnrichedCard {
  name: string;
  summary: {
    name: string;
    arcana: 'Major' | 'Minor' | 'Majestic';
    number?: number;
    suit?: string;
    domain?: string;
    labels: string[];
  };
  correspondences: {
    dominant_sign?: { name: string; element?: string; modality?: string };
    ruling_body?: { name: string; symbol?: string; day?: string };
    element?: { name: string; symbol?: string };
    hebrew_letter?: { name: string; letter?: string; meaning?: string };
    tree_path?: { number?: number; name?: string; connects?: string[] };
    enneagram?: { type: number; name?: string };
    suit?: { name: string; element?: string };
    number?: { value: number; meaning?: string };
  };
}
```

---

## Configuration

### Astro Configuration

```javascript
// astro.config.mjs
export default defineConfig({
  output: 'server',  // SSR mode
  site: 'https://pathsofreverence.dubtown.design',
  server: {
    port: 4321,
    host: true  // Allows Tailscale access
  },
  vite: {
    define: {
      'import.meta.env.PUBLIC_API_BASE': JSON.stringify(
        process.env.PUBLIC_API_BASE || 'https://neo4jmiddleware.robin-alligator.ts.net'
      )
    }
  },
  integrations: [sentry(), spotlightjs()]
});
```

### TypeScript Configuration

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "allowJs": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@lib/*": ["src/lib/*"],
      "@components/*": ["src/components/*"],
      "@layouts/*": ["src/layouts/*"]
    }
  }
}
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PUBLIC_API_BASE` | Sacred Journey API URL | `https://neo4jmiddleware.robin-alligator.ts.net` |
| `ANTHROPIC_API_KEY` | Claude API key for chat sessions | Required |

---

## Troubleshooting

### Debug Panel

The session page includes a collapsible debug panel showing:
- Whether context loaded successfully
- Entry ID (or "none - will create on save")
- Planetary ruler card
- Domain cards mapping
- Day name being used

### Common Issues

#### Domain cards showing as empty/dashes

**Symptoms:** Domain cards show "—" instead of card names

**Solutions:**
1. Check if `getDailyInterpretations` endpoint returns `domain_cards`
2. Verify the week has been created with `createWeeklyReading`
3. Check debug panel to see what data loaded
4. Ensure the date is within an active weekly reading

#### Entry creation failing

**Symptoms:** "Could Not Create Entry" error on session page

**Solutions:**
1. Verify the weekly reading exists for that date
2. Check `PUBLIC_API_BASE` is correct for environment
3. Check browser console for CORS errors
4. Ensure the API is accessible (run health check)

#### Claude mixing up domain cards

**Symptoms:** Claude assigns wrong cards to domains

**Solutions:**
- The system prompt explicitly maps each domain to its card
- Includes instruction: "Do NOT swap or mix up the domain-card assignments"
- Check if context is being passed correctly to `/api/chat`

#### API returning "Access denied"

**Symptoms:** Some endpoints return 403 or access errors

**Solutions:**
- Use the Funnel URL, not internal Tailscale URL
- Verify the API_BASE matches your network configuration
- Check API key/authentication if required

### Logging

The `/api/chat` endpoint logs context information:

```javascript
console.log('[Chat API] Context received:', {
  date: body.context.date,
  planetary_card: body.context.planetary_card,
  domain_cards: body.context.domain_cards,
  has_yesterday_synthesis: !!body.context.yesterday_synthesis,
  has_user_context: !!body.context.user_context
});
```

---

## Related Documentation

- `CLAUDE.md` - AI assistant instructions and project overview
- `files/SACRED_JOURNEY_GUIDE.md` - Full workflow documentation
- `files/CLAUDE_DESKTOP_PROMPT.md` - Claude Desktop MCP integration

---

*Generated on January 10, 2026*
