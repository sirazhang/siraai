// Tongyi Qianwen API Integration
// 通义千问 API 集成

const TONGYI_API_KEY = 'sk-';
const TONGYI_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

/**
 * Generate a concise one-sentence summary of the blog content
 * 生成博客内容的简洁一句话总结
 * @param {string} blogText - The full blog text content
 * @returns {Promise<string>} - One-sentence summary
 */
async function generateBlogSummary(blogText) {
  const prompt = `Please read the following blog content and generate a concise one-sentence summary in Chinese. The summary should capture the core message or main idea of the content in a clear and engaging way.

Blog content:
${blogText}

Please provide ONLY the one-sentence summary in Chinese, without any additional explanation or formatting.`;

  try {
    console.log('Generating blog summary with Tongyi Qianwen...');
    
    const response = await fetch(TONGYI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TONGYI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful assistant that creates concise, engaging summaries in Chinese.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 100
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Tongyi API error:', errorData);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Tongyi API response:', data);

    if (data.choices && data.choices.length > 0 && data.choices[0].message) {
      const summary = data.choices[0].message.content.trim();
      console.log('Generated summary:', summary);
      return summary;
    } else {
      throw new Error('Invalid response format from Tongyi API');
    }

  } catch (error) {
    console.error('Error generating summary with Tongyi:', error);
    throw error;
  }
}

// Export functions
window.TongyiAPI = {
  generateBlogSummary
};
