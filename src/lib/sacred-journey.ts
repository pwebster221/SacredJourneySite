/**
 * Sacred Journey API Client — V2
 *
 * Type-safe client for interacting with the V2 Sacred Journey API.
 * Used by Astro pages and API routes.
 */

import { API_BASE, V2_PREFIX } from './api-config'
import type { DomainKey } from './domain-utils'

// ============================================================
// V2 Types
// ============================================================

export type EntryStatus = 'available' | 'active' | 'integrating' | 'complete'
export type InterpretationStatus = 'pending' | 'responded' | 'evaluated' | 'complete'
export type CycleStatus = 'active' | 'complete'
export type Domain = DomainKey

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

// ============================================================
// API Client
// ============================================================

export class SacredJourneyClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private url(path: string) {
    return `${this.baseUrl}${V2_PREFIX}${path}`
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

export const sacredJourney = new SacredJourneyClient(API_BASE)
