# Sacred Journey API Reference

> Complete API documentation for the Neo4j Middleware endpoints

## Base URL

```
Production: https://neo4jmiddleware.robin-alligator.ts.net
Local Dev:  http://100.117.79.64:8000
```

---

## Weekly Reading Endpoints

### Create Weekly Reading

Creates a new 7-day reading period with 11 cards.

```http
POST /sacred-journey/weekly-reading/create
Content-Type: application/json
```

**Request Body:**

```json
{
  "week_start": "2025-01-05",
  "planetary_cards": {
    "Sunday": "The Sun",
    "Monday": "The High Priestess",
    "Tuesday": "The Tower",
    "Wednesday": "The Magician",
    "Thursday": "Wheel of Fortune",
    "Friday": "The Empress",
    "Saturday": "The Star"
  },
  "domain_cards": {
    "Body": "Four of Pentacles",
    "Mind": "Ace of Swords",
    "Heart": "Two of Cups",
    "Spirit": "The Hermit"
  }
}
```

**Response:**

```json
{
  "reading_id": "wr_abc123",
  "week_start": "2025-01-05",
  "week_end": "2025-01-11",
  "status": "active",
  "message": "Weekly reading created successfully"
}
```

---

### Get Current Spread

Returns the active week's cards and today's practice status.

```http
GET /sacred-journey/current-spread
```

**Response:**

```json
{
  "reading_id": "wr_abc123",
  "week_start": "2025-01-05",
  "week_status": "active",
  "planetary_cards": {
    "Sunday": "The Sun",
    "Monday": "The High Priestess",
    "Tuesday": "The Tower",
    "Wednesday": "The Magician",
    "Thursday": "Wheel of Fortune",
    "Friday": "The Empress",
    "Saturday": "The Star"
  },
  "domain_cards": {
    "Body": "Four of Pentacles",
    "Mind": "Ace of Swords",
    "Heart": "Two of Cups",
    "Spirit": "The Hermit"
  },
  "today": {
    "entry_id": "de_xyz789",
    "date": "2025-01-07",
    "day_of_week": "Tuesday",
    "planetary_card": "The Tower",
    "domain_cards": {
      "Body": "Four of Pentacles",
      "Mind": "Ace of Swords",
      "Heart": "Two of Cups",
      "Spirit": "The Hermit"
    },
    "interpretations": [
      {
        "interpretation_id": "int_001",
        "domain": "Mind",
        "status": "complete"
      }
    ],
    "synthesis": null,
    "status": "active"
  },
  "days_complete": 2
}
```

**Error Response (404):**

```json
{
  "detail": "No active weekly reading found"
}
```

---

### Get Weekly Progress

Returns progress for a specific week.

```http
GET /sacred-journey/weekly/{week_start}/progress
```

**Parameters:**
- `week_start` (path): ISO date string for week start (Sunday)

**Response:**

```json
{
  "reading_id": "wr_abc123",
  "week_start": "2025-01-05",
  "status": "active",
  "days_complete": 3,
  "total_interpretations": 12,
  "entries": [
    {
      "entry_id": "de_001",
      "date": "2025-01-05",
      "status": "complete"
    }
  ]
}
```

---

## Daily Entry Endpoints

### Begin Daily Entry

Creates a new daily entry or returns existing one.

```http
POST /sacred-journey/daily/begin
Content-Type: application/json
```

**Request Body:**

```json
{
  "entry_date": "2025-01-07"
}
```

**Response:**

```json
{
  "entry_id": "de_xyz789",
  "date": "2025-01-07",
  "day_of_week": "Tuesday",
  "planetary_card": "The Tower",
  "domains": ["Mind", "Heart", "Body", "Spirit"],
  "interpretation_ids": {
    "Mind": "int_001",
    "Heart": "int_002",
    "Body": "int_003",
    "Spirit": "int_004"
  }
}
```

**Error Response (409):**

```json
{
  "detail": "Daily entry already exists",
  "entry_id": "de_xyz789"
}
```

---

### Get Daily Interpretations

Returns interpretations with full card details. Most reliable for card data.

```http
GET /sacred-journey/daily/{entry_date}/interpretations
```

**Parameters:**
- `entry_date` (path): ISO date string

**Response:**

```json
{
  "entry_id": "de_xyz789",
  "date": "2025-01-07",
  "planetary_card": "The Tower",
  "domain_cards": {
    "Body": "Four of Pentacles",
    "Mind": "Ace of Swords",
    "Heart": "Two of Cups",
    "Spirit": "The Hermit"
  },
  "interpretations": [
    {
      "interpretation_id": "int_001",
      "domain": "Mind",
      "status": "complete",
      "prepared_interpretation": "The Ace of Swords pierces...",
      "introspection_question": "What clarity seeks you today?",
      "response": "I feel that...",
      "domain_eval": "Mental clarity emerging"
    }
  ],
  "planetary_card_detail": {
    "name": "The Tower",
    "summary": {
      "arcana": "Major",
      "number": 16,
      "labels": ["Upheaval", "Revelation", "Liberation"]
    },
    "correspondences": {
      "dominant_sign": { "name": "Scorpio", "element": "Water" },
      "ruling_body": { "name": "Mars", "symbol": "♂" },
      "hebrew_letter": { "name": "Peh", "meaning": "Mouth" }
    }
  },
  "domain_cards_detail": {
    "Mind": {
      "name": "Ace of Swords",
      "summary": { "arcana": "Minor", "suit": "Swords" }
    }
  }
}
```

---

### Get Interpretation Context

Returns full context for interpretation generation.

```http
GET /sacred-journey/daily/{entry_date}/context?user_id={user_id}
```

**Parameters:**
- `entry_date` (path): ISO date string
- `user_id` (query, optional): User ID for personalized context

**Response:**

```json
{
  "entry_id": "de_xyz789",
  "planetary_ruler": "The Tower",
  "yesterday_synthesis": "Yesterday revealed themes of...",
  "lastweek_synthesis": "Last week's journey centered on...",
  "transits": [
    {
      "planet": "Venus",
      "sign": "Pisces",
      "aspect": "conjunct",
      "target": "Moon"
    }
  ],
  "domain_cards": {
    "Body": "Four of Pentacles",
    "Mind": "Ace of Swords",
    "Heart": "Two of Cups",
    "Spirit": "The Hermit"
  },
  "user_context": {
    "interpreted_chart": {
      "sun_sign": "Scorpio",
      "moon_sign": "Cancer",
      "rising_sign": "Virgo"
    },
    "spiritual_identity": "Seeking integration of shadow...",
    "active_intentions": [],
    "transit_focus": ["Saturn return"]
  },
  "user_context_prompt": "You are speaking with someone who..."
}
```

---

### Add Transits

Adds planetary transit data to a daily entry.

```http
POST /sacred-journey/daily/{entry_date}/transits
Content-Type: application/json
```

**Request Body:**

```json
{
  "transits": [
    {
      "planet": "Venus",
      "sign": "Pisces",
      "aspect": "conjunct",
      "target": "Moon"
    }
  ]
}
```

---

### Create Daily Synthesis

Creates or auto-generates the daily synthesis.

```http
POST /sacred-journey/daily/{entry_date}/synthesize
Content-Type: application/json
```

**Request Body:**

```json
{
  "synthesis_content": "Today's exploration revealed..."
}
```

If `synthesis_content` is omitted, the API will auto-generate.

---

### Bulk Complete Daily

Saves an entire day's session in one call. Used by chat sessions.

```http
POST /sacred-journey/daily/bulk-complete
Content-Type: application/json
```

**Request Body:**

```json
{
  "entry_date": "2025-01-07",
  "interpretations": {
    "Mind": {
      "prepared_interpretation": "The Ace of Swords brings clarity...",
      "introspection_question": "What truth is seeking expression?",
      "response": "I realize that...",
      "domain_eval": "Mental breakthrough achieved"
    },
    "Heart": {
      "prepared_interpretation": "Two of Cups speaks to connection...",
      "introspection_question": "Where do you feel most connected?",
      "response": "In moments of...",
      "domain_eval": "Emotional opening"
    },
    "Body": {
      "prepared_interpretation": "Four of Pentacles suggests grounding...",
      "introspection_question": "What does your body need today?",
      "response": "Rest and...",
      "domain_eval": "Physical awareness"
    },
    "Spirit": {
      "prepared_interpretation": "The Hermit calls inward...",
      "introspection_question": "What wisdom awaits in stillness?",
      "response": "The silence holds...",
      "domain_eval": "Spiritual receptivity"
    }
  },
  "auto_synthesize": false,
  "synthesis_content": "Today's journey wove together themes of clarity and connection..."
}
```

**Response:**

```json
{
  "entry_id": "de_xyz789",
  "status": "complete",
  "interpretations_saved": 4,
  "synthesis_saved": true
}
```

---

## Interpretation Endpoints

### Prepare Interpretation

Adds AI-generated content to an interpretation.

```http
PUT /sacred-journey/daily/interpretation/{interpretation_id}/prepare
Content-Type: application/json
```

**Request Body:**

```json
{
  "prepared_interpretation": "The Tower's sudden illumination...",
  "introspection_question": "What structures are ready to fall?"
}
```

**Status Change:** `prepared` → `ready`

---

### Respond to Interpretation

Records user's response to an introspection question.

```http
POST /sacred-journey/daily/interpretation/{interpretation_id}/respond
Content-Type: application/json
```

**Request Body:**

```json
{
  "response": "I notice that my assumptions about..."
}
```

**Status Change:** `ready` → `responded`

---

### Evaluate Interpretation

Adds final evaluation/synthesis for a domain.

```http
POST /sacred-journey/daily/interpretation/{interpretation_id}/evaluate
Content-Type: application/json
```

**Request Body:**

```json
{
  "domain_eval": "Today's Tower energy in the Mind domain brought sudden clarity..."
}
```

**Status Change:** `responded` → `complete`

---

### Get Pending Interpretations

Returns all interpretations awaiting user response.

```http
GET /sacred-journey/interpretation/pending
```

**Response:**

```json
{
  "pending": [
    {
      "interpretation_id": "int_001",
      "date": "2025-01-07",
      "domain": "Heart",
      "introspection_question": "Where do you feel most connected?",
      "created_at": "2025-01-07T10:30:00Z"
    }
  ]
}
```

---

## Profile Endpoints

### Get User Context Block

Returns user's astrological and spiritual context.

```http
GET /sacred-journey/profile/{user_id}/context-block
```

**Response:**

```json
{
  "interpreted_chart": {
    "sun_sign": "Scorpio",
    "moon_sign": "Cancer",
    "rising_sign": "Virgo",
    "ic_sign": "Sagittarius",
    "ic_themes": ["Higher learning", "Philosophy"],
    "configurations": [
      {
        "name": "Grand Trine",
        "planets": ["Sun", "Moon", "Neptune"],
        "meaning": "Flow of emotional intuition"
      }
    ],
    "notable_placements": {
      "Chiron": "12th house - healing through solitude"
    }
  },
  "spiritual_identity": "Seeking integration of shadow aspects...",
  "active_intentions": [
    {
      "intention_id": "int_abc",
      "theme": "Self-compassion",
      "question": "How can I be gentler with myself?",
      "started": "2025-01-01",
      "active": true
    }
  ],
  "transit_focus": ["Saturn return", "Pluto square"]
}
```

---

### Get Profile Statistics

Returns practice statistics for a user.

```http
GET /sacred-journey/profile/{user_id}
```

**Response:**

```json
{
  "user_id": "user_123",
  "username": "seeker",
  "total_readings": 12,
  "total_entries": 84,
  "current_streak": 7,
  "longest_streak": 21,
  "domains_explored": {
    "Mind": 84,
    "Heart": 84,
    "Body": 84,
    "Spirit": 84
  }
}
```

---

## History Endpoints

### Get History Archive

Returns historical readings with optional entry details.

```http
GET /sacred-journey/history?limit={limit}&include_entries={include_entries}
```

**Parameters:**
- `limit` (query, optional): Number of readings to return (default: 10)
- `include_entries` (query, optional): Include daily entries (default: false)

**Response:**

```json
{
  "readings": [
    {
      "reading_id": "wr_abc123",
      "week_start": "2025-01-05",
      "week_end": "2025-01-11",
      "status": "complete",
      "days_complete": 7,
      "total_interpretations": 28,
      "weekly_synthesis": "This week's journey..."
    }
  ],
  "recent_entries": [
    {
      "entry_id": "de_xyz789",
      "date": "2025-01-07",
      "day_of_week": "Tuesday",
      "planetary_card": "The Tower",
      "synthesis": "Today revealed...",
      "interpretations_count": 4,
      "status": "complete"
    }
  ]
}
```

---

## User Endpoints

### List Users

Returns all user profiles.

```http
GET /sacred-journey/users
```

**Response:**

```json
{
  "users": [
    {
      "user_id": "user_123",
      "username": "seeker"
    }
  ]
}
```

---

## Health Check

### API Health

Checks API availability.

```http
GET /health
```

**Response:**

```json
{
  "status": "healthy",
  "database": "connected",
  "version": "1.0.0"
}
```

---

## Error Responses

All endpoints return standard error responses:

### 400 Bad Request

```json
{
  "detail": "Invalid request body",
  "errors": [
    {
      "field": "week_start",
      "message": "Invalid date format"
    }
  ]
}
```

### 404 Not Found

```json
{
  "detail": "Resource not found"
}
```

### 409 Conflict

```json
{
  "detail": "Resource already exists",
  "existing_id": "wr_abc123"
}
```

### 500 Internal Server Error

```json
{
  "detail": "An unexpected error occurred"
}
```

---

## Rate Limits

- Standard: 100 requests/minute per IP
- Bulk operations: 10 requests/minute

---

## Changelog

### v1.0.0 (Current)
- Initial API release
- Weekly reading CRUD operations
- Daily entry management
- Interpretation workflow
- Bulk completion endpoint
- User profile endpoints

---

*API Reference generated on January 10, 2026*
