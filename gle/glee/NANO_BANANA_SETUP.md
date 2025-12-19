# Nano Banana Integration Guide

## Overview
This project now uses a **two-stage AI generation process**:
1. **Gemini 3 Pro** - Extracts vocabulary and creates mind map from blog text
2. **Nano Banana / Nano Banana Pro** - Generates illustrated flashcard images

## Configuration Required

### 1. Update Nano Banana API Credentials
Edit `gemini-api.js` and replace the placeholder values:

```javascript
// Line 7-8 in gemini-api.js
const NANO_BANANA_API = 'https://api.nanobanana.ai/v1/generate'; // Update with actual endpoint
const NANO_BANANA_API_KEY = 'YOUR_NANO_BANANA_KEY'; // Replace with your API key
```

### 2. API Endpoint Format
The code expects Nano Banana API to accept requests in this format:

**Request:**
```json
{
  "prompt": "Zootopia character style: vocabulary - 词汇",
  "model": "nano-banana-pro",
  "width": 512,
  "height": 512,
  "steps": 20
}
```

**Response:**
```json
{
  "image_url": "https://...", // or "url": "https://..."
  "status": "success"
}
```

### 3. Adjust Response Parsing
If your Nano Banana API returns data in a different format, update line 123 in `gemini-api.js`:

```javascript
imageUrl: data.image_url || data.url // Adjust field names as needed
```

## How It Works

### Stage 1: Text Extraction (Gemini 3 Pro)
```javascript
const vocabularyData = await window.GeminiAPI.extractVocabularyMindMap(blogText);
```
- Extracts 6 vocabulary words from blog content
- Creates bilingual (English/Chinese) mind map
- Returns formatted text: "1. Word (phonetic) - Chinese meaning"

### Stage 2: Image Generation (Nano Banana)
```javascript
const imageData = await window.GeminiAPI.generateFlashcardImage(
  vocabularyData, 
  cardCount, 
  illustrationStyle
);
```
- Parses extracted vocabulary words
- Calls Nano Banana API for each word
- Returns array of image objects with word, meaning, and imageUrl

### Stage 3: Display
- If images are successfully generated: Shows grid of flashcards with images
- If image generation fails: Shows formatted text fallback

## Testing Without Nano Banana

The current implementation will gracefully fallback to text display if:
- Nano Banana API key is not configured
- API returns errors
- Network issues occur

You'll see the extracted vocabulary in a formatted text box instead of images.

## Customization Options

Users can customize flashcard generation:
- **Card Count**: 4, 6, or 9 cards (4/6/9 words)
- **Illustration Style**: e.g., "Zootopia character style", "Anime style", etc.

## Model Selection

To switch between Nano Banana models, update the request body:
```javascript
model: 'nano-banana-pro'  // For Pro version
// or
model: 'nano-banana'      // For standard version
```

## Error Handling

The system handles various error scenarios:
- API rate limiting (429 errors)
- Invalid API keys
- Network failures
- Parsing errors

All errors show user-friendly messages in Chinese.

## Next Steps

1. Obtain Nano Banana API credentials
2. Update `NANO_BANANA_API` and `NANO_BANANA_API_KEY` in `gemini-api.js`
3. Test with a blog topic (load content first)
4. Click "生成单词闪卡" to generate flashcards
5. If images appear - setup is complete!
6. If text appears - check console for error messages
