// Vercel Serverless Function: /api/research
// Keeps your ANTHROPIC_API_KEY on the server so it is never exposed to visitors.

const SYSTEM_PROMPT = `You are Lumen, a research assistant. Your job is to give careful, structured, research-style answers.

For every substantive question, organize your response with these sections (use markdown headings):
1. Summary: a direct answer in 2-4 sentences.
2. Key findings: the main evidence or facts, with the strength of the evidence noted (e.g. strong consensus, mixed evidence, preliminary).
3. Competing views and nuance: where experts disagree, and why.
4. Limitations and uncertainty: what is not known, and what could change the picture.
5. Where to look next: the types of primary sources, databases, or search terms a researcher should check.

Rules:
- Be precise. Distinguish established facts from hypotheses and opinions.
- Never invent citations, DOIs, statistics, or quotes. If you are unsure of a specific figure, say so.
- If your knowledge may be out of date for a time-sensitive question, say so explicitly.
- For simple factual questions, you may use a shorter version of the structure.
- Stay neutral on contested political or moral questions and represent the main positions fairly.`;

const MAX_MESSAGES = 12;
const MAX_CHARS = 4000;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
  }

  // Sanitize the conversation: only user/assistant roles, capped length and count.
  const incoming = Array.isArray(req.body?.messages) ? req.body.messages : [];
  const messages = incoming
    .filter(m => (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return res.status(400).json({ error: "Send a user message to research." });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-5-5",
        max_tokens: 1800,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      console.error("Anthropic API error:", data);
      return res.status(502).json({ error: "The research model returned an error" });
    }

    const answer = (data.content || [])
      .filter(block => block.type === "text")
      .map(block => block.text)
      .join("\n")
      .trim();

    return res.status(200).json({ answer: answer || "No answer was generated. Try rephrasing your question." });
  } catch (err) {
    console.error("Research handler failed:", err);
    return res.status(500).json({ error: "Could not reach the research model" });
  }
}
