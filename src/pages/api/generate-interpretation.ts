/**
 * AI Interpretation Generation API Route
 *
 * Server-side endpoint that calls Claude API to generate
 * interpretation text and introspection questions for daily practice.
 */
import type { APIRoute } from 'astro';

interface GenerationRequest {
  domain: string;
  planetary_card: string;
  planetary_card_detail: Record<string, any>;
  domain_card: string;
  domain_card_detail: Record<string, any>;
}

interface GenerationResponse {
  interpretation: string;
  introspection_question: string;
}

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

function buildSystemPrompt(): string {
  return `You are a wise guide for the Sacred Journey daily tarot practice. Your role is to create personalized interpretations that weave together the planetary card (daily energy) with the domain card (aspect of life).

Your interpretations should be:
- Insightful and contemplative, not predictive
- Grounded in the imagery and symbolism of the cards
- Focused on personal growth and self-reflection
- Written in second person ("you") to feel personal

Format your response as valid JSON with exactly these two fields:
{
  "interpretation": "A 2-3 paragraph interpretation that weaves the planetary and domain cards together...",
  "introspection_question": "A single, deep question for reflection that invites genuine self-inquiry..."
}

The interpretation should explore how the planetary card's energy manifests in the specific domain. The introspection question should be open-ended and invite genuine self-reflection, not a yes/no question.`;
}

function extractCardInfo(card: Record<string, any>): string {
  const parts: string[] = [];

  // Extract from summary
  if (card.summary) {
    if (card.summary.arcana) parts.push(`Arcana: ${card.summary.arcana}`);
    if (card.summary.suit) parts.push(`Suit: ${card.summary.suit}`);
  }

  // Extract from correspondences
  const corr = card.correspondences || {};

  if (corr.dominant_sign?.name) {
    let sign = `Zodiac: ${corr.dominant_sign.name}`;
    if (corr.dominant_sign.element) sign += ` (${corr.dominant_sign.element})`;
    parts.push(sign);
  }

  if (corr.ruling_body?.name) {
    parts.push(`Planetary Ruler: ${corr.ruling_body.name}`);
  }

  if (corr.element?.name) {
    parts.push(`Element: ${corr.element.name}`);
  }

  if (corr.hebrew_letter?.name) {
    let hebrew = `Hebrew Letter: ${corr.hebrew_letter.name}`;
    if (corr.hebrew_letter.meaning) hebrew += ` (${corr.hebrew_letter.meaning})`;
    parts.push(hebrew);
  }

  if (corr.tree_path?.connects?.length) {
    parts.push(`Tree of Life: connects ${corr.tree_path.connects.join(' and ')}`);
  }

  if (corr.enneagram?.type) {
    let ennea = `Enneagram: Type ${corr.enneagram.type}`;
    if (corr.enneagram.name) ennea += ` (${corr.enneagram.name})`;
    parts.push(ennea);
  }

  if (corr.number?.value !== undefined) {
    let num = `Number: ${corr.number.value}`;
    if (corr.number.meaning) num += ` - ${corr.number.meaning}`;
    parts.push(num);
  }

  return parts.join('\n  ');
}

function buildUserPrompt(request: GenerationRequest): string {
  const domainFocus: Record<string, string> = {
    Body: 'physical sensations, embodiment, health, movement, grounding, material needs',
    Mind: 'thoughts, mental patterns, clarity, learning, perspective, beliefs',
    Heart: 'emotions, relationships, desires, connections, vulnerability, love',
    Spirit: 'purpose, intuition, transcendence, meaning, sacred connection, inner wisdom'
  };

  const planetaryDetail = request.planetary_card_detail || {};
  const domainDetail = request.domain_card_detail || {};

  let prompt = `Generate an interpretation for the ${request.domain} domain.

PLANETARY CARD (Today's energy): ${request.planetary_card}`;

  const planetaryInfo = extractCardInfo(planetaryDetail);
  if (planetaryInfo) {
    prompt += `\n  ${planetaryInfo}`;
  }

  prompt += `\n\nDOMAIN CARD (${request.domain}): ${request.domain_card}`;

  const domainInfo = extractCardInfo(domainDetail);
  if (domainInfo) {
    prompt += `\n  ${domainInfo}`;
  }

  prompt += `\n\nDOMAIN FOCUS: ${domainFocus[request.domain] || 'personal growth and reflection'}

Create an interpretation that weaves together:
1. The planetary card's energy and symbolism as the day's overarching theme
2. The domain card's specific guidance for the ${request.domain} aspect of life
3. How these two cards interact and inform each other

The interpretation should be contemplative and invite self-reflection. End with a single introspection question that helps the practitioner explore this energy in their own life.

Respond with valid JSON only.`;

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

  let body: GenerationRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON in request body' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (!body.domain || !body.planetary_card || !body.domain_card) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: domain, planetary_card, domain_card' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: buildUserPrompt(body)
          }
        ],
        system: buildSystemPrompt()
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Anthropic API error:', response.status, errorData);
      return new Response(
        JSON.stringify({ error: `AI generation failed: ${response.status}` }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
      return new Response(
        JSON.stringify({ error: 'No content in AI response' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from Claude
    let parsed: GenerationResponse;
    try {
      // Handle potential markdown code blocks in response
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response as JSON:', content);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!parsed.interpretation || !parsed.introspection_question) {
      return new Response(
        JSON.stringify({ error: 'AI response missing required fields' }),
        { status: 502, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify(parsed),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI generation error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error during AI generation' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
