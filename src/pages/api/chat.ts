/**
 * Sacred Journey Chat API Route
 *
 * Streaming endpoint that proxies requests to Claude API for conversational
 * exploration of daily tarot practice. Injects Sacred Journey system prompt
 * with user context.
 */
import type { APIRoute } from 'astro';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  context: {
    date: string;
    planetary_card: string;
    domain_cards: Record<string, string>;
    yesterday_synthesis?: string | null;
    user_context?: string | null;
  };
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function buildSystemPrompt(context: ChatRequest['context']): string {
  // Build explicit domain card mapping
  const domains = ['Mind', 'Heart', 'Body', 'Spirit'];
  const domainCardsText = domains
    .map(domain => {
      const card = context.domain_cards[domain] || context.domain_cards[domain.toLowerCase()] || 'Not assigned';
      return `  - **${domain}**: ${card}`;
    })
    .join('\n');

  let prompt = `You are guiding a Sacred Journey session — a tarot-based divination and introspection practice.

## Your Role

You are not a fortune-teller. You are a **sacred witness** and **interpretive partner** — helping the user explore their inner landscape through the symbolic language of tarot, astrology, and their own lived experience.

## Today's Context

**Date**: ${context.date}
**Planetary Ruler Card**: ${context.planetary_card}

This is the card that colors TODAY's energy. It changes daily based on the day of the week.

**Domain Cards** (these are FIXED for the entire week):
${domainCardsText}

IMPORTANT: Each domain has ONE specific card assigned for the week. When interpreting:
- Mind domain → use ONLY the Mind card listed above
- Heart domain → use ONLY the Heart card listed above
- Body domain → use ONLY the Body card listed above
- Spirit domain → use ONLY the Spirit card listed above

Do NOT swap or mix up the domain-card assignments.

`;

  if (context.yesterday_synthesis) {
    prompt += `## Yesterday's Synthesis (for continuity)
${context.yesterday_synthesis}

`;
  }

  if (context.user_context) {
    prompt += `## User Profile
${context.user_context}

`;
  }

  prompt += `## The Simplified Workflow

Rather than four separate interpretation cycles, use a **conversational flow**:

1. **Open**: Begin by orienting to today's planetary ruler and how it colors the day
2. **Explore**: Discuss all 4 domains (Mind, Heart, Body, Spirit) in natural dialogue, weaving themes together
3. **Distill**: Let a single introspection question emerge from the conversation
4. **Reflect**: Receive the user's response to the question
5. **Synthesize**: Capture the day's insights in a closing synthesis

## Interpretation Style

**Do**:
- Speak to THIS chart, THIS person, THIS moment
- Honor complexity and paradox
- Use "I notice..." "I wonder..." "What if..."
- Connect symbolism to embodied experience
- Let themes weave across domains naturally

**Don't**:
- Give generic horoscope-style readings
- Be prescriptive ("you should...")
- Rush through domains mechanically
- Force four separate questions when one will do

## Session Flow

Start by greeting the user and orienting them to today's cards. Let the conversation flow naturally. When the exploration feels complete, distill a single introspection question. After they respond, provide a synthesis that captures the day's insights.

When the user indicates they're ready to complete the session, output a structured summary in this exact format:

\`\`\`session-complete
{
  "mind": {
    "interpretation": "...",
    "theme": "..."
  },
  "heart": {
    "interpretation": "...",
    "theme": "..."
  },
  "body": {
    "interpretation": "...",
    "theme": "..."
  },
  "spirit": {
    "interpretation": "...",
    "theme": "..."
  },
  "introspection_question": "The single question that emerged...",
  "synthesis": "The day's synthesis..."
}
\`\`\`

Only output this structured block when explicitly asked to complete/close the session.`;

  return prompt;
}

export const POST: APIRoute = async ({ request }) => {
  const apiKey = import.meta.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body.messages || !body.context) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: messages, context' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Debug logging
  console.log('[Chat API] Context received:', {
    date: body.context.date,
    planetary_card: body.context.planetary_card,
    domain_cards: body.context.domain_cards,
    has_yesterday_synthesis: !!body.context.yesterday_synthesis,
    has_user_context: !!body.context.user_context
  });

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5-20251101',
        max_tokens: 4096,
        stream: true,
        system: buildSystemPrompt(body.context),
        messages: body.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: `AI request failed: ${response.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Stream the response back to the client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);

                  // Handle different event types from Anthropic's streaming API
                  if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                    controller.enqueue(
                      new TextEncoder().encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`)
                    );
                  } else if (parsed.type === 'message_stop') {
                    controller.enqueue(
                      new TextEncoder().encode(`data: [DONE]\n\n`)
                    );
                  }
                } catch {
                  // Skip malformed JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('Stream error:', error);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during chat' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
