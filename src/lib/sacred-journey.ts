/**
 * Sacred Journey API Client
 * 
 * Type-safe client for interacting with the Neo4j middleware API.
 * Used by Astro pages and API routes for mutations (responses, new readings, etc.)
 */

const API_BASE = import.meta.env.PUBLIC_API_BASE || 'https://neo4jmiddleware.robin-alligator.ts.net';

// =============================================================================
// Type Definitions (matching API schemas)
// =============================================================================

export interface WeeklyReadingRequest {
  week_start: string; // ISO date
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

export interface DailyEntryResponse {
  entry_id: string;
  date: string;
  day_of_week: string;
  planetary_card: string;
  domains: string[];
  interpretation_ids: Record<string, string>;
}

export interface InterpretationContext {
  entry_id: string;
  planetary_ruler: string;
  yesterday_synthesis: string | null;
  lastweek_synthesis: string | null;
  transits: Record<string, any>[];
  domain_cards: Record<string, string>;
  user_context: UserContextBlock | null;
  user_context_prompt: string | null;
}

export interface UserContextBlock {
  interpreted_chart: InterpretedChart | null;
  spiritual_identity: string | null;
  active_intentions: ActiveIntention[];
  transit_focus: string[];
}

export interface InterpretedChart {
  sun_sign: string;
  moon_sign: string;
  rising_sign: string;
  ic_sign: string;
  ic_themes?: string[];
  configurations?: ChartConfiguration[];
  notable_placements?: Record<string, string>;
}

export interface ChartConfiguration {
  name: string;
  planets: string[];
  meaning: string;
}

export interface ActiveIntention {
  intention_id: string;
  theme: string;
  question: string;
  started: string;
  active: boolean;
}

export interface CurrentSpread {
  reading_id: string;
  week_start: string;
  week_status: 'active' | 'complete';
  planetary_cards: Record<string, string>;
  domain_cards: Record<string, string>;
  today: CurrentDailySpread | null;
  days_complete: number;
  message?: string;
}

export interface CurrentDailySpread {
  entry_id: string;
  date: string;
  day_of_week: string;
  planetary_card: string;
  domain_cards: Record<string, string>;
  interpretations: CurrentInterpretation[];
  synthesis: string | null;
  status: 'active' | 'complete';
}

export interface CurrentInterpretation {
  interpretation_id: string;
  domain: string;
  status: 'prepared' | 'ready' | 'responded' | 'complete';
  prepared_interpretation?: string;
  introspection_question?: string;
  response?: string;
  domain_eval?: string;
}

export interface PendingInterpretation {
  interpretation_id: string;
  date: string;
  domain: string;
  introspection_question: string;
  created_at: string;
}

// =============================================================================
// API Client
// =============================================================================

class SacredJourneyClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE) {
    this.baseUrl = baseUrl;
  }

  // Weekly Reading Operations
  async createWeeklyReading(request: WeeklyReadingRequest) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/weekly-reading/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error(`Failed to create weekly reading: ${response.status}`);
    return response.json();
  }

  async getWeeklyProgress(weekStart: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/weekly/${weekStart}/progress`);
    if (!response.ok) throw new Error(`Failed to get weekly progress: ${response.status}`);
    return response.json();
  }

  async getCurrentSpread(): Promise<CurrentSpread> {
    const response = await fetch(`${this.baseUrl}/sacred-journey/current-spread`);
    if (!response.ok) throw new Error(`Failed to get current spread: ${response.status}`);
    return response.json();
  }

  // Daily Entry Operations
  async beginDailyEntry(entryDate?: string): Promise<DailyEntryResponse> {
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/begin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry_date: entryDate }),
    });
    if (!response.ok) throw new Error(`Failed to begin daily entry: ${response.status}`);
    return response.json();
  }

  async getInterpretationContext(entryDate: string, userId?: string): Promise<InterpretationContext> {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/${entryDate}/context?${params}`);
    if (!response.ok) throw new Error(`Failed to get interpretation context: ${response.status}`);
    return response.json();
  }

  async addTransits(entryDate: string, transits: Record<string, any>[]) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/${entryDate}/transits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transits }),
    });
    if (!response.ok) throw new Error(`Failed to add transits: ${response.status}`);
    return response.json();
  }

  async createDailySynthesis(entryDate: string, synthesisContent?: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/${entryDate}/synthesize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ synthesis_content: synthesisContent }),
    });
    if (!response.ok) throw new Error(`Failed to create daily synthesis: ${response.status}`);
    return response.json();
  }

  // Interpretation Operations
  async prepareInterpretation(interpretationId: string, preparedInterpretation: string, introspectionQuestion: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/interpretation/${interpretationId}/prepare`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prepared_interpretation: preparedInterpretation, introspection_question: introspectionQuestion }),
    });
    if (!response.ok) throw new Error(`Failed to prepare interpretation: ${response.status}`);
    return response.json();
  }

  async respondToInterpretation(interpretationId: string, userResponse: string) {
    const apiResponse = await fetch(`${this.baseUrl}/sacred-journey/daily/interpretation/${interpretationId}/respond`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response: userResponse }),
    });
    if (!apiResponse.ok) throw new Error(`Failed to respond to interpretation: ${apiResponse.status}`);
    return apiResponse.json();
  }

  async evaluateInterpretation(interpretationId: string, domainEval: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/daily/interpretation/${interpretationId}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain_eval: domainEval }),
    });
    if (!response.ok) throw new Error(`Failed to evaluate interpretation: ${response.status}`);
    return response.json();
  }

  async getPendingInterpretations(): Promise<{ pending: PendingInterpretation[] }> {
    const response = await fetch(`${this.baseUrl}/sacred-journey/interpretation/pending`);
    if (!response.ok) throw new Error(`Failed to get pending interpretations: ${response.status}`);
    return response.json();
  }

  // Profile Operations
  async getUserContextBlock(userId: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/profile/${userId}/context-block`);
    if (!response.ok) throw new Error(`Failed to get user context block: ${response.status}`);
    return response.json();
  }

  async getProfileStatistics(userId: string) {
    const response = await fetch(`${this.baseUrl}/sacred-journey/profile/${userId}`);
    if (!response.ok) throw new Error(`Failed to get profile statistics: ${response.status}`);
    return response.json();
  }

  // History Operations
  async getHistoryArchive(limit: number = 10, includeEntries: boolean = false) {
    const params = new URLSearchParams({ limit: limit.toString(), include_entries: includeEntries.toString() });
    const response = await fetch(`${this.baseUrl}/sacred-journey/history?${params}`);
    if (!response.ok) throw new Error(`Failed to get history archive: ${response.status}`);
    return response.json();
  }

  // Health Check
  async healthCheck() {
    const response = await fetch(`${this.baseUrl}/health`);
    return response.ok;
  }
}

export const sacredJourney = new SacredJourneyClient();
export { SacredJourneyClient };
