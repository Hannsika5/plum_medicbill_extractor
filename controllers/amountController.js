import Tesseract from "tesseract.js";

// Regex to capture amounts with ₹, Rs, or $ (handles commas and decimals)
const amountRegex = /(?:₹|\$|Rs\.?)\s?(\d+(?:,\d{3})*(?:\.\d{1,2})?)/g;

// Common OCR digit corrections
const ocrCorrections = {
  l: "1",
  I: "1",
  O: "0",
  S: "5"
};

// Map keywords to context labels
const contextMap = {
  total_bill: /(total|bill)/i,
  paid: /(paid)/i,
  due: /(due)/i,
  discount: /(discount)/i
};

// Helper to fix OCR digit errors
const normalizeToken = (token) => {
  let corrected = token;
  for (const [wrong, right] of Object.entries(ocrCorrections)) {
    corrected = corrected.replace(new RegExp(wrong, "g"), right);
  }
  return parseFloat(corrected.replace(/,/g, ""));
};

// Helper to find surrounding text for provenance
const getSurroundingText = (fullText, token) => {
  const idx = fullText.indexOf(token);
  if (idx === -1) return token;
  const start = Math.max(0, idx - 20);
  const end = Math.min(fullText.length, idx + token.length + 20);
  return fullText.slice(start, end).trim();
};

export const extractFromImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  try {
    // Step 1: OCR
    const result = await Tesseract.recognize(req.file.path, "eng");
    const text = result.data.text;
    const ocrConfidence = result.data.confidence / 100;

    const matches = [...text.matchAll(amountRegex)];
    if (matches.length === 0) {
      return res.json({ status: "no_amounts_found", reason: "document too noisy" });
    }

    const rawTokens = matches.map(m => m[1]);

    // Step 2: Normalization
    const normalizedAmounts = rawTokens.map(normalizeToken);
    const normalizationConfidence = 0.8; // could be dynamic

    // Step 3: Classification by context
    const amounts = normalizedAmounts.map((amount, i) => {
      const surroundingText = getSurroundingText(text, rawTokens[i]);
      const type = Object.keys(contextMap).find(key => contextMap[key].test(surroundingText)) || "unknown";
      return { type, value: amount, source: `text: '${surroundingText}'` };
    });

    // Step 4: Final output
    let currency = "Unknown";
    if (text.includes("₹") || text.includes("Rs")) currency = "INR";
    else if (text.includes("$")) currency = "USD";

    res.json({
      currency,
      amounts,
      status: "ok",
      raw_tokens: rawTokens,
      ocr_confidence: ocrConfidence,
      normalization_confidence: normalizationConfidence
    });

  } catch (err) {
    res.status(500).json({ error: "OCR failed", details: err.message });
  }
};

