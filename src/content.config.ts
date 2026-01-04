/**
 * Paths of Reverence - Content Collections Configuration
 * 
 * Collections for Sacred Journey integration with Neo4j middleware API.
 */

import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const API_BASE = 'https://neo4jmiddleware.robin-alligator.ts.net';

// =============================================================================
// Shared Schemas
// =============================================================================

const weekStatusSchema = z.enum(['active', 'complete']);

const chartConfigurationSchema = z.object({
  name: z.string(),
  planets: z.array(z.string()),
  meaning: z.string(),
});

const activeIntentionSchema = z.object({
  intention_id: z.string(),
  theme: z.string(),
  question: z.string(),
  started: z.coerce.date(),
  active: z.boolean().default(true),
});

const interpretedChartSchema = z.object({
  sun_sign: z.string(),
  moon_sign: z.string(),
  rising_sign: z.string(),
  ic_sign: z.string(),
  ic_themes: z.array(z.string()).optional(),
  configurations: z.array(chartConfigurationSchema).optional(),
  notable_placements: z.record(z.string()).optional(),
});

// =============================================================================
// Weekly Reading Collection (from /history endpoint - summary data)
// =============================================================================

const weeklyReadingsSchema = z.object({
  reading_id: z.string(),
  week_start: z.coerce.date(),
  week_end: z.coerce.date().optional(),
  status: weekStatusSchema,
  days_complete: z.number().default(0),
  total_interpretations: z.number().default(0),
  weekly_synthesis: z.string().nullable().optional(),
});

const weeklyReadings = defineCollection({
  loader: async () => {
    try {
      const response = await fetch(`${API_BASE}/sacred-journey/history?limit=50&include_entries=false`);
      if (!response.ok) {
        console.warn(`Failed to fetch weekly readings: ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      return (data.readings || []).map((reading: any) => ({
        id: reading.reading_id,
        ...reading,
      }));
    } catch (error) {
      console.error('Error loading weekly readings:', error);
      return [];
    }
  },
  schema: weeklyReadingsSchema,
});

// =============================================================================
// Daily Entry Collection (from /history with include_entries=true)
// =============================================================================

const dailyEntriesSchema = z.object({
  entry_id: z.string(),
  date: z.coerce.date(),
  day_of_week: z.string(),
  planetary_card: z.string(),
  synthesis: z.string().nullable().optional(),
  interpretations_count: z.number().optional(),
  status: weekStatusSchema.optional(),
});

const dailyEntries = defineCollection({
  loader: async () => {
    try {
      const response = await fetch(`${API_BASE}/sacred-journey/history?limit=30&include_entries=true`);
      if (!response.ok) {
        console.warn(`Failed to fetch daily entries: ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      return (data.recent_entries || []).map((entry: any) => ({
        id: entry.entry_id,
        ...entry,
      }));
    } catch (error) {
      console.error('Error loading daily entries:', error);
      return [];
    }
  },
  schema: dailyEntriesSchema,
});

// =============================================================================
// Pending Interpretations Collection
// =============================================================================

const interpretationsSchema = z.object({
  interpretation_id: z.string(),
  date: z.coerce.date(),
  domain: z.string(),
  introspection_question: z.string(),
  created_at: z.coerce.date(),
});

const interpretations = defineCollection({
  loader: async () => {
    try {
      const response = await fetch(`${API_BASE}/sacred-journey/interpretation/pending`);
      if (!response.ok) {
        console.warn(`Failed to fetch interpretations: ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      return (data.pending || []).map((interp: any) => ({
        id: interp.interpretation_id,
        ...interp,
      }));
    } catch (error) {
      console.error('Error loading interpretations:', error);
      return [];
    }
  },
  schema: interpretationsSchema,
});

// =============================================================================
// Users Collection
// =============================================================================

const usersSchema = z.object({
  user_id: z.string(),
  username: z.string(),
});

const users = defineCollection({
  loader: async () => {
    try {
      const response = await fetch(`${API_BASE}/sacred-journey/users`);
      if (!response.ok) {
        console.warn(`Failed to fetch users: ${response.status}`);
        return [];
      }
      const data = await response.json();
      
      return (data.users || []).map((user: any) => ({
        id: user.user_id,
        ...user,
      }));
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  },
  schema: usersSchema,
});

// =============================================================================
// Export Collections
// =============================================================================

export const collections = {
  weeklyReadings,
  dailyEntries,
  interpretations,
  users,
};
