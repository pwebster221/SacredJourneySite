# V2 API Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the Sacred Journey Astro site from the V1 calendar-based weekly reading API to the V2 progression-based archetypal cycle API.

**Architecture:** Replace all V1 `/sacred-journey/...` endpoints with V2 `/v2/sacred-journey/...` equivalents. The core conceptual shift is from calendar-time (weekly readings, daily entries by date) to archetypal-progression (reading cycles, progression entries by planet sequence 1–7). Routing changes from date-based slugs to UUID-based slugs.

**Tech Stack:** Astro 5 (SSR), TypeScript, Zod (content collections), Fetch API, Neo4j backend (via HTTP middleware)

---

## Concept Mapping Reference

| V1 Concept | V2 Concept |
|---|---|
| `WeeklyReading` | `ReadingCycle` |
| `DailyEntry` (date-based) | `ProgressionEntry` (UUID, sequence 1–7) |
| Planets by weekday (Sun=Sunday, Moon=Monday…) | Planets by sequence (1=Sun, 2=Moon, 3=Mars, 4=Mercury, 5=Jupiter, 6=Venus, 7=Saturn) |
| Domains: Body / Mind / Heart / Spirit | Domains: Physical / Emotional / Mental / Spiritual |
| Entry status: active / complete | Entry status: available → active → integrating → complete |
| No integration phase | Integration phase: add notes after synthesis, before advance |
| No cycle synthesis | Cycle synthesis after all 7 entries complete |

## V2 Base URL

```
/v2/sacred-journey
```

---

## Task 1: Update API base URL in api-config.ts

**Files:**
- Modify: `src/lib/api-config.ts`

**Step 1: Read the current file**

Read `src/lib/api-config.ts` to understand current structure.

**Step 2: Update the V2 path prefix constant**

Add a `V2_PREFIX` constant and update the base path:

```typescript
// In src/lib/api-config.ts, add:
export const V2_PREFIX = '/v2/sacred-journey'

// The existing API_BASE (the server hostname) stays the same.
// Usage will be: `${getApiBase()}${V2_PREFIX}/cycles/active`
```

**Step 3: Verify no tests break yet**

Run: `node test-history.mjs`
Expected: May fail (that's OK — we haven't updated the client yet)

**Step 4: Commit**

```bash
git add src/lib/api-config.ts
git commit -m "chore: add V2_PREFIX constant to api-config"
```

---

## Task 2: Rewrite sacred-journey.ts — TypeScript types for V2

**Files:**
- Modify: `src/lib/sacred-journey.ts`

This is the largest task. Do it in sub-steps.

### Step 1: Add V2 TypeScript interfaces at the top of the file

Replace all V1 interfaces with V2 equivalents. Add these types:

```typescript
// ============================================================
// V2 Types
// ============================================================

export type EntryStatus = 'available' | 'active' | 'integrating' | 'complete'
export type InterpretationStatus = 'pending' | 'responded' | 'evaluated' | 'complete'
export type CycleStatus = 'active' | 'complete'
export type Domain = 'Physical' | 'Emotional' | 'Mental' | 'Spiritual'

export interface ReadingCycleResponse {
  cycle_id: string
  created_at: string
  completed_at: string | null
  status: CycleStatus
  message: string
  planetary_cards_detail: null
  domain_cards_detail: null
}

export interface ActiveCyclesResponse {
  active_cycles: ReadingCycleResponse[]
  count: number
}

export interface CycleHistoryItem {
  cycle_id: string
  created_at: string
  completed_at: string | null
  entries_completed: number
  has_synthesis: boolean
}

export interface CycleHistoryResponse {
  cycles: CycleHistoryItem[]
  total: number
  page: number
  page_size: number
}

export interface EntryProgressSummary {
  entry_id: string
  sequence: number
  planet: string
  status: EntryStatus
  started_at: string | null
  completed_at: string | null
}

export interface CycleProgressResponse {
  cycle_id: string
  status: CycleStatus
  created_at: string
  completed_at: string | null
  entries: EntryProgressSummary[]
  current_entry: EntryProgressSummary | null
}

export interface ProgressionEntryResponse {
  entry_id: string
  sequence: number
  planet: string
  status: EntryStatus
  cycle_id: string
  started_at: string | null
  completed_at: string | null
  planetary_card: string
  domain_cards: Record<Domain, string>
  planetary_card_detail: null
  domain_cards_detail: null
  message: string
}

export interface EntrySynthesisResponse {
  entry_id: string
  synthesis_id: string
  status: string
  created_at: string
  message: string
}

export interface EntryAdvanceResponse {
  entry_id: string
  sequence: number
  planet: string
  status: EntryStatus
  completed_at: string | null
  next_entry: { entry_id: string; sequence: number; planet: string } | null
  cycle_complete: boolean
  message: string
}

export interface IntegrationStatusResponse {
  entry_id: string
  sequence: number
  planet: string
  status: EntryStatus
  started_at: string | null
  notes: { timestamp: string; content: string }[]
  notes_count: number
  time_integrating_seconds: number
  message: string
}

export interface InterpretationContextResponse {
  entry_id: string
  interpretation_id: string
  domain: Domain
  sequence: number
  planet: string
  planetary_card: string
  domain_card: string
  previous_synthesis: string | null
  same_planet_previous_cycle_synthesis: string | null
  transits: any[]
  user_context: any | null
  status: InterpretationStatus
  created_at: string
  message: string
}

export interface InterpretationRespondResponse {
  interpretation_id: string
  domain: Domain
  status: InterpretationStatus
  responded_at: string
  message: string
}

export interface InterpretationStatusItem {
  interpretation_id: string
  domain: Domain
  status: InterpretationStatus
  created_at: string | null
  responded_at: string | null
  evaluated_at: string | null
  completed_at: string | null
}

export interface AllInterpretationsStatusResponse {
  entry_id: string
  sequence: number
  planet: string
  interpretations: InterpretationStatusItem[]
  all_complete: boolean
  completion_count: number
  message: string
}

export interface EntryContextResponse {
  entry_id: string
  sequence: number
  planet: string
  cycle_id: string
  planetary_card: string
  domain_cards: Record<Domain, string>
  previous_entry: {
    entry_id: string
    sequence: number
    planet: string
    synthesis: string | null
    completed_at: string | null
  } | null
  same_planet_previous_cycle: {
    entry_id: string
    cycle_id: string
    sequence: number
    planet: string
    synthesis: string | null
    completed_at: string | null
  } | null
  transits: any[]
  transit_snapshot_id: string | null
  message: string
}

export interface UserProfileResponse {
  user: {
    user_id: string
    username: string
    first_name: string
    last_name: string
    email: string
    created_at: string
  }
  active_cycles: {
    cycle_id: string
    status: CycleStatus
    current_sequence: number
    current_planet: string
    entries_completed: number
    started_at: string
  }[]
  total_cycles_completed: number
  total_entries_completed: number
  journey_start_date: string
  last_activity_at: string
}

export interface CycleTimelineResponse {
  cycle_id: string
  status: CycleStatus
  created_at: string
  completed_at: string | null
  entries: {
    entry_id: string
    sequence: number
    planet: string
    status: EntryStatus
    started_at: string | null
    completed_at: string | null
    has_synthesis: boolean
    interpretations_completed: number
    integration_notes_count: number
  }[]
  total_duration_hours: number
  entries_completed: number
  has_cycle_synthesis: boolean
  planetary_cards: Record<string, string>
  domain_cards: Record<Domain, string>
}

export interface UserTimelineResponse {
  user_id: string
  items: {
    item_type: string
    timestamp: string
    cycle_id: string | null
    entry_id: string | null
    planet: string | null
    sequence: number | null
    description: string
  }[]
  total: number
  page: number
  page_size: number
  has_more: boolean
  total_cycles: number
  total_entries_completed: number
  date_range_start: string
  date_range_end: string
}
```

### Step 2: Rewrite the SacredJourneyClient class methods

Replace all V1 methods with these V2 methods:

```typescript
export class SacredJourneyClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private url(path: string) {
    return `${this.baseUrl}/v2/sacred-journey${path}`
  }

  private async throwApiError(response: Response, fallback: string): Promise<never> {
    const body = await response.json().catch(() => ({})) as any
    throw new Error(body.detail || fallback)
  }

  // ── Cycles ──────────────────────────────────────────────────

  async createCycle(payload: {
    planetary_cards: Record<string, string>
    domain_cards: Record<string, string>
    user_id?: string
  }): Promise<ReadingCycleResponse> {
    const res = await fetch(this.url('/cycles/create'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to create cycle')
    return res.json()
  }

  async getActiveCycles(): Promise<ActiveCyclesResponse> {
    const res = await fetch(this.url('/cycles/active'))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch active cycles')
    return res.json()
  }

  async getCycleHistory(page = 1, pageSize = 10): Promise<CycleHistoryResponse> {
    const res = await fetch(this.url(`/cycles/history?page=${page}&page_size=${pageSize}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch cycle history')
    return res.json()
  }

  async getCycle(cycleId: string): Promise<ReadingCycleResponse> {
    const res = await fetch(this.url(`/cycles/${cycleId}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch cycle')
    return res.json()
  }

  async getCycleProgress(cycleId: string): Promise<CycleProgressResponse> {
    const res = await fetch(this.url(`/cycles/${cycleId}/progress`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch cycle progress')
    return res.json()
  }

  async synthesizeCycle(cycleId: string, payload: {
    synthesis_content: string
    themes?: string[]
    insights?: string
  }): Promise<{ cycle_id: string; synthesis_id: string; created_at: string; message: string }> {
    const res = await fetch(this.url(`/cycles/${cycleId}/synthesize`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to synthesize cycle')
    return res.json()
  }

  async getCycleSynthesis(cycleId: string): Promise<{
    synthesis_id: string; cycle_id: string; content: string; themes: string[];
    insights: string; created_at: string
  }> {
    const res = await fetch(this.url(`/cycles/${cycleId}/synthesis`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch cycle synthesis')
    return res.json()
  }

  // ── Entries ──────────────────────────────────────────────────

  async beginEntry(entryId: string): Promise<ProgressionEntryResponse> {
    const res = await fetch(this.url(`/entries/${entryId}/begin`), { method: 'POST' })
    if (!res.ok) await this.throwApiError(res, 'Failed to begin entry')
    return res.json()
  }

  async getEntry(entryId: string): Promise<ProgressionEntryResponse> {
    const res = await fetch(this.url(`/entries/${entryId}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch entry')
    return res.json()
  }

  async synthesizeEntry(entryId: string, payload: {
    synthesis_content: string
    insights?: string
  }): Promise<EntrySynthesisResponse> {
    const res = await fetch(this.url(`/entries/${entryId}/synthesize`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to synthesize entry')
    return res.json()
  }

  async addIntegrationNotes(entryId: string, content: string): Promise<{
    entry_id: string; notes_count: number; latest_note: { timestamp: string; content: string }; message: string
  }> {
    const res = await fetch(this.url(`/entries/${entryId}/integration-notes`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, timestamp: new Date().toISOString() })
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to add integration notes')
    return res.json()
  }

  async getIntegrationStatus(entryId: string): Promise<IntegrationStatusResponse> {
    const res = await fetch(this.url(`/entries/${entryId}/integration`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch integration status')
    return res.json()
  }

  async advanceEntry(entryId: string): Promise<EntryAdvanceResponse> {
    const res = await fetch(this.url(`/entries/${entryId}/advance`), { method: 'POST' })
    if (!res.ok) await this.throwApiError(res, 'Failed to advance entry')
    return res.json()
  }

  // ── Interpretations ──────────────────────────────────────────

  async prepareInterpretation(entryId: string, domain: Domain, userId?: string): Promise<InterpretationContextResponse> {
    const res = await fetch(this.url(`/interpretations/${entryId}/prepare`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain, user_id: userId })
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to prepare interpretation')
    return res.json()
  }

  async respondToInterpretation(interpId: string, responseText: string): Promise<InterpretationRespondResponse> {
    const res = await fetch(this.url(`/interpretations/${interpId}/respond`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response_text: responseText })
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to submit response')
    return res.json()
  }

  async evaluateInterpretation(interpId: string, evaluationText: string, insights?: string[]): Promise<{
    interpretation_id: string; domain: Domain; status: InterpretationStatus; evaluated_at: string; message: string
  }> {
    const res = await fetch(this.url(`/interpretations/${interpId}/evaluate`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ evaluation_text: evaluationText, insights: insights ?? [] })
    })
    if (!res.ok) await this.throwApiError(res, 'Failed to evaluate interpretation')
    return res.json()
  }

  async completeInterpretation(interpId: string): Promise<{
    interpretation_id: string; domain: Domain; status: InterpretationStatus;
    completed_at: string; remaining_domains: number; all_complete: boolean; message: string
  }> {
    const res = await fetch(this.url(`/interpretations/${interpId}/complete`), { method: 'POST' })
    if (!res.ok) await this.throwApiError(res, 'Failed to complete interpretation')
    return res.json()
  }

  async getInterpretationsStatus(entryId: string): Promise<AllInterpretationsStatusResponse> {
    const res = await fetch(this.url(`/interpretations/${entryId}/status`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch interpretation status')
    return res.json()
  }

  // ── Context ──────────────────────────────────────────────────

  async getEntryContext(entryId: string): Promise<EntryContextResponse> {
    const res = await fetch(this.url(`/context/${entryId}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch entry context')
    return res.json()
  }

  // ── Profiles ─────────────────────────────────────────────────

  async getUserProfile(userId: string): Promise<UserProfileResponse> {
    const res = await fetch(this.url(`/profiles/${userId}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch user profile')
    return res.json()
  }

  // ── History ──────────────────────────────────────────────────

  async getCycleTimeline(cycleId: string): Promise<CycleTimelineResponse> {
    const res = await fetch(this.url(`/history/cycles/${cycleId}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch cycle timeline')
    return res.json()
  }

  async getUserTimeline(userId: string, page = 1, pageSize = 20): Promise<UserTimelineResponse> {
    const res = await fetch(this.url(`/history/user/${userId}/reading-timeline?page=${page}&page_size=${pageSize}`))
    if (!res.ok) await this.throwApiError(res, 'Failed to fetch user timeline')
    return res.json()
  }
}

export const sacredJourney = new SacredJourneyClient(
  import.meta.env.PUBLIC_API_BASE ?? 'http://100.117.79.64:8000'
)
```

### Step 3: Write an integration smoke test

Create `test-v2-api.mjs`:

```javascript
import { sacredJourney } from './src/lib/sacred-journey.ts'

// Test 1: Get active cycles
const active = await sacredJourney.getActiveCycles()
console.log('Active cycles:', active.count)

// Test 2: Get cycle history
const history = await sacredJourney.getCycleHistory()
console.log('Cycle history total:', history.total)
```

Run: `node --experimental-vm-modules test-v2-api.mjs`
Expected: No errors, JSON output printed.

### Step 4: Commit

```bash
git add src/lib/sacred-journey.ts test-v2-api.mjs
git commit -m "feat: rewrite sacred-journey client for V2 API"
```

---

## Task 3: Update domain-utils.ts

**Files:**
- Modify: `src/lib/domain-utils.ts`

**Step 1: Update the DOMAINS constant and normalization**

```typescript
// Replace:
export const DOMAINS = ['Body', 'Mind', 'Heart', 'Spirit'] as const
export type DomainKey = typeof DOMAINS[number]

// With:
export const DOMAINS = ['Physical', 'Emotional', 'Mental', 'Spiritual'] as const
export type DomainKey = typeof DOMAINS[number]

// Update normalizeDomain to map old V1 names to V2 (for any legacy data):
const DOMAIN_ALIASES: Record<string, DomainKey> = {
  body: 'Physical',
  mind: 'Mental',
  heart: 'Emotional',
  spirit: 'Spiritual',
  physical: 'Physical',
  emotional: 'Emotional',
  mental: 'Mental',
  spiritual: 'Spiritual',
}

export function normalizeDomain(domain: string): DomainKey | null {
  return DOMAIN_ALIASES[domain.toLowerCase()] ?? null
}
```

**Step 2: Search all pages for old domain names**

Run: `grep -r "Body\|Mind\|Heart\|Spirit" src/pages/`
Expected: List of files using old domain names — fix each occurrence found.

**Step 3: Commit**

```bash
git add src/lib/domain-utils.ts
git commit -m "feat: update domains from Body/Mind/Heart/Spirit to Physical/Emotional/Mental/Spiritual"
```

---

## Task 4: Update content.config.ts

**Files:**
- Modify: `src/content.config.ts`

The current content collections call V1 endpoints. Update them to V2.

**Step 1: Read the file**

Read `src/content.config.ts`.

**Step 2: Replace collections with V2 equivalents**

```typescript
import { defineCollection, z } from 'astro:content'
import { getApiBase } from './lib/api-config'

const V2 = `${getApiBase()}/v2/sacred-journey`

// Reading Cycles (replaces weeklyReadings)
const cycles = defineCollection({
  loader: async () => {
    const res = await fetch(`${V2}/cycles/history?page=1&page_size=50`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.cycles ?? []).map((c: any) => ({ ...c, id: c.cycle_id }))
  },
  schema: z.object({
    cycle_id: z.string(),
    created_at: z.string(),
    completed_at: z.string().nullable(),
    entries_completed: z.number(),
    has_synthesis: z.boolean(),
  }),
})

// Active Cycles
const activeCycles = defineCollection({
  loader: async () => {
    const res = await fetch(`${V2}/cycles/active`)
    if (!res.ok) return []
    const data = await res.json()
    return (data.active_cycles ?? []).map((c: any) => ({ ...c, id: c.cycle_id }))
  },
  schema: z.object({
    cycle_id: z.string(),
    status: z.string(),
    created_at: z.string(),
    completed_at: z.string().nullable(),
  }),
})

export const collections = { cycles, activeCycles }
```

**Step 3: Commit**

```bash
git add src/content.config.ts
git commit -m "feat: update content collections to use V2 API endpoints"
```

---

## Task 5: Refactor index.astro (home page)

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Read the file**

Read `src/pages/index.astro` to understand the current structure.

**Step 2: Replace V1 `getCurrentSpread()` with V2 `getActiveCycles()` + `getCycleProgress()`**

The home page currently shows the active week and today's entry. In V2, it should show:
- The active cycle (if any), with current planet/sequence
- The current entry's status and what to do next

Key logic change:

```typescript
// V1
const spread = await sacredJourney.getCurrentSpread()

// V2
const { active_cycles } = await sacredJourney.getActiveCycles()
const activeCycle = active_cycles[0] ?? null
let progress = null
if (activeCycle) {
  progress = await sacredJourney.getCycleProgress(activeCycle.cycle_id)
}
const currentEntry = progress?.current_entry ?? null
```

**Step 3: Update the template**

Replace references to:
- `spread.today` → `currentEntry`
- `spread.week_start` → `activeCycle?.created_at`
- `spread.planetary_cards` → from `getCycle(activeCycle.cycle_id)`
- Day-of-week planet assignment → sequence number + planet name from `currentEntry.planet`
- `/practice/[date]` links → `/practice/[entry_id]` links

**Step 4: Verify page renders**

Run: `npm run dev`
Open: `http://localhost:4321/`
Expected: No build errors, home page displays active cycle or "Start your journey" prompt.

**Step 5: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: update home page to display V2 active cycle and current entry"
```

---

## Task 6: Refactor new-week.astro → new cycle creation

**Files:**
- Modify: `src/pages/practice/new-week.astro`

**Step 1: Read the file**

**Step 2: Update form and submission logic**

The core change: instead of `week_start` + day-of-week planetary card assignment, the user assigns one card per planet sequence position.

```typescript
// V1 payload
{
  week_start: "2025-01-05",
  planetary_cards: { Sunday: "The Sun", Monday: "The Moon", ... },
  domain_cards: { Body: "...", Mind: "...", Heart: "...", Spirit: "..." }
}

// V2 payload
{
  planetary_cards: { "1": "The Sun", "2": "The Moon", "3": "...", ... },
  domain_cards: { Physical: "...", Emotional: "...", Mental: "...", Spiritual: "..." }
}
```

Update the form fields:
- Remove `week_start` date input
- Replace 7 day-labeled inputs (Sunday–Saturday) with 7 planet-labeled inputs (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn)
- Replace domain card inputs from Body/Mind/Heart/Spirit to Physical/Emotional/Mental/Spiritual

Update form submission handler to call `sacredJourney.createCycle(...)`.

**Step 3: Update success redirect**

After creating a cycle, redirect to the cycle progress page:
```typescript
const cycle = await sacredJourney.createCycle(payload)
return Astro.redirect(`/practice/cycle/${cycle.cycle_id}`)
```

**Step 4: Verify page renders and submits**

Run: `npm run dev`
Navigate to: `/practice/new-week`
Fill out form and submit — verify redirect works.

**Step 5: Commit**

```bash
git add src/pages/practice/new-week.astro
git commit -m "feat: update new-week page for V2 cycle creation with planet-sequence card assignment"
```

---

## Task 7: Create cycle progress page

**Files:**
- Create: `src/pages/practice/cycle/[cycle_id].astro`

This is a new page with no V1 equivalent. It shows the 7-planet progression for an active cycle.

**Step 1: Create the file**

```astro
---
import { sacredJourney } from '../../../lib/sacred-journey'

const { cycle_id } = Astro.params
const progress = await sacredJourney.getCycleProgress(cycle_id!)

const PLANETS = ['Sun','Moon','Mars','Mercury','Jupiter','Venus','Saturn']
---

<html>
<body>
  <h1>Cycle Progress</h1>
  <p>Started: {new Date(progress.created_at).toLocaleDateString()}</p>

  <ol>
    {progress.entries.map(entry => (
      <li>
        <strong>Seq {entry.sequence}: {entry.planet}</strong>
        — {entry.status}
        {entry.status === 'available' && (
          <form method="POST" action={`/api/entries/${entry.entry_id}/begin`}>
            <button type="submit">Begin</button>
          </form>
        )}
        {entry.status === 'active' && (
          <a href={`/practice/entry/${entry.entry_id}`}>Continue</a>
        )}
        {entry.status === 'integrating' && (
          <a href={`/practice/integrate/${entry.entry_id}`}>Integrate</a>
        )}
        {entry.status === 'complete' && (
          <a href={`/history/entry/${entry.entry_id}`}>View</a>
        )}
      </li>
    ))}
  </ol>
</body>
</html>
```

**Step 2: Verify the page**

Navigate to a real cycle URL and verify the 7-entry list renders.

**Step 3: Commit**

```bash
git add src/pages/practice/cycle/[cycle_id].astro
git commit -m "feat: add cycle progress page showing 7-planet entry sequence"
```

---

## Task 8: Refactor practice/[date].astro → entry detail page

**Files:**
- Modify: `src/pages/practice/[date].astro` (rename parameter to `entry_id` via Astro's dynamic param)

**Step 1: Read the file**

**Step 2: Update Astro.params destructuring and API calls**

```typescript
// V1
const { date } = Astro.params
const context = await sacredJourney.getInterpretationContext(date)
const daily = await sacredJourney.getDailyInterpretations(date)

// V2
const { date: entry_id } = Astro.params  // Keep file named [date].astro, just rename usage
const entry = await sacredJourney.getEntry(entry_id!)
const context = await sacredJourney.getEntryContext(entry_id!)
const interps = await sacredJourney.getInterpretationsStatus(entry_id!)
```

**Step 3: Update template variables**

- `daily.planetary_card` → `entry.planetary_card`
- `daily.domain_cards` → `entry.domain_cards`
- `daily.interpretations` → `interps.interpretations`
- Status values: `prepared/ready/responded/complete` → `pending/responded/evaluated/complete`
- Navigation to `/practice/session/[date]` → `/practice/session/[entry_id]`
- Navigation to `/practice/prepare/[date]` → `/practice/prepare/[entry_id]`

**Step 4: Commit**

```bash
git add "src/pages/practice/[date].astro"
git commit -m "feat: update entry detail page for V2 ProgressionEntry"
```

---

## Task 9: Refactor practice/prepare/[date].astro

**Files:**
- Modify: `src/pages/practice/prepare/[date].astro`

**Step 1: Read the file**

**Step 2: Update API calls**

```typescript
// V1
const daily = await sacredJourney.getDailyInterpretations(date)
// Then PUT /prepare for each domain

// V2
const interps = await sacredJourney.getInterpretationsStatus(date!)  // date param = entry_id
// For each domain not yet prepared, call prepareInterpretation(entry_id, domain)
const DOMAINS: Domain[] = ['Physical', 'Emotional', 'Mental', 'Spiritual']
for (const domain of DOMAINS) {
  const existing = interps.interpretations.find(i => i.domain === domain)
  if (!existing || existing.status === 'pending') {
    await sacredJourney.prepareInterpretation(date!, domain)
  }
}
```

**Step 3: Update domain labels in template**

Change any hardcoded Body/Mind/Heart/Spirit labels to Physical/Emotional/Mental/Spiritual.

**Step 4: Commit**

```bash
git add "src/pages/practice/prepare/[date].astro"
git commit -m "feat: update prepare page for V2 interpretation preparation"
```

---

## Task 10: Refactor practice/session/[date].astro

**Files:**
- Modify: `src/pages/practice/session/[date].astro`

**Step 1: Read the file**

This is the main journaling session page where users respond to prompts and the synthesis is generated.

**Step 2: Update API calls**

The V1 `bulk-complete` endpoint does not exist in V2. Replace with sequential V2 calls:

```typescript
// V2 session completion flow (called client-side via form submissions or fetch):

// 1. For each domain interpretation, respond:
await sacredJourney.respondToInterpretation(interpId, responseText)

// 2. After all 4 domains responded, evaluate + complete each:
await sacredJourney.evaluateInterpretation(interpId, aiEvalText)
await sacredJourney.completeInterpretation(interpId)

// 3. Once all 4 complete, synthesize the entry:
await sacredJourney.synthesizeEntry(entryId, { synthesis_content: synthesisText })

// After synthesis, entry transitions to 'integrating'
// Redirect to integration page
```

**Step 3: Update template**

- Remove bulk-complete form/handler
- Add individual domain response forms
- Add synthesis submission at the end
- After successful synthesis, redirect to `/practice/integrate/[entry_id]`

**Step 4: Commit**

```bash
git add "src/pages/practice/session/[date].astro"
git commit -m "feat: update session page for V2 interpretation → synthesis flow"
```

---

## Task 11: Refactor practice/respond/[id].astro

**Files:**
- Modify: `src/pages/practice/respond/[id].astro`

**Step 1: Read the file**

**Step 2: Update API calls**

```typescript
// The interpretation ID is now the interp_id from V2
const { id: interpId } = Astro.params

// Load pending interpretations or load context by interp ID
// V2: POST /interpretations/{interp_id}/respond
await sacredJourney.respondToInterpretation(interpId!, responseText)
```

**Step 3: Update pending interpretation source**

V2 does not have a dedicated `/interpretation/pending` endpoint. Instead, check interpretations status:

For the pending page, get active cycles → get progress → find active entry → get interpretations status → filter for `status === 'pending'`.

**Step 4: Commit**

```bash
git add "src/pages/practice/respond/[id].astro"
git commit -m "feat: update respond page for V2 interpretation response endpoint"
```

---

## Task 12: Create integration page (new V2 feature)

**Files:**
- Create: `src/pages/practice/integrate/[entry_id].astro`

This page handles the `integrating` state: user can add integration notes, then advance the entry.

**Step 1: Create the file**

```astro
---
import { sacredJourney } from '../../../lib/sacred-journey'

const { entry_id } = Astro.params
const integration = await sacredJourney.getIntegrationStatus(entry_id!)
const entry = await sacredJourney.getEntry(entry_id!)

// Handle POST requests for adding notes or advancing
if (Astro.request.method === 'POST') {
  const formData = await Astro.request.formData()
  const action = formData.get('action') as string

  if (action === 'add_note') {
    const content = formData.get('content') as string
    await sacredJourney.addIntegrationNotes(entry_id!, content)
    return Astro.redirect(`/practice/integrate/${entry_id}`)
  }

  if (action === 'advance') {
    const result = await sacredJourney.advanceEntry(entry_id!)
    if (result.cycle_complete) {
      return Astro.redirect(`/practice/cycle/${result.next_entry ? '' : 'complete'}`)
    } else if (result.next_entry) {
      return Astro.redirect(`/practice/cycle/${entry.cycle_id}`)
    }
  }
}
---

<html>
<body>
  <h1>Integration: {entry.planet} Entry</h1>
  <p>You are in the integration phase. Reflect on what you've explored.</p>

  <h2>Notes ({integration.notes_count})</h2>
  <ul>
    {integration.notes.map(note => (
      <li>
        <time>{new Date(note.timestamp).toLocaleString()}</time>
        <p>{note.content}</p>
      </li>
    ))}
  </ul>

  <form method="POST">
    <input type="hidden" name="action" value="add_note" />
    <textarea name="content" placeholder="Add integration reflection..." required></textarea>
    <button type="submit">Add Note</button>
  </form>

  <form method="POST">
    <input type="hidden" name="action" value="advance" />
    <button type="submit">Complete Integration & Advance</button>
  </form>
</body>
</html>
```

**Step 2: Verify the page loads**

Navigate to an entry that is in `integrating` state.

**Step 3: Commit**

```bash
git add src/pages/practice/integrate/[entry_id].astro
git commit -m "feat: add integration phase page for V2 entry lifecycle"
```

---

## Task 13: Refactor practice/pending.astro

**Files:**
- Modify: `src/pages/practice/pending.astro`

**Step 1: Read the file**

**Step 2: Replace V1 pending endpoint with V2 logic**

V2 has no dedicated pending endpoint. Build the pending list from active cycles:

```typescript
const { active_cycles } = await sacredJourney.getActiveCycles()

const pendingInterpretations = []
for (const cycle of active_cycles) {
  const progress = await sacredJourney.getCycleProgress(cycle.cycle_id)
  const activeEntry = progress.current_entry
  if (activeEntry?.status === 'active') {
    const status = await sacredJourney.getInterpretationsStatus(activeEntry.entry_id)
    for (const interp of status.interpretations) {
      if (interp.status === 'pending' || interp.status === 'responded') {
        pendingInterpretations.push({ ...interp, entry_id: activeEntry.entry_id, planet: activeEntry.planet })
      }
    }
  }
}
```

**Step 3: Update template**

Link each pending item to `/practice/respond/[interpretation_id]`.

**Step 4: Commit**

```bash
git add src/pages/practice/pending.astro
git commit -m "feat: update pending page to derive pending list from V2 active cycle entries"
```

---

## Task 14: Refactor history/week/[start].astro → cycle history

**Files:**
- Modify: `src/pages/history/week/[start].astro`

The `[start]` param was a date string. In V2 it becomes a cycle ID.

**Step 1: Read the file**

**Step 2: Update to use getCycleTimeline**

```typescript
// V1
const { start } = Astro.params
const progress = await sacredJourney.getWeeklyProgress(start!)

// V2
const { start: cycle_id } = Astro.params
const timeline = await sacredJourney.getCycleTimeline(cycle_id!)
```

**Step 3: Update template**

- Remove week_start / week_end date display
- Show `timeline.created_at` and `timeline.completed_at`
- Replace day-of-week labels (Monday, Tuesday…) with planet names (Sun, Moon, Mars…)
- Show `timeline.entries` list with sequence, planet, synthesis status, interpretations count
- Show `planetary_cards` map (key is sequence number, not day name)
- Show `domain_cards` with updated domain names

**Step 4: Update navigation links from home/history pages**

In the history page (if it exists), change links from `/history/week/[date]` to `/history/cycle/[cycle_id]`.

Or, rename this file to `src/pages/history/cycle/[cycle_id].astro` and update all links accordingly.

**Step 5: Commit**

```bash
git add "src/pages/history/week/[start].astro"
git commit -m "feat: update history detail page for V2 cycle timeline"
```

---

## Task 15: Update history index page (if exists)

**Files:**
- Modify: `src/pages/history/index.astro` (if it exists) or any page listing history

**Step 1: Check for history index**

Run: `ls src/pages/history/`

**Step 2: Update to use V2 getCycleHistory**

```typescript
const history = await sacredJourney.getCycleHistory(1, 20)
// history.cycles — each has cycle_id, created_at, completed_at, entries_completed, has_synthesis
```

**Step 3: Update links**

Each cycle links to `/history/week/[cycle_id]` (or wherever the detail page is).

**Step 4: Commit**

```bash
git add src/pages/history/
git commit -m "feat: update history listing for V2 cycle history endpoint"
```

---

## Task 16: Final verification and cleanup

**Step 1: Search for remaining V1 endpoint references**

Run: `grep -r "sacred-journey/" src/ --include="*.ts" --include="*.astro" | grep -v "v2"`
Expected: Zero results.

**Step 2: Search for old domain names**

Run: `grep -r '"Body"\|"Mind"\|"Heart"\|"Spirit"' src/ --include="*.ts" --include="*.astro"`
Expected: Zero results (or only in comments).

**Step 3: Search for old date-based API patterns**

Run: `grep -r "week_start\|day_of_week\|entry_date" src/ --include="*.ts" --include="*.astro"`
Expected: Zero results.

**Step 4: Build the site**

Run: `npm run build`
Expected: Build completes with no TypeScript errors.

**Step 5: Delete old test files (if replaced)**

If `test-history.mjs` and `test-weekly.mjs` are no longer relevant, delete them:
```bash
rm test-history.mjs test-weekly.mjs
git add -u
```

**Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete V2 API migration — replace all V1 calendar-based endpoints with V2 archetypal-progression endpoints"
```

---

## Summary of All Changes

| File | Action | Key Change |
|------|--------|-----------|
| `src/lib/api-config.ts` | Modify | Add `V2_PREFIX` constant |
| `src/lib/sacred-journey.ts` | Rewrite | New V2 types + client methods |
| `src/lib/domain-utils.ts` | Modify | Body/Mind/Heart/Spirit → Physical/Emotional/Mental/Spiritual |
| `src/content.config.ts` | Modify | Use V2 cycle endpoints |
| `src/pages/index.astro` | Modify | Active cycles instead of current spread |
| `src/pages/practice/new-week.astro` | Modify | Create cycle with planet-sequence cards |
| `src/pages/practice/cycle/[cycle_id].astro` | Create | New 7-planet progress page |
| `src/pages/practice/[date].astro` | Modify | Entry detail via entry_id |
| `src/pages/practice/prepare/[date].astro` | Modify | V2 prepare interpretation |
| `src/pages/practice/session/[date].astro` | Modify | V2 respond → evaluate → synthesize flow |
| `src/pages/practice/respond/[id].astro` | Modify | V2 respond endpoint |
| `src/pages/practice/integrate/[entry_id].astro` | Create | New integration phase page |
| `src/pages/practice/pending.astro` | Modify | Derive pending from active cycles |
| `src/pages/history/week/[start].astro` | Modify | Cycle timeline via cycle_id |
