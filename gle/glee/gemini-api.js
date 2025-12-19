// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyCc5KGlEwezBOEOhUgWBo2G-w-XrSPYROI';
const GEMINI_TEXT_MODEL = 'gemini-1.5-flash-latest'; // Fallback to stable model
const GEMINI_TEXT_API = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`;

// Nano Banana API Configuration
const NANO_BANANA_API_KEY = 'AIzaSyCc5KGlEwezBOEOhUgWBo2G-w-XrSPYROI';
// Note: If using Google's Imagen or similar service, update the endpoint below
const NANO_BANANA_API = 'https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict'; // Update if using different service

// Store generated flashcards for favorites
let generatedFlashcards = [];

/**
 * Extract vocabulary from blog text and generate mind map structure
 */
async function extractVocabularyMindMap(blogText) {
  const prompt = `Now please first re-extract and refine the content of the text according to the following instructions:
1. Extract the core content of the text and generate a text-based mind map.
2. The text-based mind map must have clear hierarchical levels, and each parent level should contain no more than three sub-levels.
3. The extracted wording at each level should not exceed five words.
4. The content between levels must be interrelated, logical, and strictly derived from the original text.
5. The extracted content at each level should be presented in bilingual form (Chinese and English).
6. Do not include the introduction or conclusion of the document; focus mainly on the core content of the text.

Text to analyze:
${blogText}

Please extract exactly 6 key vocabulary words with their meanings in this exact format:
1. Word (phonetic) - Chinese meaning
2. Word (phonetic) - Chinese meaning
...

Keep it simple and focused on the most important words.`;

  try {
    const response = await fetch(`${GEMINI_TEXT_API}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the model name.');
      }
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('API Response:', data); // Debug log
    
    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('Full API response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format from API');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error calling Gemini text API:', error);
    throw error;
  }
}

/**
 * Generate flashcard image using Nano Banana API
 * Two-stage process: Gemini 3 Pro extracts text → Nano Banana generates images
 */
async function generateFlashcardImage(vocabularyData, cardCount = 6, illustrationStyle = 'Zootopia character style') {
  console.log('Generating flashcard images with Nano Banana:', { vocabularyData, cardCount, illustrationStyle });
  
  try {
    // Parse vocabulary data to extract words
    const words = parseVocabularyWords(vocabularyData);
    
    if (words.length === 0) {
      console.warn('No words extracted from vocabulary data');
      return null;
    }
    
    // Generate images for each word using Nano Banana
    const imagePromises = words.slice(0, cardCount).map(async (word) => {
      const prompt = `${illustrationStyle}: ${word.english} - ${word.chinese}`;
      
      try {
        const response = await fetch(NANO_BANANA_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${NANO_BANANA_API_KEY}`
          },
          body: JSON.stringify({
            prompt: prompt,
            model: 'nano-banana-pro', // or 'nano-banana' for standard
            width: 512,
            height: 512,
            steps: 20
          })
        });
        
        if (!response.ok) {
          console.error(`Nano Banana API error for "${word.english}": ${response.status}`);
          return null;
        }
        
        const data = await response.json();
        return {
          word: word.english,
          meaning: word.chinese,
          imageUrl: data.image_url || data.url // Adjust based on actual API response
        };
      } catch (error) {
        console.error(`Error generating image for "${word.english}":`, error);
        return null;
      }
    });
    
    const images = await Promise.all(imagePromises);
    return images.filter(img => img !== null);
    
  } catch (error) {
    console.error('Error in flashcard image generation:', error);
    return null;
  }
}

/**
 * Parse vocabulary data to extract words
 */
function parseVocabularyWords(vocabularyData) {
  const words = [];
  const lines = vocabularyData.split('\n');
  
  for (const line of lines) {
    // Match pattern: "1. Word (phonetic) - Chinese meaning"
    const match = line.match(/\d+\.\s*([a-zA-Z]+)\s*\([^)]+\)\s*-\s*(.+)/);
    if (match) {
      words.push({
        english: match[1].trim(),
        chinese: match[2].trim()
      });
    }
  }
  
  return words;
}

/**
 * Save flashcard to favorites
 */
function saveFlashcardToFavorites(flashcardData) {
  // Get existing favorites from localStorage
  let favorites = JSON.parse(localStorage.getItem('flashcardFavorites') || '[]');
  
  // Add new flashcard
  favorites.push({
    ...flashcardData,
    timestamp: new Date().toISOString(),
    id: Date.now().toString()
  });
  
  // Save back to localStorage
  localStorage.setItem('flashcardFavorites', JSON.stringify(favorites));
  
  return true;
}

/**
 * Get all favorite flashcards
 */
function getFavoriteFlashcards() {
  return JSON.parse(localStorage.getItem('flashcardFavorites') || '[]');
}

/**
 * Print flashcard
 */
function printFlashcard(imageElement) {
  const printWindow = window.open('', '_blank');
  printWindow.document.write('<html><head><title>Print Flashcard</title>');
  printWindow.document.write('<style>body { margin: 0; } img { width: 100%; }</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(imageElement.outerHTML);
  printWindow.document.write('</body></html>');
  printWindow.document.close();
  
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
}

// Export functions for use in main app
window.GeminiAPI = {
  extractVocabularyMindMap,
  generateFlashcardImage,
  saveFlashcardToFavorites,
  getFavoriteFlashcards,
  printFlashcard
};
