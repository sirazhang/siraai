// Gemini API Configuration
const GEMINI_API_KEY = 'AIzaSyD_-zf5YJLHAEuiEzZN2mbnmansxxcKkzQ';
const GEMINI_TEXT_MODEL = 'gemini-3-pro-preview'; // Use Gemini 3 Pro for text generation
const GEMINI_TEXT_API = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TEXT_MODEL}:generateContent`;

// Nano Banana API Configuration (using Gemini for image generation)
const NANO_BANANA_API_KEY = 'AIzaSyD_-zf5YJLHAEuiEzZN2mbnmansxxcKkzQ';
const IMAGEN_MODEL = 'imagen-3.0-generate-001'; // Imagen model for image generation
const NANO_BANANA_API = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGEN_MODEL}:predict`;

// Store generated flashcards for favorites
let generatedFlashcards = [];

/**
 * Test network connectivity to Google API
 */
async function testGeminiConnection() {
  console.log('Testing Gemini API connectivity...');
  try {
    const testResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
    
    console.log('Connection test status:', testResponse.status);
    
    if (testResponse.ok) {
      const data = await testResponse.json();
      console.log('✅ 网络连接正常');
      console.log('可用模型:', data.models?.slice(0, 3).map(m => m.name));
      return true;
    } else if (testResponse.status === 403) {
      console.error('❌ API Key 访问被拒绝');
      console.error('可能原因：');
      console.error('1. API Key 未启用 Generative Language API');
      console.error('2. 账号所在地区不支持');
      console.error('3. API Key 已过期或被禁用');
      return false;
    } else if (testResponse.status === 401) {
      console.error('❌ API Key 认证失败');
      console.error('请检查 API Key 是否正确');
      return false;
    } else {
      console.error('❌ 连接测试失败:', testResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ 网络错误:', error.message);
    console.error('可能原因：');
    console.error('1. 无法访问 Google API（可能需要 VPN）');
    console.error('2. 防火墙阻止了请求');
    console.error('3. DNS 解析失败');
    return false;
  }
}

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
    console.log('Calling Gemini API...');
    console.log('API URL:', GEMINI_TEXT_API);
    console.log('Model:', GEMINI_TEXT_MODEL);
    
    const response = await fetch(GEMINI_TEXT_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8000,  // Increase for Gemini 3 Pro thinking mode
          thinkingConfig: {
            thinkingLevel: "low"  // Control thinking behavior
          }
        }
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('API Error Details:', errorData);
      
      if (response.status === 429) {
        throw new Error('API 调用次数已达上限，请稍后再试。可能原因：1. API 配额用尽 2. 请求过于频繁');
      } else if (response.status === 404) {
        throw new Error('API 端点未找到。请检查模型名称是否正确: gemini-3-pro-preview');
      } else if (response.status === 403) {
        throw new Error('API 访问被拒绝。可能原因：1. API Key 无效 2. API Key 未启用 Gemini API 3. 地区限制');
      } else if (response.status === 401) {
        throw new Error('API Key 认证失败。请检查 API Key 是否正确');
      } else if (response.status >= 500) {
        throw new Error(`Google 服务器错误 (${response.status})。请稍后重试`);
      }
      throw new Error(`Gemini API 错误: ${response.status} - ${errorData.error?.message || '未知错误'}`);
    }

    const data = await response.json();
    
    console.log('API Response:', data); // Debug log
    
    // Handle Gemini 3 Pro response format
    if (!data.candidates || !data.candidates[0]) {
      console.error('Full API response:', JSON.stringify(data, null, 2));
      throw new Error('No candidates in API response');
    }
    
    const candidate = data.candidates[0];
    
    // Check for finish reason issues
    if (candidate.finishReason === 'MAX_TOKENS') {
      console.warn('Response was truncated due to MAX_TOKENS. Increase maxOutputTokens if needed.');
    }
    
    // Extract text from response (handle different formats)
    let responseText = null;
    
    // Try to get text from content.parts
    if (candidate.content?.parts?.[0]?.text) {
      responseText = candidate.content.parts[0].text;
    }
    // Try to get from thought field (if Gemini 3 Pro uses thinking mode)
    else if (candidate.thought) {
      responseText = candidate.thought;
    }
    // Try to get from any other text field
    else if (candidate.text) {
      responseText = candidate.text;
    }
    
    if (!responseText) {
      console.error('Full API response:', JSON.stringify(data, null, 2));
      throw new Error('Invalid response format: no text content found');
    }
    
    return responseText;
  } catch (error) {
    console.error('Error calling Gemini text API:', error);
    throw error;
  }
}

/**
 * Generate flashcard image using Imagen API
 * Two-stage process: Gemini 2.0 extracts text → Imagen generates images
 */
async function generateFlashcardImage(vocabularyData, cardCount = 6, illustrationStyle = 'Zootopia character style') {
  console.log('Generating flashcard images with Imagen:', { vocabularyData, cardCount, illustrationStyle });
  
  try {
    // Parse vocabulary data to extract words
    const words = parseVocabularyWords(vocabularyData);
    
    if (words.length === 0) {
      console.warn('No words extracted from vocabulary data');
      return null;
    }
    
    // Generate images for each word using Imagen
    const imagePromises = words.slice(0, cardCount).map(async (word) => {
      const prompt = `Create a ${illustrationStyle} illustration for the word "${word.english}" (${word.chinese}). The image should be colorful, educational, and suitable for a vocabulary flashcard.`;
      
      try {
        const response = await fetch(NANO_BANANA_API, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': NANO_BANANA_API_KEY
          },
          body: JSON.stringify({
            instances: [{
              prompt: prompt
            }],
            parameters: {
              sampleCount: 1,
              aspectRatio: "1:1",
              safetyFilterLevel: "block_some",
              personGeneration: "allow_adult"
            }
          })
        });
        
        if (!response.ok) {
          console.error(`Imagen API error for "${word.english}": ${response.status}`);
          const errorData = await response.json().catch(() => ({}));
          console.error('Error details:', errorData);
          return null;
        }
        
        const data = await response.json();
        // Imagen returns base64 encoded images
        if (data.predictions && data.predictions[0]) {
          return {
            word: word.english,
            meaning: word.chinese,
            imageUrl: `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`
          };
        }
        return null;
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
  printFlashcard,
  testGeminiConnection  // Add test function
};
