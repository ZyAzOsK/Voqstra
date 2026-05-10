const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const logger = require('../logger');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Analyzes a call audio file using Gemini 2.0 Flash (multimodal).
 * Returns transcript, sentiment, summary, action_items, needs_followup.
 */
async function analyzeCall(audioFilePath) {
  const audioBuffer = fs.readFileSync(audioFilePath);
  const base64Audio = audioBuffer.toString('base64');
  const ext = path.extname(audioFilePath).toLowerCase().replace('.', '');

  const mimeTypeMap = {
    mp3: 'audio/mp3',
    mp4: 'audio/mp4',
    wav: 'audio/wav',
    webm: 'audio/webm',
    m4a: 'audio/mp4',
    ogg: 'audio/ogg',
    flac: 'audio/flac',
  };
  const mimeType = mimeTypeMap[ext] || 'audio/wav';

  const prompt = `You are an expert call analyst. Listen to this call recording and respond ONLY with a valid JSON object (no markdown, no extra text) in exactly this structure:

{
  "transcript": "<full transcript of the call>",
  "sentiment": "<one of: positive | negative | neutral>",
  "summary": "<2-sentence summary of what was discussed>",
  "action_items": ["<item1>", "<item2>"],
  "needs_followup": <true or false>
}

Rules:
- "needs_followup" must be true if the call involves scheduling a callback, sending information, or any pending commitment.
- "action_items" should be specific tasks mentioned (e.g., "send pricing document", "schedule demo on Friday", "follow up in 3 days").
- Keep the transcript as accurate as possible.
- If no audio or speech is detected, return a transcript of "No speech detected." and neutral sentiment.`;

  logger.info('Sending audio to Gemini 2.5 Flash for analysis', { file: path.basename(audioFilePath) });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Audio } },
        ],
      },
    ],
  });

  const responseText = response.text.trim();

  // Strip markdown code fences if Gemini adds them
  const cleaned = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    logger.error('Failed to parse Gemini JSON response', { raw: responseText.slice(0, 300) });
    throw new Error('Gemini returned invalid JSON: ' + responseText.slice(0, 200));
  }

  logger.info('Gemini analysis complete', {
    sentiment: parsed.sentiment,
    needs_followup: parsed.needs_followup,
    action_items_count: parsed.action_items?.length,
  });

  return parsed;
}

module.exports = { analyzeCall };
