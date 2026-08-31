// Serverless function (Vercel). Keeps the Gemini API key server-side —
// never expose it in the frontend code.
//
// Expects POST JSON: { imageBase64: "<base64, no data: prefix>", mimeType: "image/jpeg" }
// Returns: { questions: ["...", "...", ...] }  or  { error: "..." }

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing GEMINI_API_KEY. Set it in your hosting provider's environment variables." });
    return;
  }

  const { imageBase64, mimeType } = req.body || {};
  if (!imageBase64) {
    res.status(400).json({ error: "Missing imageBase64 in request body." });
    return;
  }

  const prompt =
    "You are looking at a photo or PDF of a school assignment or worksheet (it may be several pages). " +
    "Identify every distinct question or problem the student needs to solve. " +
    "Return ONLY a JSON array of strings, one entry per question, in the order they appear on the page, " +
    "each a faithful transcription of that question's text (use standard notation like x^2, sqrt(x), 3/4 for math symbols you can't type literally). " +
    "Do not include answers, page headers, instructions, or anything that isn't itself a question to solve. " +
    "If a problem has labeled sub-parts (a, b, c), list each sub-part as its own array entry, e.g. \"3a) ...\". " +
    "Return valid JSON only — no markdown code fences, no extra commentary, just the array.";

  try {
    const upstream = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } },
              ],
            },
          ],
        }),
      }
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: (data && data.error && data.error.message) || "Gemini API request failed." });
      return;
    }

    const text =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts[0] &&
      data.candidates[0].content.parts[0].text;

    if (!text) {
      res.status(502).json({ error: "Gemini returned no text.", raw: data });
      return;
    }

    var cleaned = text.trim()
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/, "")
      .replace(/```\s*$/, "");

    var questions;
    try {
      questions = JSON.parse(cleaned);
    } catch (e) {
      res.status(502).json({ error: "Could not parse the AI's response as JSON.", raw: text });
      return;
    }

    if (!Array.isArray(questions)) {
      res.status(502).json({ error: "AI response wasn't a list of questions.", raw: text });
      return;
    }

    res.status(200).json({ questions: questions });
  } catch (err) {
    res.status(500).json({ error: (err && err.message) || "Unknown server error." });
  }
}
