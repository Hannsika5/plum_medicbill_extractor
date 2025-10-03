# Medical Amount Extractor (Backend Demo)

Small backend service that extracts financial amounts from medical bills (typed or scanned) and returns normalized, classified amounts with provenance.

## Features

* Accepts **image** uploads (OCR via Tesseract)
* Normalization of OCR errors (e.g., `l` → `1`, `O` → `0`)
* Context classification (total, paid, due, discount)
* Provenance (text snippet) and per-stage confidences
* Guardrails for noisy documents

---

## Quick Start (Local)

1. **Clone repo**

```bash
git clone https://github.com/<Hannsika5>/<plum_medicbill_extractor>.git
cd <repo>
```

2. **Install dependencies**

```bash
npm install
```

3. **Run backend**

```bash
npm start
```

---

## Using Ngrok (Public Access)

1. Install ngrok globally if not already:

```bash
npm install -g ngrok
```

2. Run your backend locally (e.g., port 5000):

```bash
npm start
```

3. Expose it with ngrok:

```bash
ngrok http 5000
```

4. Copy the generated public URL, e.g.:

```
https://ecologically-interpretive-genesis.ngrok-free.dev
```

5. Use this URL in Postman or curl to test your endpoints.

---

## API Endpoints

### 1. Extract from Image

**POST** `/api/extract-amounts`

**Request (multipart/form-data)**

* Key: `billImage` → upload file

**Sample Response**

```json
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
```

**Guardrail (if no amounts)**

```json
{"status":"no_amounts_found","reason":"document too noisy"}
```

---

### 2. Sample Postman / curl Requests

**Postman:**

* Method: POST
* URL: `https://ecologically-interpretive-genesis.ngrok-free.dev/api/extract-amounts`
* Body → `form-data` → Key: `billImage`, Type: File → choose your image

**curl:**

```bash
curl -X POST "https://ecologically-interpretive-genesis.ngrok-free.dev/api/extract-amounts" \
  -F "billImage=@path_to_your_image.jpg"
```

Replace `path_to_your_image.jpg` with the file path on your system.

---

### 3. Extract from Text

**POST** `/api/extract-amounts/text`

**Request (application/json)**

```json
{
  "text": "Total: INR 1200 | Paid: 1000 | Due: 200"
}
```

**Sample Response**

```json
{
  "currency": "INR",
  "amounts": [
    {"type":"total_bill","value":1200,"source":"text: 'Total: INR 1200'"},
    {"type":"paid","value":1000,"source":"text: 'Paid: 1000'"},
    {"type":"due","value":200,"source":"text: 'Due: 200'"}
  ],
  "status":"ok"
}
```

---

## Guardrail Explanation

* If **no numeric amounts** can be extracted (too noisy OCR or blank document), the API returns:

```json
{"status":"no_amounts_found","reason":"document too noisy"}
```

* Ensures the system **fails gracefully** and informs the user why extraction failed.

---

## Tech Stack

* **Node.js + Express** → API backend
* **Tesseract.js** → OCR from images
* **Regex + heuristics** → Numeric extraction and correction
* **Multer** → File upload middleware
