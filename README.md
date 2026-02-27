# Paths of Reverence - Sacred Journey Site

Astro SSR application for the Sacred Journey daily tarot practice system. Connects to a Neo4j middleware API for weekly readings, daily entries, interpretations, and synthesis.

## Architecture

- **Framework**: Astro v5+ with `output: 'server'` (SSR)
- **API**: Neo4j middleware at `repository.dubtown-server.us`
- **AI**: Claude API for interpretation generation and conversational sessions

## Key Pages

| Route | Purpose |
|-------|---------|
| `/` | Today's spread and interpretation status |
| `/practice/new-week` | Create or edit a weekly card reading |
| `/practice/[date]` | Daily practice view |
| `/practice/session/[date]` | Conversational chat session with Claude |
| `/practice/prepare/[date]` | AI-generate interpretations for each domain |
| `/practice/respond/[id]` | Respond to a specific interpretation |
| `/practice/pending` | Queue of interpretations awaiting response |
| `/history` | Archive of past weekly readings |

## Setup

```sh
npm install
cp .env.example .env  # Add your API keys
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `PUBLIC_API_BASE` | Sacred Journey API base URL |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
