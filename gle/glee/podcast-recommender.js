// ========== Podcast Recommendation System ==========

(function() {
  // RSS Feed sources - 播客RSS源配置
  const RSS_FEEDS = {
    learning: [
      {
        name: 'BBC Learning English',
        url: 'https://podcasts.files.bbci.co.uk/p02pc9tn.rss',
        category: 'education',
        language: 'en'
      },
      {
        name: 'All Ears English',
        url: 'https://feeds.megaphone.fm/allearsenglish',
        category: 'education',
        language: 'en'
      }
    ],
    // 可以添加更多RSS源
  };

  // Topic similarity mapping - 主题相似度映射
  const TOPIC_SIMILARITY = {
    'christmas': ['holiday', 'winter', 'celebration', 'festival', 'new year', 'santa'],
    'halloween': ['holiday', 'autumn', 'celebration', 'festival', 'scary', 'costume'],
    'ielts': ['education', 'english', 'learning', 'exam', 'test', 'study'],
    'gossip': ['entertainment', 'celebrity', 'news', 'social', 'culture']
  };

  // Mock podcast database - 模拟播客数据库（可替换为实际RSS数据）
  const PODCAST_DATABASE = [
    {
      id: 'winter-holidays',
      title: 'Winter Holiday Traditions',
      description: 'Explore holiday celebrations around the world during winter season',
      coverImage: 'public/christmascover.png',
      audioFile: 'public/christmas.mp3',
      textFile: 'public/christmas.txt',
      category: 'holiday',
      tags: ['christmas', 'holiday', 'winter', 'celebration'],
      duration: '15:30',
      difficulty: 'intermediate'
    },
    {
      id: 'new-year-celebration',
      title: 'New Year Celebrations Worldwide',
      description: 'Learn about New Year traditions in different cultures',
      coverImage: 'public/christmascover.png',
      audioFile: 'public/christmas.mp3',
      textFile: 'public/christmas.txt',
      category: 'holiday',
      tags: ['new year', 'holiday', 'celebration', 'culture'],
      duration: '12:45',
      difficulty: 'intermediate'
    },
    {
      id: 'autumn-festivals',
      title: 'Autumn Festival Stories',
      description: 'Discover autumn celebrations and harvest festivals',
      coverImage: 'public/halloweencover.png',
      audioFile: 'public/halloween.mp3',
      textFile: 'public/halloween.txt',
      category: 'holiday',
      tags: ['halloween', 'autumn', 'festival', 'celebration'],
      duration: '14:20',
      difficulty: 'intermediate'
    },
    {
      id: 'ielts-speaking',
      title: 'IELTS Speaking Practice',
      description: 'Advanced IELTS speaking strategies and tips',
      coverImage: 'public/ieltscover.png',
      audioFile: 'public/ielts.mp3',
      textFile: 'public/ielts.txt',
      category: 'education',
      tags: ['ielts', 'english', 'exam', 'speaking'],
      duration: '18:15',
      difficulty: 'advanced'
    },
    {
      id: 'daily-english',
      title: 'Daily English Conversations',
      description: 'Practice everyday English through real conversations',
      coverImage: 'public/ieltscover.png',
      audioFile: 'public/ielts.mp3',
      textFile: 'public/ielts.txt',
      category: 'education',
      tags: ['english', 'learning', 'conversation', 'daily'],
      duration: '10:30',
      difficulty: 'beginner'
    }
  ];

  // Current listening history
  let listeningHistory = JSON.parse(localStorage.getItem('listeningHistory') || '[]');

  /**
   * Calculate similarity score between two topics
   */
  function calculateSimilarity(currentTags, candidateTags) {
    let score = 0;
    
    currentTags.forEach(tag => {
      const similar = TOPIC_SIMILARITY[tag.toLowerCase()] || [];
      
      // Exact match
      if (candidateTags.includes(tag)) {
        score += 10;
      }
      
      // Similar tag match
      candidateTags.forEach(candidateTag => {
        if (similar.includes(candidateTag.toLowerCase())) {
          score += 5;
        }
      });
    });
    
    return score;
  }

  /**
   * Get recommendations based on current podcast
   */
  function getRecommendations(currentPodcastId, count = 3) {
    const currentPodcast = PODCAST_DATABASE.find(p => p.id === currentPodcastId);
    
    if (!currentPodcast) {
      console.warn('Current podcast not found:', currentPodcastId);
      return [];
    }

    // Calculate similarity scores for all other podcasts
    const recommendations = PODCAST_DATABASE
      .filter(p => p.id !== currentPodcastId) // Exclude current podcast
      .map(podcast => ({
        ...podcast,
        similarityScore: calculateSimilarity(currentPodcast.tags, podcast.tags)
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore) // Sort by score
      .slice(0, count); // Take top N

    return recommendations;
  }

  /**
   * Show recommendation modal when podcast finishes
   */
  function showRecommendationModal(currentTopic) {
    const recommendations = getRecommendations(currentTopic, 3);
    
    if (recommendations.length === 0) {
      return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'recommendation-modal';
    modal.innerHTML = `
      <div class="recommendation-overlay"></div>
      <div class="recommendation-content">
        <button class="close-recommendation-btn" id="close-recommendation">×</button>
        <h2 class="recommendation-title">🎧 你可能还喜欢</h2>
        <p class="recommendation-subtitle">根据你刚听完的内容推荐</p>
        <div class="recommendation-list">
          ${recommendations.map(podcast => `
            <div class="recommendation-item" data-podcast-id="${podcast.id}">
              <img src="${podcast.coverImage}" alt="${podcast.title}" class="recommendation-cover" />
              <div class="recommendation-info">
                <h3 class="recommendation-podcast-title">${podcast.title}</h3>
                <p class="recommendation-description">${podcast.description}</p>
                <div class="recommendation-meta">
                  <span class="recommendation-duration">⏱ ${podcast.duration}</span>
                  <span class="recommendation-difficulty">📊 ${podcast.difficulty}</span>
                </div>
                <div class="recommendation-tags">
                  ${podcast.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
              </div>
              <button class="recommendation-play-btn" data-podcast-id="${podcast.id}">
                ▶ 播放
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    const closeBtn = modal.querySelector('#close-recommendation');
    const overlay = modal.querySelector('.recommendation-overlay');
    const playBtns = modal.querySelectorAll('.recommendation-play-btn');

    closeBtn.addEventListener('click', () => closeRecommendationModal(modal));
    overlay.addEventListener('click', () => closeRecommendationModal(modal));

    playBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const podcastId = e.target.dataset.podcastId;
        playRecommendedPodcast(podcastId);
        closeRecommendationModal(modal);
      });
    });

    // Animate in
    setTimeout(() => {
      modal.classList.add('show');
    }, 10);
  }

  /**
   * Close recommendation modal
   */
  function closeRecommendationModal(modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      if (modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  }

  /**
   * Play recommended podcast
   */
  function playRecommendedPodcast(podcastId) {
    const podcast = PODCAST_DATABASE.find(p => p.id === podcastId);
    
    if (!podcast) {
      console.warn('Podcast not found:', podcastId);
      return;
    }

    // Switch to notebook view
    const notebookView = document.getElementById('view-notebook');
    if (notebookView) {
      // Hide all views
      document.querySelectorAll('.view').forEach(v => v.classList.remove('view-active'));
      notebookView.classList.add('view-active');
    }

    // Load podcast content
    const audioElement = document.getElementById('audio-element');
    const blogImage = document.getElementById('blog-image');
    const blogText = document.getElementById('blog-text');

    if (audioElement) {
      audioElement.src = podcast.audioFile;
      audioElement.load();
    }

    if (blogImage) {
      blogImage.src = podcast.coverImage;
    }

    if (blogText) {
      // Load text file
      fetch(podcast.textFile)
        .then(response => response.text())
        .then(text => {
          blogText.textContent = text;
        })
        .catch(error => {
          console.error('Error loading text:', error);
          blogText.textContent = podcast.description;
        });
    }

    // Add to listening history
    addToListeningHistory(podcastId);

    console.log('Now playing:', podcast.title);
  }

  /**
   * Add podcast to listening history
   */
  function addToListeningHistory(podcastId) {
    const historyItem = {
      podcastId: podcastId,
      timestamp: new Date().toISOString()
    };

    listeningHistory.unshift(historyItem);
    
    // Keep only last 20 items
    if (listeningHistory.length > 20) {
      listeningHistory = listeningHistory.slice(0, 20);
    }

    localStorage.setItem('listeningHistory', JSON.stringify(listeningHistory));
  }

  /**
   * Monitor audio playback and show recommendations when finished
   */
  function initializeAudioMonitoring() {
    const audioElement = document.getElementById('audio-element');
    
    if (!audioElement) {
      console.warn('Audio element not found');
      return;
    }

    audioElement.addEventListener('ended', () => {
      console.log('Podcast finished playing');
      
      // Determine current topic (you may need to adjust this based on your app structure)
      const currentTopic = window.currentTopic || 'christmas';
      
      // Show recommendations after a short delay
      setTimeout(() => {
        showRecommendationModal(currentTopic);
      }, 1000);
    });

    console.log('Podcast recommendation system initialized');
  }

  /**
   * Fetch podcasts from RSS feed (CORS may be an issue - need proxy)
   */
  async function fetchRSSFeed(feedUrl) {
    try {
      // Note: Direct RSS fetching may be blocked by CORS
      // You might need to use a CORS proxy or backend service
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const parser = new DOMParser();
      const xml = parser.parseFromString(data.contents, 'text/xml');
      
      const items = xml.querySelectorAll('item');
      const podcasts = [];
      
      items.forEach((item, index) => {
        if (index < 10) { // Limit to 10 items
          const enclosure = item.querySelector('enclosure');
          podcasts.push({
            id: `rss-${Date.now()}-${index}`,
            title: item.querySelector('title')?.textContent || 'Unknown',
            description: item.querySelector('description')?.textContent || '',
            audioFile: enclosure?.getAttribute('url') || '',
            coverImage: item.querySelector('itunes\\:image, image')?.getAttribute('href') || 'public/logo.png',
            category: item.querySelector('category')?.textContent || 'general',
            tags: [item.querySelector('category')?.textContent || 'podcast'],
            duration: item.querySelector('itunes\\:duration')?.textContent || '00:00',
            difficulty: 'intermediate'
          });
        }
      });
      
      return podcasts;
    } catch (error) {
      console.error('Error fetching RSS feed:', error);
      return [];
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAudioMonitoring);
  } else {
    initializeAudioMonitoring();
  }

  // Expose functions globally
  window.PodcastRecommender = {
    getRecommendations,
    showRecommendationModal,
    playRecommendedPodcast,
    fetchRSSFeed,
    PODCAST_DATABASE
  };

})();
