# Sacred Journey V2 API Reference

## Overview

The V2 API implements a **progression-based archetypal time architecture** using Neo4j graph database. It replaces calendar-based weekly readings with a 7-planet archetypal cycle system.

**Base URL:** `/v2/sacred-journey`  
**Total Endpoints:** 31  
**Authentication:** None required (development mode)

---

## Core Concepts

### Reading Cycle
A complete journey through 7 archetypal planetary energies:
1. **Sun** (Sequence 1) — Identity, vitality, core self
2. **Moon** (Sequence 2) — Emotions, intuition, inner world
3. **Mars** (Sequence 3) — Action, drive, courage
4. **Mercury** (Sequence 4) — Communication, intellect, learning
5. **Jupiter** (Sequence 5) — Expansion, wisdom, abundance
6. **Venus** (Sequence 6) — Love, values, beauty
7. **Saturn** (Sequence 7) — Structure, discipline, mastery

### Progression Entry
Each entry within a cycle follows a state machine:
```
available → active → integrating → complete
```

### Interpretation Pipeline
Each entry explores 4 domains, each following:
```
pending → responded → evaluated → complete
```

**Domains:**
- **Physical** — Body, health, material world
- **Emotional** — Feelings, relationships, heart
- **Mental** — Thoughts, ideas, mind
- **Spiritual** — Soul, purpose, transcendence

### Cards
- **Planetary Cards** — 7 cards mapped to planets (sequences 1-7)
- **Domain Cards** — 4 cards mapped to interpretation domains

---

## Module Summary

| Module | Endpoints | Prefix |
|--------|-----------|--------|
| Cycles | 7 | `/cycles` |
| Entries | 6 | `/entries` |
| Interpretations | 5 | `/interpretations` |
| Context | 3 | `/context` |
| Profiles | 6 | `/profiles` |
| History | 4 | `/history` |

---

## Cycles Module (7 endpoints)

### POST /cycles/create
Create a new reading cycle with 7 progression entries.

**Request Body:**
```json
{
  "planetary_cards": {
    "1": "The Sun",
    "2": "The Moon",
    "3": "The Tower",
    "4": "The Magician",
    "5": "Wheel of Fortune",
    "6": "The Empress",
    "7": "The World"
  },
  "domain_cards": {
    "Physical": "Ace of Pentacles",
    "Emotional": "Two of Cups",
    "Mental": "Three of Swords",
    "Spiritual": "Four of Wands"
  },
  "user_id": "optional-user-id"
}
```

**Response (200):**
```json
{
  "cycle_id": "2965264e-3b20-4547-8b7b-ca9707737fb8",
  "created_at": "2026-02-18T03:15:13.672000",
  "completed_at": null,
  "status": "active",
  "message": "Reading cycle created successfully",
  "planetary_cards_detail": null,
  "domain_cards_detail": null
}
```

### GET /cycles/active
Retrieve all active (incomplete) cycles.

**Response (200):**
```json
{
  "active_cycles": [
    {
      "cycle_id": "2965264e-...",
      "created_at": "2026-02-18T03:15:13.672000",
      "completed_at": null,
      "status": "active",
      "message": "Active cycle",
      "planetary_cards_detail": null,
      "domain_cards_detail": null
    }
  ],
  "count": 10
}
```

### GET /cycles/history?page=1&page_size=10
Retrieve paginated history of completed cycles.

**Query Parameters:**
- `page` (int, default: 1) — Page number
- `page_size` (int, default: 10) — Items per page

**Response (200):**
```json
{
  "cycles": [
    {
      "cycle_id": "f62251d8-...",
      "created_at": "2025-12-28T00:00:00",
      "completed_at": "2026-01-04T00:00:00",
      "entries_completed": 7,
      "has_synthesis": true
    }
  ],
  "total": 1,
  "page": 1,
  "page_size": 10
}
```

### GET /cycles/{cycle_id}
Retrieve a specific cycle by ID.

**Path Parameters:**
- `cycle_id` (string, required) — UUID of the cycle

**Response (200):** Same as `ReadingCycleResponse` (see POST /cycles/create)

**Response (404):**
```json
{"detail": "Cycle not found"}
```

### GET /cycles/{cycle_id}/progress
Retrieve cycle progress with entry status breakdown.

**Response (200):**
```json
{
  "cycle_id": "2965264e-...",
  "status": "active",
  "created_at": "2026-02-18T03:15:13.672000",
  "completed_at": null,
  "entries": [
    {
      "entry_id": "a1b2c3d4-...",
      "sequence": 1,
      "planet": "Sun",
      "status": "complete",
      "started_at": "2026-02-18T04:00:00",
      "completed_at": "2026-02-18T12:00:00"
    },
    {
      "entry_id": "e5f6g7h8-...",
      "sequence": 2,
      "planet": "Moon",
      "status": "active",
      "started_at": "2026-02-18T13:00:00",
      "completed_at": null
    }
  ],
  "current_entry": {
    "entry_id": "e5f6g7h8-...",
    "sequence": 2,
    "planet": "Moon",
    "status": "active",
    "started_at": "2026-02-18T13:00:00",
    "completed_at": null
  }
}
```

### POST /cycles/{cycle_id}/synthesize
Create a synthesis for a completed cycle (all 7 entries must be complete).

**Request Body:**
```json
{
  "synthesis_content": "This cycle revealed a progression from solar identity work through lunar emotional depths...",
  "themes": ["transformation", "integration", "surrender"],
  "insights": "The Saturn completion brought full-circle awareness of the Sun's initial impulse."
}
```

**Response (200):**
```json
{
  "cycle_id": "2965264e-...",
  "synthesis_id": "synth-uuid-...",
  "created_at": "2026-02-18T15:00:00",
  "message": "Cycle synthesis created successfully"
}
```

### GET /cycles/{cycle_id}/synthesis
Retrieve synthesis for a cycle.

**Response (200):**
```json
{
  "synthesis_id": "synth-uuid-...",
  "cycle_id": "2965264e-...",
  "content": "This cycle revealed a progression from solar identity work...",
  "themes": ["transformation", "integration", "surrender"],
  "insights": "The Saturn completion brought full-circle awareness...",
  "created_at": "2026-02-18T15:00:00"
}
```

---

## Entries Module (6 endpoints)

### POST /entries/{entry_id}/begin
Begin an entry (transitions from `available` → `active`).

**Path Parameters:**
- `entry_id` (string, required) — UUID of the entry

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 1,
  "planet": "Sun",
  "status": "active",
  "cycle_id": "2965264e-...",
  "started_at": "2026-02-18T04:00:00",
  "completed_at": null,
  "planetary_card": "The Sun",
  "domain_cards": {
    "Physical": "Ace of Pentacles",
    "Emotional": "Two of Cups",
    "Mental": "Three of Swords",
    "Spiritual": "Four of Wands"
  },
  "planetary_card_detail": null,
  "domain_cards_detail": null,
  "message": "Entry began successfully"
}
```

**Error (400):**
```json
{"detail": "Invalid state transition: entry is not available"}
```

### GET /entries/{entry_id}
Retrieve an entry by ID.

**Response (200):** Same as `ProgressionEntryResponse` above.

### POST /entries/{entry_id}/synthesize
Create synthesis for an active entry (transitions to `integrating`).

**Request Body:**
```json
{
  "synthesis_content": "Today's Sun entry revealed themes of self-identity and creative expression...",
  "insights": "Connection between The Sun card and current solar transit amplifies..."
}
```

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "synthesis_id": "entry-synth-uuid-...",
  "status": "integrating",
  "created_at": "2026-02-18T10:00:00",
  "message": "Entry synthesis created, entry moved to integrating state"
}
```

### POST /entries/{entry_id}/integration-notes
Add integration notes during the integrating phase.

**Request Body:**
```json
{
  "content": "Reflecting further on the solar themes — noticing how they connect to yesterday's dreams...",
  "timestamp": "2026-02-18T14:30:00"
}
```

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "notes_count": 3,
  "latest_note": {
    "timestamp": "2026-02-18T14:30:00",
    "content": "Reflecting further on the solar themes..."
  },
  "message": "Integration notes added successfully"
}
```

### GET /entries/{entry_id}/integration
Retrieve integration status and all notes.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 1,
  "planet": "Sun",
  "status": "integrating",
  "started_at": "2026-02-18T04:00:00",
  "notes": [
    {"timestamp": "2026-02-18T11:00:00", "content": "First reflection..."},
    {"timestamp": "2026-02-18T14:30:00", "content": "Deeper insight..."}
  ],
  "notes_count": 2,
  "time_integrating_seconds": 14400,
  "message": "Integration status retrieved"
}
```

### POST /entries/{entry_id}/advance
Advance entry from `integrating` → `complete`. If sequence is 7 (Saturn), completes the cycle.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 1,
  "planet": "Sun",
  "status": "complete",
  "completed_at": "2026-02-18T18:00:00",
  "next_entry": {
    "entry_id": "e5f6g7h8-...",
    "sequence": 2,
    "planet": "Moon"
  },
  "cycle_complete": false,
  "message": "Entry advanced to complete"
}
```

---

## Interpretations Module (5 endpoints)

### POST /interpretations/{entry_id}/prepare
Prepare interpretation context for a domain. Creates an interpretation node.

**Request Body:**
```json
{
  "domain": "Physical",
  "user_id": "optional-user-id"
}
```

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "interpretation_id": "interp-uuid-...",
  "domain": "Physical",
  "sequence": 1,
  "planet": "Sun",
  "planetary_card": "The Sun",
  "domain_card": "Ace of Pentacles",
  "previous_synthesis": "Yesterday's synthesis content...",
  "same_planet_previous_cycle_synthesis": null,
  "transits": [],
  "user_context": null,
  "status": "pending",
  "created_at": "2026-02-18T04:30:00",
  "message": "Interpretation context prepared"
}
```

### POST /interpretations/{interp_id}/respond
Submit user's response to the interpretation prompt.

**Request Body:**
```json
{
  "response_text": "The Sun card speaks to my physical vitality today. I feel a surge of energy..."
}
```

**Response (200):**
```json
{
  "interpretation_id": "interp-uuid-...",
  "domain": "Physical",
  "status": "responded",
  "responded_at": "2026-02-18T05:00:00",
  "message": "Response submitted successfully"
}
```

### POST /interpretations/{interp_id}/evaluate
Submit AI evaluation of user's response.

**Request Body:**
```json
{
  "evaluation_text": "Your connection between solar vitality and physical energy shows deep awareness...",
  "insights": ["solar-body connection", "creative energy channeling"]
}
```

**Response (200):**
```json
{
  "interpretation_id": "interp-uuid-...",
  "domain": "Physical",
  "status": "evaluated",
  "evaluated_at": "2026-02-18T05:05:00",
  "message": "Response evaluated successfully"
}
```

### POST /interpretations/{interp_id}/complete
Mark an interpretation as complete.

**Response (200):**
```json
{
  "interpretation_id": "interp-uuid-...",
  "domain": "Physical",
  "status": "complete",
  "completed_at": "2026-02-18T05:10:00",
  "remaining_domains": 3,
  "all_complete": false,
  "message": "Interpretation marked complete"
}
```

### GET /interpretations/{entry_id}/status
Get status of all 4 domain interpretations for an entry.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 1,
  "planet": "Sun",
  "interpretations": [
    {
      "interpretation_id": "interp-1-...",
      "domain": "Physical",
      "status": "complete",
      "created_at": "2026-02-18T04:30:00",
      "responded_at": "2026-02-18T05:00:00",
      "evaluated_at": "2026-02-18T05:05:00",
      "completed_at": "2026-02-18T05:10:00"
    },
    {
      "interpretation_id": "interp-2-...",
      "domain": "Emotional",
      "status": "pending",
      "created_at": "2026-02-18T04:30:00",
      "responded_at": null,
      "evaluated_at": null,
      "completed_at": null
    }
  ],
  "all_complete": false,
  "completion_count": 1,
  "message": "Interpretation status retrieved"
}
```

---

## Context Module (3 endpoints)

### GET /context/{entry_id}
Full entry context with cards, graph-traversed historical context, and transits.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 2,
  "planet": "Moon",
  "cycle_id": "2965264e-...",
  "planetary_card": "The Moon",
  "domain_cards": {
    "Physical": "Ace of Pentacles",
    "Emotional": "Two of Cups",
    "Mental": "Three of Swords",
    "Spiritual": "Four of Wands"
  },
  "previous_entry": {
    "entry_id": "prev-entry-uuid-...",
    "sequence": 1,
    "planet": "Sun",
    "synthesis": "Yesterday's synthesis content...",
    "completed_at": "2026-02-18T12:00:00"
  },
  "same_planet_previous_cycle": {
    "entry_id": "old-moon-uuid-...",
    "cycle_id": "old-cycle-uuid-...",
    "sequence": 2,
    "planet": "Moon",
    "synthesis": "Last cycle's Moon synthesis...",
    "completed_at": "2025-12-30T00:00:00"
  },
  "transits": [
    {
      "planet": "Moon",
      "aspect_type": "conjunction",
      "natal_planet": "Venus",
      "orb": 0.5,
      "is_exact": true
    }
  ],
  "transit_snapshot_id": "transit-uuid-...",
  "message": "Context retrieved successfully"
}
```

### GET /context/{entry_id}/transits
Get transit snapshot for an entry.

**Response (200):**
```json
{
  "snapshot_id": "transit-uuid-...",
  "entry_id": "a1b2c3d4-...",
  "captured_at": "2026-02-18T04:00:00",
  "transits": [
    {
      "planet": "Moon",
      "aspect_type": "conjunction",
      "natal_planet": "Venus",
      "orb": 0.5,
      "is_exact": true
    }
  ],
  "transit_count": 1
}
```

### GET /context/{entry_id}/connections
Get connected entries via graph relationships.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "sequence": 2,
  "planet": "Moon",
  "previous_in_sequence": {
    "entry_id": "prev-uuid-...",
    "sequence": 1,
    "planet": "Sun",
    "synthesis": "Sun entry synthesis...",
    "completed_at": "2026-02-18T12:00:00"
  },
  "same_planet_last_cycle": null,
  "message": "Connections retrieved successfully"
}
```

---

## Profiles Module (6 endpoints)

### GET /profiles/{user_id}
Get user progression profile with active cycle summaries.

**Path Parameters:**
- `user_id` (string, required) — User identifier

**Response (200):**
```json
{
  "user": {
    "user_id": "paul-123",
    "username": "paulwebster",
    "first_name": "Paul",
    "last_name": "Webster",
    "email": "paul@example.com",
    "created_at": "2025-11-01T00:00:00"
  },
  "active_cycles": [
    {
      "cycle_id": "2965264e-...",
      "status": "active",
      "current_sequence": 3,
      "current_planet": "Mars",
      "entries_completed": 2,
      "started_at": "2026-02-18T03:15:13"
    }
  ],
  "total_cycles_completed": 1,
  "total_entries_completed": 14,
  "journey_start_date": "2025-11-01",
  "last_activity_at": "2026-02-18T14:00:00"
}
```

### POST /profiles/{user_id}
Update user profile metadata.

**Request Body:**
```json
{
  "first_name": "Paul",
  "last_name": "Webster",
  "email": "paul@example.com",
  "bio": "Exploring archetypal patterns through sacred journey.",
  "timezone": "America/New_York"
}
```

**Response (200):**
```json
{
  "user_id": "paul-123",
  "updated_fields": ["first_name", "last_name", "email", "bio", "timezone"],
  "message": "Profile updated successfully"
}
```

### GET /profiles/{user_id}/statistics
Extended progression statistics with planet and domain breakdowns.

**Response (200):**
```json
{
  "user_id": "paul-123",
  "total_cycles": 3,
  "completed_cycles": 1,
  "active_cycles": 2,
  "total_entries": 21,
  "completed_entries": 14,
  "average_integration_hours": 6.5,
  "planet_statistics": [
    {
      "planet": "Sun",
      "entries_completed": 2,
      "average_integration_hours": 5.0,
      "total_interpretations": 8
    },
    {
      "planet": "Moon",
      "entries_completed": 2,
      "average_integration_hours": 7.0,
      "total_interpretations": 8
    }
  ],
  "domain_statistics": [
    {
      "domain": "Physical",
      "total_completed": 14,
      "average_response_length": 350
    },
    {
      "domain": "Emotional",
      "total_completed": 14,
      "average_response_length": 420
    },
    {
      "domain": "Mental",
      "total_completed": 14,
      "average_response_length": 380
    },
    {
      "domain": "Spiritual",
      "total_completed": 14,
      "average_response_length": 400
    }
  ],
  "total_interpretations": 56,
  "completed_interpretations": 56,
  "journey_start_date": "2025-11-01",
  "most_recent_completion": "2026-02-18T12:00:00",
  "current_streak_days": 5
}
```

### GET /profiles/{user_id}/achievements
Gamification achievements and milestones.

**Response (200):**
```json
{
  "user_id": "paul-123",
  "achievements": [
    {
      "achievement_id": "first-cycle",
      "name": "First Cycle Complete",
      "description": "Completed your first 7-planet reading cycle",
      "category": "cycles",
      "earned_at": "2026-01-04T00:00:00",
      "progress": 1.0,
      "is_complete": true
    },
    {
      "achievement_id": "streak-7",
      "name": "Week Warrior",
      "description": "Maintained a 7-day activity streak",
      "category": "streaks",
      "earned_at": null,
      "progress": 0.71,
      "is_complete": false
    }
  ],
  "total_earned": 5,
  "total_available": 20,
  "recent_achievement": {
    "achievement_id": "first-cycle",
    "name": "First Cycle Complete",
    "description": "Completed your first 7-planet reading cycle",
    "category": "cycles",
    "earned_at": "2026-01-04T00:00:00",
    "progress": 1.0,
    "is_complete": true
  }
}
```

### GET /profiles/{user_id}/settings
Get user preferences and settings.

**Response (200):**
```json
{
  "user_id": "paul-123",
  "notifications": {
    "email_notifications": true,
    "reminder_frequency": "weekly",
    "integration_reminders": true
  },
  "display": {
    "theme": "dark",
    "show_planetary_symbols": true,
    "compact_view": false
  },
  "privacy": {
    "profile_visibility": "private",
    "share_statistics": false
  },
  "timezone": "America/New_York",
  "language": "en",
  "updated_at": "2026-02-18T10:00:00"
}
```

### POST /profiles/{user_id}/settings
Update user settings. Only include sections you want to change.

**Request Body:**
```json
{
  "notifications": {
    "email_notifications": false,
    "reminder_frequency": "daily",
    "integration_reminders": true
  },
  "display": {
    "theme": "dark"
  },
  "timezone": "America/Los_Angeles"
}
```

**Response (200):**
```json
{
  "user_id": "paul-123",
  "updated_sections": ["notifications", "display", "timezone"],
  "message": "Settings updated successfully"
}
```

---

## History Module (4 endpoints)

### GET /history/cycles/{cycle_id}
Complete timeline view of a cycle with all entries.

**Response (200):**
```json
{
  "cycle_id": "2965264e-...",
  "status": "complete",
  "created_at": "2025-12-28T00:00:00",
  "completed_at": "2026-01-04T00:00:00",
  "entries": [
    {
      "entry_id": "entry-1-uuid-...",
      "sequence": 1,
      "planet": "Sun",
      "status": "complete",
      "started_at": "2025-12-28T08:00:00",
      "completed_at": "2025-12-28T20:00:00",
      "has_synthesis": true,
      "interpretations_completed": 4,
      "integration_notes_count": 2
    },
    {
      "entry_id": "entry-2-uuid-...",
      "sequence": 2,
      "planet": "Moon",
      "status": "complete",
      "started_at": "2025-12-29T08:00:00",
      "completed_at": "2025-12-29T22:00:00",
      "has_synthesis": true,
      "interpretations_completed": 4,
      "integration_notes_count": 1
    }
  ],
  "total_duration_hours": 168.0,
  "entries_completed": 7,
  "has_cycle_synthesis": true,
  "planetary_cards": {
    "1": "The Sun",
    "2": "The Moon",
    "3": "The Tower",
    "4": "The Magician",
    "5": "Wheel of Fortune",
    "6": "The Empress",
    "7": "The World"
  },
  "domain_cards": {
    "Physical": "Ace of Pentacles",
    "Emotional": "Two of Cups",
    "Mental": "Three of Swords",
    "Spiritual": "Four of Wands"
  }
}
```

### GET /history/entries/{entry_id}/timeline
Detailed timeline of an entry's progression with events, interpretations, and notes.

**Response (200):**
```json
{
  "entry_id": "a1b2c3d4-...",
  "cycle_id": "2965264e-...",
  "sequence": 1,
  "planet": "Sun",
  "status": "complete",
  "created_at": "2025-12-28T00:00:00",
  "started_at": "2025-12-28T08:00:00",
  "synthesis_created_at": "2025-12-28T16:00:00",
  "completed_at": "2025-12-28T20:00:00",
  "active_duration_hours": 8.0,
  "integration_duration_hours": 4.0,
  "total_duration_hours": 12.0,
  "interpretations": [
    {
      "interpretation_id": "interp-1-...",
      "domain": "Physical",
      "status": "complete",
      "created_at": "2025-12-28T08:30:00",
      "responded_at": "2025-12-28T09:00:00",
      "completed_at": "2025-12-28T09:30:00"
    }
  ],
  "integration_notes": [
    {
      "content": "Solar themes deepening through the day...",
      "added_at": "2025-12-28T17:00:00"
    }
  ],
  "planetary_card": "The Sun",
  "domain_cards": {
    "Physical": "Ace of Pentacles",
    "Emotional": "Two of Cups",
    "Mental": "Three of Swords",
    "Spiritual": "Four of Wands"
  },
  "events": [
    {"event_type": "created", "timestamp": "2025-12-28T00:00:00", "details": null},
    {"event_type": "started", "timestamp": "2025-12-28T08:00:00", "details": null},
    {"event_type": "synthesis_created", "timestamp": "2025-12-28T16:00:00", "details": null},
    {"event_type": "note_added", "timestamp": "2025-12-28T17:00:00", "details": "Integration note added"},
    {"event_type": "completed", "timestamp": "2025-12-28T20:00:00", "details": null}
  ]
}
```

### GET /history/user/{user_id}/reading-timeline?page=1&page_size=20
Paginated user reading history timeline.

**Query Parameters:**
- `page` (int, default: 1) — Page number
- `page_size` (int, default: 20) — Items per page

**Response (200):**
```json
{
  "user_id": "paul-123",
  "items": [
    {
      "item_type": "cycle_started",
      "timestamp": "2026-02-18T03:15:13",
      "cycle_id": "2965264e-...",
      "entry_id": null,
      "planet": null,
      "sequence": null,
      "description": "New reading cycle started"
    },
    {
      "item_type": "entry_completed",
      "timestamp": "2026-02-18T12:00:00",
      "cycle_id": "2965264e-...",
      "entry_id": "a1b2c3d4-...",
      "planet": "Sun",
      "sequence": 1,
      "description": "Completed Sun entry"
    },
    {
      "item_type": "cycle_completed",
      "timestamp": "2026-01-04T00:00:00",
      "cycle_id": "f62251d8-...",
      "entry_id": null,
      "planet": null,
      "sequence": null,
      "description": "Reading cycle completed with synthesis"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 20,
  "has_more": true,
  "total_cycles": 3,
  "total_entries_completed": 14,
  "date_range_start": "2025-11-01",
  "date_range_end": "2026-02-18"
}
```

### GET /history/user/{user_id}/export?format=json
Export all user data in JSON or CSV format.

**Query Parameters:**
- `format` (string, default: "json") — Export format: `json` or `csv`

**Response (200 — JSON format):**
```json
{
  "user_id": "paul-123",
  "export_format": "json",
  "exported_at": "2026-02-18T14:00:00",
  "cycles_count": 3,
  "entries_count": 21,
  "interpretations_count": 56,
  "cycles": [
    {
      "cycle_id": "2965264e-...",
      "status": "active",
      "created_at": "2026-02-18T03:15:13",
      "completed_at": null,
      "planetary_cards": {"1": "The Sun", "2": "The Moon"},
      "domain_cards": {"Physical": "Ace of Pentacles"},
      "synthesis": null
    }
  ],
  "entries": [
    {
      "entry_id": "a1b2c3d4-...",
      "cycle_id": "2965264e-...",
      "sequence": 1,
      "planet": "Sun",
      "status": "complete",
      "started_at": "2026-02-18T04:00:00",
      "completed_at": "2026-02-18T12:00:00",
      "synthesis": "Solar themes synthesis...",
      "integration_notes": ["Note 1", "Note 2"]
    }
  ],
  "interpretations": [
    {
      "interpretation_id": "interp-uuid-...",
      "entry_id": "a1b2c3d4-...",
      "domain": "Physical",
      "status": "complete",
      "user_response": "The Sun card speaks to my physical vitality...",
      "ai_evaluation": "Your connection shows deep awareness...",
      "completed_at": "2026-02-18T05:10:00"
    }
  ],
  "csv_url": null,
  "csv_data": null,
  "message": "Export completed successfully"
}
```

---

## V1 → V2 Migration Guide

### Concept Mapping

| V1 Concept | V2 Concept |
|------------|------------|
| `WeeklyReading` | `ReadingCycle` |
| `DailyEntry` | `ProgressionEntry` |
| Calendar week (Sun-Sat) | 7-planet sequence (Sun → Saturn) |
| `HAS_ENTRY` relationship | `BELONGS_TO` relationship |
| No ordering | `PREVIOUS` relationship chain |
| Fixed 7-day window | Flexible progression pace |

### Dual-Labeling
Both V1 and V2 labels coexist on the same nodes:
- `WeeklyReading` + `ReadingCycle`
- `DailyEntry` + `ProgressionEntry`

### Endpoint Mapping

| V1 Endpoint | V2 Equivalent |
|-------------|--------------|
| `POST /sacred-journey/weekly-reading` | `POST /v2/sacred-journey/cycles/create` |
| `GET /sacred-journey/current-spread` | `GET /v2/sacred-journey/cycles/active` |
| `POST /sacred-journey/daily/begin` | `POST /v2/sacred-journey/entries/{id}/begin` |
| `GET /sacred-journey/daily/{date}/interpretations` | `GET /v2/sacred-journey/interpretations/{entry_id}/status` |
| `GET /sacred-journey/constellation` | `GET /v2/sacred-journey/history/user/{id}/reading-timeline` |

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Invalid state transition or bad request |
| 404 | Resource not found |
| 422 | Validation error (invalid request body) |
| 500 | Server error |

---

## State Machines

### Entry Lifecycle
```
available ──(begin)──> active ──(synthesize)──> integrating ──(advance)──> complete
```

### Interpretation Lifecycle
```
pending ──(respond)──> responded ──(evaluate)──> evaluated ──(complete)──> complete
```

### Cycle Lifecycle
```
active ──(all 7 entries complete + synthesize)──> complete
```
