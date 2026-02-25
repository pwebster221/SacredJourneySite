// Content collections backed by V2 Sacred Journey API.
// cycles: paginated completed cycle history (50 most recent)
// activeCycles: all in-progress cycles
// Set PUBLIC_API_BASE in .env to override the production URL for local dev.
import { defineCollection, z } from 'astro:content'
import { API_BASE, V2_PREFIX } from './lib/api-config'

const V2 = `${API_BASE}${V2_PREFIX}`

// Completed cycles history
const cycles = defineCollection({
  loader: async () => {
    try {
      // Fetches the 50 most recent completed cycles; older entries are not loaded.
      const res = await fetch(`${V2}/cycles/history?page=1&page_size=50`)
      if (!res.ok) {
        console.warn(`[content] cycles/history fetch failed: ${res.status}`)
        return []
      }
      const data = await res.json()
      return (data.cycles ?? []).map((c: any) => ({ ...c, id: c.cycle_id }))
    } catch (err) {
      console.error('[content] cycles/history loader error:', err)
      return []
    }
  },
  schema: z.object({
    cycle_id: z.string(),
    created_at: z.string(),
    completed_at: z.string().nullable(),
    entries_completed: z.number(),
    has_synthesis: z.boolean(),
  }),
})

// Active (in-progress) cycles
const activeCycles = defineCollection({
  loader: async () => {
    try {
      const res = await fetch(`${V2}/cycles/active`)
      if (!res.ok) {
        console.warn(`[content] cycles/active fetch failed: ${res.status}`)
        return []
      }
      const data = await res.json()
      return (data.active_cycles ?? []).map((c: any) => ({ ...c, id: c.cycle_id }))
    } catch (err) {
      console.error('[content] cycles/active loader error:', err)
      return []
    }
  },
  schema: z.object({
    cycle_id: z.string(),
    status: z.string(),
    created_at: z.string(),
    completed_at: z.string().nullable(),
    // message and *_detail fields are always null in V2 API responses;
    // pages that need card details should fetch /cycles/{id} directly.
    message: z.string().optional(),
    planetary_cards_detail: z.unknown().nullable().optional(),
    domain_cards_detail: z.unknown().nullable().optional(),
  }),
})

export const collections = { cycles, activeCycles }
