import { defineCollection, z } from 'astro:content'
import { API_BASE, V2_PREFIX } from './lib/api-config'

const V2 = `${API_BASE}${V2_PREFIX}`

// Completed cycles history
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

// Active (in-progress) cycles
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
