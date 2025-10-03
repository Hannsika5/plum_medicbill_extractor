# Medical Amount Extractor (Backend Demo)

Small backend service that extracts financial amounts from medical bills (text or image) and returns normalized, classified amounts with provenance.

## Features
- Accepts **image** uploads (OCR via Tesseract) and **plain text** input
- Normalization of OCR errors (e.g., `l` → `1`, `O` → `0`)
- Context classification (total, paid, due, discount)
- Provenance (text snippet) and per-stage confidences
- Guardrails for noisy documents

## Quick Start (local)
1. Clone:
   ```bash
   git clone https://github.com/<Hannsika5>/<plum_medicbill_extractor>.git
   cd <repo>
2. Install:
   ```bash
   npm install
   ```
3. Run
   ```bash
   npm start
   ```

# API Endpoints
1. Extract from Image
POST /api/extract-amounts
Request: multipart/form-data
Key: billImage → upload file

Sample Response

{
  "currency": "INR",
  "amounts": [
    {"type":"total_bill","value":1200,"source":"text: 'Total: INR 1200'"},
    {"type":"paid","value":1000,"source":"text: 'Paid: 1000'"},
    {"type":"due","value":200,"source":"text: 'Due: 200'"}
  ],
  "raw_tokens": ["1200","1000","200"],
  "ocr_confidence": 0.74,
  "normalization_confidence": 0.82,
  "status":"ok"
}
Guardrail (if no amounts)
{"status":"no_amounts_found","reason":"document too noisy"}

2. Extract from Text
POST /api/extract-amounts/text
Request: application/json
{
  "text": "Total: INR 1200 | Paid: 1000 | Due: 200"
}
Sample Response

{
  "currency": "INR",
  "amounts": [
    {"type":"total_bill","value":1200,"source":"text: 'Total: INR 1200'"},
    {"type":"paid","value":1000,"source":"text: 'Paid: 1000'"},
    {"type":"due","value":200,"source":"text: 'Due: 200'"}
  ],
  "status":"ok"
}

# Tech Stack
Node.js + Express → API backend

Tesseract.js → OCR from images

Regex + heuristics → Numeric extraction and correction

Multer → File upload middleware





