(function () {
  const views = {
    home: document.getElementById("view-home"),
    profile: document.getElementById("view-profile"),
    notebook: document.getElementById("view-notebook"),
  };

  const audioElement = document.getElementById("audio-element");
  const blogImage = document.getElementById("blog-image");
  const blogText = document.getElementById("blog-text");
  const playPauseBtn = document.getElementById("play-pause-btn");
  const playPauseIcon = document.getElementById("play-pause-icon");
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const generatePracticeBtn = document.getElementById("generate-practice");
  const practiceContent = document.getElementById("practice-content");
  const practiceQuestions = document.getElementById("practice-questions");
  const chatMessages = document.getElementById("chat-messages");
  const chatInput = document.getElementById("chat-input");
  const chatSendBtn = document.getElementById("chat-send");

  // Flashcard elements
  const generateFlashcardBtn = document.getElementById("generate-flashcard");
  const customizeFlashcardBtn = document.getElementById("customize-flashcard");
  const flashcardCustomize = document.getElementById("flashcard-customize");
  const generateCustomFlashcardBtn = document.getElementById("generate-custom-flashcard");
  const illustrationStyleInput = document.getElementById("illustration-style");
  const flashcardResult = document.getElementById("flashcard-result");
  const flashcardLoading = document.getElementById("flashcard-loading");
  const flashcardImageContainer = document.getElementById("flashcard-image-container");
  const printFlashcardBtn = document.getElementById("print-flashcard");
  const favoriteFlashcardBtn = document.getElementById("favorite-flashcard");

  let selectedCardCount = 6;
  let currentFlashcardImage = null;

  let currentTopic = "ielts";
  let isPlaying = false;

  const topics = ["ielts", "christmas", "halloween", "gossip"];
  
  const topicData = {
    ielts: {
      image: "public/ielts.png",
      audio: "public/ielts.mp3",
      text: "public/ielts.txt",
      name: "IELTS"
    },
    christmas: {
      image: "public/christmas.png",
      audio: "public/christmas.mp3",
      text: "public/christmas.txt",
      name: "Christmas"
    },
    halloween: {
      image: "public/halloween.png",
      audio: "public/halloween.mp3",
      text: "public/halloween.txt",
      name: "Halloween"
    },
    gossip: {
      image: "public/gossip.png",
      audio: "public/gossip.mp3",
      text: "public/gossip.txt",
      name: "Gossip"
    }
  };

  const practiceTemplates = {
    ielts: [
      "What is the main topic discussed?",
      "List three key points mentioned.",
      "What examples were provided?",
      "Summarize in 2-3 sentences."
    ],
    christmas: [
      "What traditions are mentioned?",
      "Describe the cultural aspects discussed.",
      "What countries are mentioned?",
      "List common Christmas activities."
    ],
    halloween: [
      "What is the historical origin?",
      "Describe modern celebrations.",
      "What costumes are mentioned?",
      "List popular Halloween activities."
    ]
  };

  function setActiveView(key) {
    Object.values(views).forEach((el) => {
      if (!el) return;
      el.classList.remove("view-active");
    });
    if (views[key]) {
      views[key].classList.add("view-active");
      
      // Load favorites and draw radar chart when viewing profile
      if (key === 'profile') {
        loadFavorites();
        setTimeout(() => drawPodcastRadarChart(), 100);
      }
    }
  }

  function loadFavorites() {
    const favoritesGrid = document.getElementById('favorites-grid');
    const selectAllBtn = document.getElementById('select-all-btn');
    const batchDownloadBtn = document.getElementById('batch-download-btn');
    const favoritesCountEl = document.getElementById('favorites-count');
    
    if (!favoritesGrid) return;
    
    const favorites = window.GeminiAPI.getFavoriteFlashcards();
    
    // Update favorites count
    if (favoritesCountEl) {
      favoritesCountEl.textContent = favorites.length;
    }
    
    if (favorites.length === 0) {
      favoritesGrid.innerHTML = `
        <div class="placeholder-container">
          <img src="public/status.png" alt="空状态" class="placeholder-image" />
          <p class="placeholder-text">还没有收藏内容</p>
        </div>
      `;
      if (selectAllBtn) selectAllBtn.style.display = 'none';
      if (batchDownloadBtn) batchDownloadBtn.style.display = 'none';
      return;
    }
    
    // Show action buttons
    if (selectAllBtn) selectAllBtn.style.display = 'block';
    if (batchDownloadBtn) batchDownloadBtn.style.display = 'block';
    
    favoritesGrid.innerHTML = '';
    favorites.forEach((fav, index) => {
      const item = document.createElement('div');
      item.className = 'favorite-item';
      item.dataset.index = index;
      item.innerHTML = `
        <div class="favorite-checkbox">✓</div>
        <img src="${fav.imageSrc}" alt="Flashcard" />
        <div class="favorite-meta">
          <div>${fav.topic}</div>
          <div>${new Date(fav.timestamp).toLocaleDateString('zh-CN')}</div>
        </div>
      `;
      
      // Toggle selection
      item.addEventListener('click', (e) => {
        if (item.classList.contains('selectable')) {
          item.classList.toggle('selected');
          if (item.classList.contains('selected')) {
            selectedFavorites.add(index);
          } else {
            selectedFavorites.delete(index);
          }
        }
      });
      
      favoritesGrid.appendChild(item);
    });
  }

  // Nickname editing functions
  function editNickname() {
    const profileNameDisplay = document.getElementById('profile-name-display');
    const nicknameInput = document.getElementById('nickname-input');
    
    if (!profileNameDisplay || !nicknameInput) return;
    
    const currentName = profileNameDisplay.textContent;
    nicknameInput.value = currentName;
    nicknameInput.style.display = 'block';
    profileNameDisplay.style.display = 'none';
    nicknameInput.focus();
    nicknameInput.select();
  }

  function saveNickname() {
    const profileNameDisplay = document.getElementById('profile-name-display');
    const nicknameInput = document.getElementById('nickname-input');
    
    if (!profileNameDisplay || !nicknameInput) return;
    
    const newName = nicknameInput.value.trim();
    if (newName) {
      profileNameDisplay.textContent = newName;
      localStorage.setItem('userNickname', newName);
    }
    
    nicknameInput.style.display = 'none';
    profileNameDisplay.style.display = 'block';
  }

  // Favorites batch selection
  let selectedFavorites = new Set();

  function toggleSelectAll() {
    const favoriteItems = document.querySelectorAll('.favorite-item');
    const allSelected = selectedFavorites.size === favoriteItems.length;
    
    selectedFavorites.clear();
    
    favoriteItems.forEach((item, index) => {
      item.classList.add('selectable');
      if (!allSelected) {
        item.classList.add('selected');
        selectedFavorites.add(index);
      } else {
        item.classList.remove('selected');
      }
    });
    
    const selectAllBtn = document.getElementById('select-all-btn');
    if (selectAllBtn) {
      selectAllBtn.textContent = allSelected ? '全选' : '取消全选';
    }
  }

  function batchDownloadFavorites() {
    if (selectedFavorites.size === 0) {
      alert('请先选择要下载的收藏！');
      return;
    }
    
    // Check download limit
    if (!checkDownloadLimit()) {
      return;
    }
    
    const favorites = window.GeminiAPI.getFavoriteFlashcards();
    const selectedIndexes = Array.from(selectedFavorites);
    
    console.log(`开始批量下载 ${selectedIndexes.length} 个收藏...`);
    
    // Download with delays to avoid browser blocking
    let downloadCount = 0;
    selectedIndexes.forEach((index, i) => {
      setTimeout(() => {
        const fav = favorites[index];
        if (fav && fav.imageSrc) {
          const link = document.createElement('a');
          link.href = fav.imageSrc;
          
          // Generate filename based on content type
          const timestamp = new Date(fav.timestamp).getTime();
          let filename = `${fav.topic}_${timestamp}`;
          
          if (fav.type === 'mindmap') {
            filename = `mindmap_${filename}.png`;
          } else if (fav.type === 'board') {
            filename = `board_${fav.boardName || filename}.png`;
          } else if (fav.type === 'task-cards') {
            filename = `taskcard_${filename}.png`;
          } else if (fav.type === 'bingo') {
            filename = `bingo_${filename}.png`;
          } else if (fav.type === 'share-card') {
            filename = `sharecard_${filename}.png`;
          } else if (fav.type === 'community') {
            filename = `community_${fav.topic}_slide${fav.slideIndex}_${timestamp}.png`;
          } else {
            filename = `flashcard_${filename}.png`;
          }
          
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          downloadCount++;
          
          console.log(`已下载: ${filename}`);
        }
        
        // Show completion message and increment counter after last download
        if (i === selectedIndexes.length - 1) {
          setTimeout(() => {
            // Increment download count once for batch operation
            incrementDownloadCount();
            alert(`批量下载完成！共下载 ${downloadCount} 个文件。`);
          }, 500);
        }
      }, i * 300); // 300ms delay between each download
    });
  }

  // Draw Podcast Radar Chart with Cartier Red theme and animation
  function drawPodcastRadarChart() {
    const canvas = document.getElementById('podcast-radar-chart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 60;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Data: 5 dimensions
    const dimensions = ['Promotion', 'Price', 'Product', 'People', 'Place'];
    const data = [75, 60, 50, 85, 70]; // Sample data (0-100 scale)
    const angleStep = (Math.PI * 2) / dimensions.length;
    
    // Draw background circles (grid lines) with black
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)'; // Black for grid
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    // Draw axes with black
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 1;
    dimensions.forEach((dim, i) => {
      const angle = angleStep * i - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Draw labels in black
      const labelX = centerX + (radius + 30) * Math.cos(angle);
      const labelY = centerY + (radius + 30) * Math.sin(angle);
      ctx.fillStyle = '#000000'; // Black
      ctx.font = 'bold 14px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(dim, labelX, labelY);
    });
    
    // Animated drawing of data polygon
    let progress = 0;
    const animationDuration = 1500; // 1.5 seconds
    const startTime = Date.now();
    
    function animate() {
      const elapsed = Date.now() - startTime;
      progress = Math.min(elapsed / animationDuration, 1);
      
      // Clear previous frame
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Redraw grid
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 5; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, (radius / 5) * i, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Redraw axes
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      dimensions.forEach((dim, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.stroke();
        
        const labelX = centerX + (radius + 30) * Math.cos(angle);
        const labelY = centerY + (radius + 30) * Math.sin(angle);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 14px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(dim, labelX, labelY);
      });
      
      // Draw data polygon with Cartier red gradient
      const gradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      gradient.addColorStop(0, '#A42423'); // Cartier red
      gradient.addColorStop(1, '#701A1A'); // Darker Cartier red
      
      ctx.strokeStyle = gradient;
      ctx.fillStyle = 'rgba(164, 36, 35, 0.2)'; // Low opacity Cartier red fill
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      data.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const distance = (value / 100) * radius * progress; // Animate from center
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      // Draw data points
      ctx.fillStyle = '#A42423'; // Cartier red points
      data.forEach((value, i) => {
        const angle = angleStep * i - Math.PI / 2;
        const distance = (value / 100) * radius * progress;
        const x = centerX + distance * Math.cos(angle);
        const y = centerY + distance * Math.sin(angle);
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect to points
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#A42423';
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    }
    
    // Start animation
    animate();
  }

  // Community Carousel
  let currentSlideIndex = 0;
  let carouselInterval = null;
  let barrageIntervals = [];

  // Barrage messages for each community slide
  const barrageMessages = {
    0: ['这一步走得', '踩到蜘蛛网', '别回头，有人追上来了', '糖果格！', '答对了', '氛围太顶了', '又循环', '逻辑链完整', '在呢'],
    1: ['思路，比雪还清楚', '🦌麋鹿都看懂了', '老师满意地点头', '刚刚好', '每个分支都是重点', '关键词记住', '很明确'],
    2: ['Bingo 出现！', '👻 今天运气不错', '差一个就赢了', '连到糖果了！', '🎃 Bingo 预警！', '节奏很好欸'],
    3: ['3:15 封神！反复听', '一个人怎么能闯这么大的祸', '分手之后，姐夫我还能去你家玩电脑吗', '此弟不宜久留', '好会玩', '他也太爱了'],
    4: ['命运开始转动', '✍️ 这句能加分', '道具好精致', '口音好难顶']
  };

  // Barrage helper functions
  function createBarrageItem(text, container, fromLeft) {
    const item = document.createElement('div');
    item.className = `barrage-item ${fromLeft ? 'from-left' : 'from-right'}`;
    item.textContent = text;
    
    // Random vertical position (between 10% and 80% of container height)
    const topPercent = 10 + Math.random() * 70;
    item.style.top = `${topPercent}%`;
    
    container.appendChild(item);
    
    // Remove item after animation completes
    setTimeout(() => {
      if (item.parentNode) {
        item.parentNode.removeChild(item);
      }
    }, 8000);
  }

  function startBarrage(slideIndex) {
    const messages = barrageMessages[slideIndex];
    console.log(`Starting barrage for slide ${slideIndex}`, messages);
    
    if (!messages || messages.length === 0) {
      console.warn(`No messages for slide ${slideIndex}`);
      return;
    }
    
    const container = document.getElementById(`barrage-${slideIndex}`);
    console.log(`Barrage container for slide ${slideIndex}:`, container);
    
    if (!container) {
      console.error(`Barrage container not found: barrage-${slideIndex}`);
      return;
    }
    
    // Clear existing barrages in this container
    container.innerHTML = '';
    
    // Create first barrage immediately
    const fromLeft = Math.random() > 0.5;
    createBarrageItem(messages[0], container, fromLeft);
    console.log('Created first barrage item');
    
    // Create barrages at random intervals
    let messageIndex = 1;
    const interval = setInterval(() => {
      if (messageIndex >= messages.length) {
        messageIndex = 0; // Loop back to start
      }
      
      const fromLeft = Math.random() > 0.5;
      createBarrageItem(messages[messageIndex], container, fromLeft);
      messageIndex++;
    }, 1500 + Math.random() * 1000); // Random interval between 1.5-2.5 seconds
    
    barrageIntervals.push(interval);
  }

  function stopAllBarrages() {
    // Clear all barrage intervals
    barrageIntervals.forEach(interval => clearInterval(interval));
    barrageIntervals = [];
    
    // Clear all barrage containers
    for (let i = 0; i < 5; i++) {
      const container = document.getElementById(`barrage-${i}`);
      if (container) {
        container.innerHTML = '';
      }
    }
  }

  function initCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');

    if (slides.length === 0) return;

    // Auto-rotate carousel every 3 seconds
    function startCarousel() {
      carouselInterval = setInterval(() => {
        nextSlide();
      }, 3000);
    }

    function stopCarousel() {
      if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
      }
    }

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === index);
      });
      currentSlideIndex = index;
      
      // Stop all existing barrages
      stopAllBarrages();
      
      // Start barrage for the new slide
      startBarrage(index);
    }

    function nextSlide() {
      const nextIndex = (currentSlideIndex + 1) % slides.length;
      showSlide(nextIndex);
    }

    function prevSlide() {
      const prevIndex = currentSlideIndex === 0 ? slides.length - 1 : currentSlideIndex - 1;
      showSlide(prevIndex);
    }

    // Click on slide to navigate to notebook
    slides.forEach((slide, index) => {
      slide.addEventListener('click', () => {
        const topic = slide.dataset.topic;
        if (topic) {
          openNotebookForTopic(topic);
        }
      });
    });

    // Click on indicators to jump to specific slide
    indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', (e) => {
        e.stopPropagation();
        stopCarousel();
        showSlide(index);
        setTimeout(startCarousel, 5000); // Restart auto-rotation after 5s
      });
    });

    // Pause on hover
    const carouselContainer = document.querySelector('.community-carousel');
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', stopCarousel);
      carouselContainer.addEventListener('mouseleave', startCarousel);
    }

    // Start auto-rotation
    startCarousel();
    
    // Start barrage for the first slide
    startBarrage(0);
  }

  function loadTopic(topicKey) {
    currentTopic = topicKey;
    const data = topicData[topicKey];
    
    // Update image
    if (blogImage) {
      blogImage.src = data.image;
    }
    
    // Load audio
    if (audioElement) {
      audioElement.src = data.audio;
      audioElement.pause();
      isPlaying = false;
      updatePlayPauseIcon();
    }
    
    // Load text content
    fetch(data.text)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load text file');
        }
        return response.text();
      })
      .then(text => {
        if (blogText) {
          blogText.textContent = text;
        }
      })
      .catch(error => {
        console.error('Error loading text:', error);
        // Fallback: Try to load using XMLHttpRequest for local files
        const xhr = new XMLHttpRequest();
        xhr.open('GET', data.text, true);
        xhr.onload = function() {
          if (xhr.status === 200 || xhr.status === 0) {
            if (blogText) {
              blogText.textContent = xhr.responseText;
            }
          } else {
            if (blogText) {
              blogText.textContent = `点击播放按钮开始收听${data.name}内容...`;
            }
          }
        };
        xhr.onerror = function() {
          if (blogText) {
            blogText.textContent = `点击播放按钮开始收听${data.name}内容...`;
          }
        };
        xhr.send();
      });
    
    // Reset practice
    if (practiceContent) {
      practiceContent.style.display = 'none';
    }
    if (generatePracticeBtn) {
      generatePracticeBtn.style.display = 'block';
    }
  }

  function updatePlayPauseIcon() {
    if (playPauseIcon) {
      playPauseIcon.src = isPlaying ? "public/play.png" : "public/play.png";
      playPauseIcon.alt = isPlaying ? "暂停" : "播放";
    }
  }

  function togglePlayPause() {
    if (!audioElement) return;
    
    if (isPlaying) {
      audioElement.pause();
      isPlaying = false;
    } else {
      audioElement.play();
      isPlaying = true;
    }
    updatePlayPauseIcon();
  }

  function playPrevious() {
    if (audioElement) {
      audioElement.pause();
      isPlaying = false;
      updatePlayPauseIcon();
    }
    
    const currentIndex = topics.indexOf(currentTopic);
    const prevIndex = currentIndex === 0 ? topics.length - 1 : currentIndex - 1;
    loadTopic(topics[prevIndex]);
  }

  function playNext() {
    if (audioElement) {
      audioElement.pause();
      isPlaying = false;
      updatePlayPauseIcon();
    }
    
    const currentIndex = topics.indexOf(currentTopic);
    const nextIndex = (currentIndex + 1) % topics.length;
    loadTopic(topics[nextIndex]);
  }

  function generatePractice() {
    const questions = practiceTemplates[currentTopic] || practiceTemplates.ielts;
    
    if (practiceQuestions) {
      practiceQuestions.innerHTML = '';
      questions.forEach((q, index) => {
        const div = document.createElement('div');
        div.className = 'practice-question-item';
        div.textContent = `${index + 1}. ${q}`;
        practiceQuestions.appendChild(div);
      });
    }
    
    if (generatePracticeBtn) {
      generatePracticeBtn.style.display = 'none';
    }
    if (practiceContent) {
      practiceContent.style.display = 'block';
    }
  }

  function sendChatMessage() {
    if (!chatInput || !chatMessages) return;
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message
    const userMsgDiv = document.createElement('div');
    userMsgDiv.className = 'chat-message user-message';
    userMsgDiv.textContent = message;
    chatMessages.appendChild(userMsgDiv);
    
    // Clear input
    chatInput.value = '';
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Simulate AI response
    setTimeout(() => {
      const aiMsgDiv = document.createElement('div');
      aiMsgDiv.className = 'chat-message ai-message';
      aiMsgDiv.textContent = '我理解了您的问题。这是一个模拟回复，实际应用中会连接真实的AI服务。';
      chatMessages.appendChild(aiMsgDiv);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 500);
  }

  // Flashcard Functions
  async function generateFlashcard(isCustom = false) {
    const blogTextEl = document.getElementById('blog-text');
    if (!blogTextEl || !blogTextEl.textContent || blogTextEl.textContent.includes('点击播放按钮')) {
      alert('请先选择一个博客主题并加载内容！');
      return;
    }

    const blogText = blogTextEl.textContent;
    const cardCount = isCustom ? selectedCardCount : 6;
    const illustrationStyle = isCustom && illustrationStyleInput.value 
      ? illustrationStyleInput.value 
      : 'Zootopia character style';

    // Show loading
    if (flashcardResult) flashcardResult.style.display = 'flex';
    if (flashcardLoading) flashcardLoading.style.display = 'flex';
    if (flashcardImageContainer) flashcardImageContainer.innerHTML = '';

    try {
      // Step 1: Extract vocabulary using Gemini Text API
      console.log('Extracting vocabulary from blog text...');
      const vocabularyData = await window.GeminiAPI.extractVocabularyMindMap(
        blogText,
        cardCount,
        illustrationStyle
      );
      console.log('Vocabulary extracted:', vocabularyData);
      
      // Step 2: Generate flashcard image (currently returns null, shows text fallback)
      const imageData = await window.GeminiAPI.generateFlashcardImage(
        vocabularyData, 
        cardCount, 
        illustrationStyle
      );

      // Hide loading
      if (flashcardLoading) flashcardLoading.style.display = 'none';

      // Display result
      if (imageData && Array.isArray(imageData) && imageData.length > 0 && flashcardImageContainer) {
        // Display generated images in a grid
        const gridDiv = document.createElement('div');
        gridDiv.style.cssText = `
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 12px;
          width: 100%;
        `;
        
        imageData.forEach(item => {
          const cardDiv = document.createElement('div');
          cardDiv.style.cssText = `
            background: rgba(0,0,0,0.2);
            border-radius: 12px;
            padding: 12px;
            text-align: center;
          `;
          
          const img = document.createElement('img');
          img.src = item.imageUrl;
          img.alt = item.word;
          img.style.cssText = `
            width: 100%;
            border-radius: 8px;
            margin-bottom: 8px;
          `;
          
          const wordText = document.createElement('div');
          wordText.textContent = `${item.word}`;
          wordText.style.cssText = `
            color: var(--accent);
            font-weight: 600;
            margin-bottom: 4px;
          `;
          
          const meaningText = document.createElement('div');
          meaningText.textContent = item.meaning;
          meaningText.style.cssText = `
            color: var(--text-muted);
            font-size: 12px;
          `;
          
          cardDiv.appendChild(img);
          cardDiv.appendChild(wordText);
          cardDiv.appendChild(meaningText);
          gridDiv.appendChild(cardDiv);
        });
        
        flashcardImageContainer.appendChild(gridDiv);
        currentFlashcardImage = gridDiv;
      } else {
        // Fallback: show vocabulary text in a styled format
        const textDiv = document.createElement('div');
        textDiv.style.cssText = `
          padding: 20px; 
          background: rgba(0,0,0,0.2); 
          border-radius: 12px; 
          color: var(--text-main); 
          white-space: pre-wrap;
          line-height: 1.8;
          font-size: 14px;
          max-height: 400px;
          overflow-y: auto;
        `;
        textDiv.innerHTML = `<strong style="color: var(--accent); font-size: 16px;">提取的词汇和内容：</strong>\n\n${vocabularyData}`;
        flashcardImageContainer.appendChild(textDiv);
        
        // Store for potential favorite
        currentFlashcardImage = textDiv;
      }

    } catch (error) {
      console.error('Error generating flashcard:', error);
      if (flashcardLoading) flashcardLoading.style.display = 'none';
      
      // Show static fallback image based on current topic
      const fallbackImage = `public/${currentTopic}card.png`;
      console.log(`Using fallback image: ${fallbackImage}`);
      
      if (flashcardImageContainer) {
        const img = document.createElement('img');
        img.src = fallbackImage;
        img.alt = `${currentTopic} Flashcard`;
        img.style.cssText = `
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        flashcardImageContainer.appendChild(img);
        currentFlashcardImage = img;
      }
      
      // Show user-friendly error message
      let errorMessage = '生成闪卡时出错，已加载预设图片。';
      if (error.message.includes('rate limit')) {
        errorMessage = 'API调用次数已达上限，已加载预设图片。';
      } else if (error.message.includes('not found')) {
        errorMessage = 'API配置错误，已加载预设图片。';
      }
      
      console.warn(errorMessage + ' 详细信息: ' + error.message);
    }
  }

  function toggleCustomizePanel() {
    if (!flashcardCustomize) return;
    const isHidden = flashcardCustomize.style.display === 'none';
    flashcardCustomize.style.display = isHidden ? 'flex' : 'none';
  }

  function printCurrentFlashcard() {
    if (currentFlashcardImage) {
      window.GeminiAPI.printFlashcard(currentFlashcardImage);
    } else {
      alert('没有可打印的闪卡！');
    }
  }

  function favoriteCurrentFlashcard() {
    if (!currentFlashcardImage) {
      alert('没有可收藏的闪卡！');
      return;
    }

    const flashcardData = {
      topic: currentTopic,
      imageSrc: currentFlashcardImage.src,
      cardCount: selectedCardCount,
      style: illustrationStyleInput.value || 'Zootopia character style'
    };

    window.GeminiAPI.saveFlashcardToFavorites(flashcardData);
    alert('闪卡已收藏到个人中心！');
    
    // Update favorite button
    if (favoriteFlashcardBtn) {
      favoriteFlashcardBtn.textContent = '已收藏';
      favoriteFlashcardBtn.disabled = true;
    }
  }

  // ========== Mind Map Functions ==========
  let currentMindMapImage = null;

  async function generateMindMap() {
    if (!blogText) {
      alert('请先选择一个主题！');
      return;
    }

    const mindmapResult = document.getElementById('mindmap-result');
    const mindmapLoading = document.getElementById('mindmap-loading');
    const mindmapImageContainer = document.getElementById('mindmap-image-container');

    // Show loading
    if (mindmapResult) mindmapResult.style.display = 'block';
    if (mindmapLoading) mindmapLoading.style.display = 'flex';
    if (mindmapImageContainer) mindmapImageContainer.innerHTML = '';

    try {
      // Step 1: Generate mind map text structure with Gemini 3 Pro
      console.log('Step 1: Generating mind map structure...');
      const mindMapText = await window.GeminiAPI.generateMindMapText(blogText);
      console.log('Mind map structure:', mindMapText);

      // Step 2: Generate mind map image with Gemini 2.5 Flash Image
      console.log('Step 2: Generating mind map image...');
      const imageData = await window.GeminiAPI.generateMindMapImage(mindMapText);

      // Hide loading
      if (mindmapLoading) mindmapLoading.style.display = 'none';

      // Display result
      if (imageData && mindmapImageContainer) {
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = 'Mind Map';
        img.style.cssText = `
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        mindmapImageContainer.appendChild(img);
        currentMindMapImage = img;
        console.log('Mind map generated successfully!');
      } else {
        // Fallback: show text structure
        const textDiv = document.createElement('div');
        textDiv.style.cssText = `
          padding: 20px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          color: var(--text-main);
          white-space: pre-wrap;
          line-height: 1.8;
          font-size: 14px;
          max-height: 400px;
          overflow-y: auto;
        `;
        textDiv.innerHTML = `<strong style="color: var(--accent); font-size: 16px;">思维导图结构：</strong>\n\n${mindMapText}`;
        mindmapImageContainer.appendChild(textDiv);
        currentMindMapImage = textDiv;
        console.log('Displaying text-based mind map (image generation unavailable)');
      }

    } catch (error) {
      console.error('Error generating mind map:', error);
      if (mindmapLoading) mindmapLoading.style.display = 'none';
      
      // Show static fallback image based on current topic
      const fallbackImage = `public/${currentTopic}mind.png`;
      console.log(`Using fallback mind map image: ${fallbackImage}`);
      
      if (mindmapImageContainer) {
        const img = document.createElement('img');
        img.src = fallbackImage;
        img.alt = `${currentTopic} Mind Map`;
        img.style.cssText = `
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        mindmapImageContainer.appendChild(img);
        currentMindMapImage = img;
      }
      
      console.warn('生成思维导图时出错，已加载预设图片。详细信息: ' + error.message);
    }
  }

  function printCurrentMindMap() {
    if (currentMindMapImage) {
      window.GeminiAPI.printFlashcard(currentMindMapImage);
    } else {
      alert('没有可打印的思维导图！');
    }
  }

  function favoriteCurrentMindMap() {
    if (!currentMindMapImage) {
      alert('没有可收藏的思维导图！');
      return;
    }

    const mindmapData = {
      topic: currentTopic,
      imageSrc: currentMindMapImage.src || '',
      type: 'mindmap'
    };

    window.GeminiAPI.saveFlashcardToFavorites(mindmapData);
    alert('思维导图已收藏到个人中心！');
  }

  // ========== Bingo Functions ==========
  let currentBingoImage = null;
  let selectedBingoCount = 9;

  async function generateBingo() {
    if (!blogText) {
      alert('请先选择一个主题！');
      return;
    }

    const bingoResult = document.getElementById('bingo-result');
    const bingoLoading = document.getElementById('bingo-loading');
    const bingoImageContainer = document.getElementById('bingo-image-container');

    // Show loading
    if (bingoResult) bingoResult.style.display = 'block';
    if (bingoLoading) bingoLoading.style.display = 'flex';
    if (bingoImageContainer) bingoImageContainer.innerHTML = '';

    try {
      // Step 1: Generate keywords with Gemini 3 Pro
      console.log(`Step 1: Generating ${selectedBingoCount} Bingo keywords...`);
      const keywords = await window.GeminiAPI.generateBingoKeywords(blogText, selectedBingoCount);
      console.log('Bingo keywords:', keywords);

      // Step 2: Generate Bingo card images with Gemini 2.5 Flash Image
      console.log('Step 2: Generating Bingo card images...');
      const imageData = await window.GeminiAPI.generateBingoImages(keywords);

      // Hide loading
      if (bingoLoading) bingoLoading.style.display = 'none';

      // Display result (or fallback to static image)
      if (imageData && bingoImageContainer) {
        // If API returns images, display them
        const img = document.createElement('img');
        img.src = imageData;
        img.alt = 'Bingo Cards';
        img.style.cssText = `
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        bingoImageContainer.appendChild(img);
        currentBingoImage = img;
        console.log('Bingo cards generated successfully!');
      } else {
        // Fallback: show keywords text
        const textDiv = document.createElement('div');
        textDiv.style.cssText = `
          padding: 20px;
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          color: var(--text-main);
          white-space: pre-wrap;
          line-height: 1.8;
          font-size: 14px;
          max-height: 400px;
          overflow-y: auto;
        `;
        textDiv.innerHTML = `<strong style="color: var(--accent); font-size: 16px;">Bingo关键词：</strong>\n\n${keywords}`;
        bingoImageContainer.appendChild(textDiv);
        currentBingoImage = textDiv;
        console.log('Displaying text-based Bingo keywords (image generation unavailable)');
      }

    } catch (error) {
      console.error('Error generating Bingo:', error);
      if (bingoLoading) bingoLoading.style.display = 'none';
      
      // Show static fallback image based on current topic
      const fallbackImage = `public/${currentTopic}bingo.png`;
      console.log(`Using fallback Bingo image: ${fallbackImage}`);
      
      if (bingoImageContainer) {
        const img = document.createElement('img');
        img.src = fallbackImage;
        img.alt = `${currentTopic} Bingo`;
        img.style.cssText = `
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;
        bingoImageContainer.appendChild(img);
        currentBingoImage = img;
      }
      
      console.warn('生成Bingo时出错，已加载预设图片。详细信息: ' + error.message);
    }
  }

  function printCurrentBingo() {
    if (currentBingoImage) {
      window.GeminiAPI.printFlashcard(currentBingoImage);
    } else {
      alert('没有可打印的Bingo！');
    }
  }

  function favoriteCurrentBingo() {
    if (!currentBingoImage) {
      alert('没有可收藏的Bingo！');
      return;
    }

    const bingoData = {
      topic: currentTopic,
      imageSrc: currentBingoImage.src || '',
      type: 'bingo'
    };

    window.GeminiAPI.saveFlashcardToFavorites(bingoData);
    alert('Bingo已收藏到个人中心！');
  }

  // ========== Monopoly Functions ==========
  let currentTaskCards = [];

  function showBoardSelection() {
    const boardSelection = document.getElementById('board-selection');
    if (boardSelection) {
      boardSelection.style.display = 'block';
    }
  }

  function closeBoardSelection() {
    const boardSelection = document.getElementById('board-selection');
    if (boardSelection) {
      boardSelection.style.display = 'none';
    }
  }

  // Global functions for board actions (called from HTML onclick)
  window.printBoard = function(boardName) {
    const imagePath = `public/${boardName}.png`;
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>打印棋盘</title>');
    printWindow.document.write('<style>body { margin: 0; } img { width: 100%; }</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(`<img src="${imagePath}" alt="棋盘" />`);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  window.favoriteBoard = function(boardName) {
    const boardData = {
      topic: currentTopic,
      imageSrc: `public/${boardName}.png`,
      type: 'board',
      boardName: boardName
    };
    window.GeminiAPI.saveFlashcardToFavorites(boardData);
    alert('棋盘已收藏到个人中心！');
  };

  async function generateTaskCardsFunc() {
    if (!blogText) {
      alert('请先选择一个主题！');
      return;
    }

    const taskCardsResult = document.getElementById('task-cards-result');
    const taskCardsLoading = document.getElementById('task-cards-loading');
    const taskCardsContainer = document.getElementById('task-cards-container');

    // Show loading
    if (taskCardsResult) taskCardsResult.style.display = 'block';
    if (taskCardsLoading) taskCardsLoading.style.display = 'flex';
    if (taskCardsContainer) taskCardsContainer.innerHTML = '';

    try {
      // Generate Q&A pairs with Gemini 3 Pro
      console.log('Generating task cards...');
      const taskCardsText = await window.GeminiAPI.generateTaskCards(blogText);
      console.log('Task cards text:', taskCardsText);

      // Parse Q&A pairs
      const qaPairs = parseTaskCards(taskCardsText);
      console.log(`Parsed ${qaPairs.length} Q&A pairs`);

      if (qaPairs.length === 0) {
        throw new Error('No Q&A pairs found in response');
      }

      // Hide loading
      if (taskCardsLoading) taskCardsLoading.style.display = 'none';

      // Render task cards (3 sheets, 4 Q&A pairs each)
      renderTaskCardSheets(qaPairs, taskCardsContainer);
      currentTaskCards = qaPairs;

      console.log('Task cards generated successfully!');

    } catch (error) {
      console.error('Error generating task cards:', error);
      if (taskCardsLoading) taskCardsLoading.style.display = 'none';
      
      // Show static fallback images for Christmas topic
      if (currentTopic === 'christmas') {
        console.log('Using fallback task card images: christmasgamecard1 and christmasgamecard2');
        
        if (taskCardsContainer) {
          taskCardsContainer.innerHTML = '';
          
          // Create two fallback card images
          ['christmasgamecard1', 'christmasgamecard2'].forEach((cardName) => {
            const cardDiv = document.createElement('div');
            cardDiv.style.cssText = `
              margin-bottom: 20px;
            `;
            
            const img = document.createElement('img');
            img.src = `public/${cardName}.png`;
            img.alt = `Christmas Game Card`;
            img.style.cssText = `
              width: 100%;
              border-radius: 12px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            `;
            
            cardDiv.appendChild(img);
            taskCardsContainer.appendChild(cardDiv);
          });
          
          // Store fallback data for print/favorite
          currentTaskCards = [
            { fallback: true, imageSrc: 'public/christmasgamecard1.png' },
            { fallback: true, imageSrc: 'public/christmasgamecard2.png' }
          ];
        }
        
        console.warn('生成任务卡时出错，已加载预设图片。详细信息: ' + error.message);
      } else {
        alert('生成任务卡时出错：' + error.message);
      }
    }
  }

  function parseTaskCards(text) {
    const pairs = [];
    const lines = text.split('\n');
    let currentPair = {};

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match Q: Question (English)
      if (trimmed.match(/^Q[：:]/)) {
        if (Object.keys(currentPair).length > 0) {
          pairs.push(currentPair);
          currentPair = {};
        }
        currentPair.questionEn = trimmed.replace(/^Q[：:]\s*/, '');
      }
      // Match 问题: Question (Chinese)
      else if (trimmed.match(/^问题[：:]/)) {
        currentPair.questionCn = trimmed.replace(/^问题[：:]\s*/, '');
      }
      // Match A: Answer (English)
      else if (trimmed.match(/^A[：:]/)) {
        currentPair.answerEn = trimmed.replace(/^A[：:]\s*/, '');
      }
      // Match 答案: Answer (Chinese)
      else if (trimmed.match(/^答案[：:]/)) {
        currentPair.answerCn = trimmed.replace(/^答案[：:]\s*/, '');
      }
    }

    // Add last pair
    if (Object.keys(currentPair).length > 0) {
      pairs.push(currentPair);
    }

    return pairs.filter(p => p.questionEn && p.answerEn);
  }

  function renderTaskCardSheets(qaPairs, container) {
    // Create 3 sheets, 4 Q&A pairs each
    const sheetsCount = 3;
    const pairsPerSheet = 4;

    for (let sheetIdx = 0; sheetIdx < sheetsCount; sheetIdx++) {
      const startIdx = sheetIdx * pairsPerSheet;
      const endIdx = Math.min(startIdx + pairsPerSheet, qaPairs.length);
      const sheetPairs = qaPairs.slice(startIdx, endIdx);

      if (sheetPairs.length === 0) break;

      const sheet = document.createElement('div');
      sheet.className = 'task-card-sheet';

      const grid = document.createElement('div');
      grid.className = 'task-card-grid';

      sheetPairs.forEach(pair => {
        const pairDiv = document.createElement('div');
        pairDiv.className = 'task-card-pair';

        // Question card (Orange)
        const qCard = document.createElement('div');
        qCard.className = 'task-card question';
        qCard.innerHTML = `
          <div class="task-card-label">Q / 问题</div>
          <div class="task-card-text">${pair.questionEn}</div>
          <div class="task-card-text" style="margin-top: 8px; font-size: 12px;">${pair.questionCn || ''}</div>
        `;

        // Answer card (Green)
        const aCard = document.createElement('div');
        aCard.className = 'task-card answer';
        aCard.innerHTML = `
          <div class="task-card-label">A / 答案</div>
          <div class="task-card-text">${pair.answerEn}</div>
          <div class="task-card-text" style="margin-top: 8px; font-size: 12px;">${pair.answerCn || ''}</div>
        `;

        pairDiv.appendChild(qCard);
        pairDiv.appendChild(aCard);
        grid.appendChild(pairDiv);
      });

      sheet.appendChild(grid);
      container.appendChild(sheet);
    }
  }

  function printTaskCards() {
    const container = document.getElementById('task-cards-container');
    if (!container || container.children.length === 0) {
      alert('没有可打印的任务卡！');
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><title>打印任务卡</title>');
    printWindow.document.write('<style>body { margin: 20px; font-family: Arial, sans-serif; }</style>');
    printWindow.document.write('<style>' + document.querySelector('style') ? document.querySelector('style').innerHTML : '' + '</style>');
    printWindow.document.write('</head><body>');
    printWindow.document.write(container.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }

  function favoriteTaskCards() {
    if (currentTaskCards.length === 0) {
      alert('没有可收藏的任务卡！');
      return;
    }

    const taskCardsData = {
      topic: currentTopic,
      type: 'task-cards',
      data: currentTaskCards
    };

    window.GeminiAPI.saveFlashcardToFavorites(taskCardsData);
    alert('任务卡已收藏到个人中心！');
  }

  function openNotebookForTopic(topicKey) {
    setActiveView("notebook");
    loadTopic(topicKey);
    
    // Generate AI summary when opening a topic
    generateAISummary();
  }

  // ========== Comment Section Functions ==========
  let currentAISummary = '';
  let currentShareCardImage = null;

  // ========== Download Quota & Membership ==========
  const DAILY_FREE_DOWNLOADS = 2;
  let dailyDownloadCount = 0;
  let lastDownloadDate = null;

  function initializeDownloadQuota() {
    // Load from localStorage
    const savedData = localStorage.getItem('downloadQuota');
    if (savedData) {
      const data = JSON.parse(savedData);
      const today = new Date().toDateString();
      
      if (data.date === today) {
        dailyDownloadCount = data.count || 0;
      } else {
        // Reset count for new day
        dailyDownloadCount = 0;
        saveDownloadQuota();
      }
    }
    
    updateDownloadQuotaDisplay();
  }

  function saveDownloadQuota() {
    const today = new Date().toDateString();
    const data = {
      date: today,
      count: dailyDownloadCount
    };
    localStorage.setItem('downloadQuota', JSON.stringify(data));
  }

  function updateDownloadQuotaDisplay() {
    const downloadUsed = document.getElementById('download-used');
    const downloadLimit = document.getElementById('download-limit');
    
    if (downloadUsed) {
      downloadUsed.textContent = dailyDownloadCount;
    }
    
    if (downloadLimit) {
      downloadLimit.textContent = DAILY_FREE_DOWNLOADS;
    }
  }

  function checkDownloadLimit() {
    if (dailyDownloadCount >= DAILY_FREE_DOWNLOADS) {
      // Show pricing modal
      showPricingModal();
      return false;
    }
    return true;
  }

  function incrementDownloadCount() {
    dailyDownloadCount++;
    saveDownloadQuota();
    updateDownloadQuotaDisplay();
  }

  function showPricingModal() {
    const modal = document.getElementById('pricing-modal');
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }

  function closePricingModal() {
    const modal = document.getElementById('pricing-modal');
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }

  function selectPlan(planType) {
    console.log(`Selected plan: ${planType}`);
    alert(`感谢您选择${planType === 'monthly' ? '月卡' : '年卡'}！\n\n支付功能正在开发中，敬请期待。`);
    closePricingModal();
  }

  async function generateAISummary() {
    const blogTextEl = document.getElementById('blog-text');
    const summaryText = document.getElementById('summary-text');
    const summaryLoading = document.getElementById('summary-loading');
    const aiSummary = document.getElementById('ai-summary');
    
    if (!blogTextEl || !blogTextEl.textContent || blogTextEl.textContent.includes('点击播放按钮')) {
      if (summaryText) {
        summaryText.textContent = '点击播放按钮开始收听博客内容...';
      }
      return;
    }
    
    const blogContent = blogTextEl.textContent;
    
    try {
      // Show loading
      if (summaryLoading) summaryLoading.style.display = 'flex';
      if (aiSummary) aiSummary.style.display = 'none';
      
      console.log('Generating AI summary with Tongyi Qianwen...');
      const summary = await window.TongyiAPI.generateBlogSummary(blogContent);
      
      // Hide loading
      if (summaryLoading) summaryLoading.style.display = 'none';
      if (aiSummary) aiSummary.style.display = 'block';
      
      // Display summary
      if (summaryText) {
        summaryText.textContent = summary;
        currentAISummary = summary;
      }
      
      console.log('AI summary generated successfully!');
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Hide loading
      if (summaryLoading) summaryLoading.style.display = 'none';
      if (aiSummary) aiSummary.style.display = 'block';
      
      // Show fallback message
      if (summaryText) {
        summaryText.textContent = '暂时无法生成总结，请稍后再试...';
      }
      
      console.warn('生成AI总结时出错：' + error.message);
    }
  }

  async function generateShareCard() {
    const commentInput = document.getElementById('comment-input');
    const shareCardPreview = document.getElementById('share-card-preview');
    const canvas = document.getElementById('share-card-canvas');
    
    if (!commentInput || !canvas) return;
    
    const userComment = commentInput.value.trim();
    if (!userComment) {
      alert('请先输入评论内容！');
      return;
    }
    
    if (!currentAISummary) {
      alert('请等待AI总结生成完成！');
      return;
    }
    
    try {
      console.log('Generating share card...');
      
      const ctx = canvas.getContext('2d');
      const bgImage = new Image();
      
      bgImage.onload = function() {
        // Draw background image
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);
        
        // Add semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set text styles
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        
        // Draw AI Summary (top section)
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('AI总结', canvas.width / 2, 100);
        
        ctx.font = '20px Arial, sans-serif';
        const summaryWords = wrapText(ctx, currentAISummary, canvas.width - 120);
        let yPos = 150;
        summaryWords.forEach(line => {
          ctx.fillText(line, canvas.width / 2, yPos);
          yPos += 35;
        });
        
        // Draw divider line
        yPos += 30;
        ctx.strokeStyle = 'rgba(239, 137, 132, 0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(150, yPos);
        ctx.lineTo(canvas.width - 150, yPos);
        ctx.stroke();
        
        // Draw User Comment (bottom section)
        yPos += 60;
        ctx.font = 'bold 24px Arial, sans-serif';
        ctx.fillText('我的评论', canvas.width / 2, yPos);
        
        yPos += 50;
        ctx.font = '20px Arial, sans-serif';
        const commentWords = wrapText(ctx, userComment, canvas.width - 120);
        commentWords.forEach(line => {
          ctx.fillText(line, canvas.width / 2, yPos);
          yPos += 35;
        });
        
        // Show preview
        if (shareCardPreview) {
          shareCardPreview.style.display = 'flex';
        }
        
        console.log('Share card generated successfully!');
      };
      
      bgImage.onerror = function() {
        console.error('Failed to load background image');
        alert('加载背景图片失败，请确保 sharing.png 文件存在于 public 文件夹中。');
      };
      
      bgImage.src = 'public/sharing.png';
      
    } catch (error) {
      console.error('Error generating share card:', error);
      alert('生成分享卡片时出错：' + error.message);
    }
  }

  function wrapText(ctx, text, maxWidth) {
    const words = text.split('');
    const lines = [];
    let currentLine = '';
    
    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine + words[i];
      const metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
    
    return lines;
  }

  function downloadShareCard() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    
    try {
      const dataURL = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `share_card_${currentTopic}_${Date.now()}.png`;
      link.href = dataURL;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Share card downloaded successfully!');
    } catch (error) {
      console.error('Error downloading share card:', error);
      alert('下载分享卡片时出错：' + error.message);
    }
  }

  function favoriteShareCard() {
    const canvas = document.getElementById('share-card-canvas');
    if (!canvas) return;
    
    try {
      const dataURL = canvas.toDataURL('image/png');
      
      const shareCardData = {
        topic: currentTopic,
        imageSrc: dataURL,
        type: 'share-card',
        summary: currentAISummary,
        comment: document.getElementById('comment-input').value.trim()
      };
      
      window.GeminiAPI.saveFlashcardToFavorites(shareCardData);
      alert('分享卡片已收藏到个人中心！');
      
      console.log('Share card favorited successfully!');
    } catch (error) {
      console.error('Error favoriting share card:', error);
      alert('收藏分享卡片时出错：' + error.message);
    }
  }

  function bindEvents() {
    // Navigation buttons
    const navBtns = document.querySelectorAll('.nav-icon-btn');
    navBtns.forEach(btn => {
      const view = btn.getAttribute('data-view');
      btn.addEventListener('click', () => setActiveView(view));
    });

    // Home header profile button
    const homeProfileBtn = document.querySelector('.home-header .header-right[data-view="profile"]');
    if (homeProfileBtn) {
      homeProfileBtn.addEventListener("click", () => setActiveView("profile"));
    }

    // Profile back to home button
    const backToHomeBtn = document.querySelector('.back-to-home-btn[data-view="home"]');
    if (backToHomeBtn) {
      backToHomeBtn.addEventListener("click", () => setActiveView("home"));
    }

    const profileBtn = document.querySelector('.header-right[data-view="profile"]');
    if (profileBtn) {
      profileBtn.addEventListener("click", () => setActiveView("profile"));
    }

    // Media cards - open notebook
    const playButtons = document.querySelectorAll(".play-button");
    playButtons.forEach((btn) => {
      btn.addEventListener("click", function (event) {
        event.stopPropagation();
        const topic = btn.getAttribute("data-topic");
        openNotebookForTopic(topic);
      });
    });

    const mediaCards = document.querySelectorAll(".media-card");
    mediaCards.forEach((card) => {
      card.addEventListener("click", function () {
        const topic = card.getAttribute("data-topic");
        openNotebookForTopic(topic);
      });
    });

    // Audio controls
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', togglePlayPause);
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', playPrevious);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', playNext);
    }

    // Audio element events
    if (audioElement) {
      audioElement.addEventListener('play', () => {
        isPlaying = true;
        updatePlayPauseIcon();
      });
      
      audioElement.addEventListener('pause', () => {
        isPlaying = false;
        updatePlayPauseIcon();
      });
      
      audioElement.addEventListener('ended', () => {
        isPlaying = false;
        updatePlayPauseIcon();
      });
    }

    // Practice button
    if (generatePracticeBtn) {
      generatePracticeBtn.addEventListener('click', generatePractice);
    }

    // Chat functionality
    if (chatSendBtn) {
      chatSendBtn.addEventListener('click', sendChatMessage);
    }

    if (chatInput) {
      chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          sendChatMessage();
        }
      });
    }

    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        
        // Remove active from all tabs and content
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // Add active to clicked tab and its content
        btn.classList.add('active');
        const content = document.getElementById(`tab-${tabName}`);
        if (content) content.classList.add('active');
      });
    });

    // Flashcard: Generate standard
    if (generateFlashcardBtn) {
      generateFlashcardBtn.addEventListener('click', () => generateFlashcard(false));
    }

    // Flashcard: Toggle customize
    if (customizeFlashcardBtn) {
      customizeFlashcardBtn.addEventListener('click', toggleCustomizePanel);
    }

    // Flashcard: Card count selection
    const cardCountBtns = document.querySelectorAll('.option-btn[data-count]');
    cardCountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        cardCountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedCardCount = parseInt(btn.getAttribute('data-count'));
      });
    });

    // Flashcard: Generate custom
    if (generateCustomFlashcardBtn) {
      generateCustomFlashcardBtn.addEventListener('click', () => generateFlashcard(true));
    }

    // Flashcard: Print
    if (printFlashcardBtn) {
      printFlashcardBtn.addEventListener('click', printCurrentFlashcard);
    }

    // Flashcard: Favorite
    if (favoriteFlashcardBtn) {
      favoriteFlashcardBtn.addEventListener('click', favoriteCurrentFlashcard);
    }

    // Mind Map: Generate
    const generateMindmapBtn = document.getElementById('generate-mindmap');
    if (generateMindmapBtn) {
      generateMindmapBtn.addEventListener('click', generateMindMap);
    }

    // Mind Map: Print
    const printMindmapBtn = document.getElementById('print-mindmap');
    if (printMindmapBtn) {
      printMindmapBtn.addEventListener('click', printCurrentMindMap);
    }

    // Mind Map: Favorite
    const favoriteMindmapBtn = document.getElementById('favorite-mindmap');
    if (favoriteMindmapBtn) {
      favoriteMindmapBtn.addEventListener('click', favoriteCurrentMindMap);
    }

    // Bingo: Generate Bingo
    const generateBingoBtn = document.getElementById('generate-bingo');
    if (generateBingoBtn) {
      generateBingoBtn.addEventListener('click', generateBingo);
    }

    // Bingo: Count selection
    const bingoCountBtns = document.querySelectorAll('[data-bingo-count]');
    bingoCountBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        selectedBingoCount = parseInt(btn.dataset.bingoCount);
        bingoCountBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // Bingo: Print
    const printBingoBtn = document.getElementById('print-bingo');
    if (printBingoBtn) {
      printBingoBtn.addEventListener('click', printCurrentBingo);
    }

    // Bingo: Favorite
    const favoriteBingoBtn = document.getElementById('favorite-bingo');
    if (favoriteBingoBtn) {
      favoriteBingoBtn.addEventListener('click', favoriteCurrentBingo);
    }

    // Monopoly: Download Board
    const downloadBoardBtn = document.getElementById('download-board');
    if (downloadBoardBtn) {
      downloadBoardBtn.addEventListener('click', showBoardSelection);
    }

    // Monopoly: Close Board Selection
    const closeBoardSelectionBtn = document.getElementById('close-board-selection');
    if (closeBoardSelectionBtn) {
      closeBoardSelectionBtn.addEventListener('click', closeBoardSelection);
    }

    // Monopoly: Generate Task Cards
    const generateTaskCardsBtn = document.getElementById('generate-task-cards');
    if (generateTaskCardsBtn) {
      generateTaskCardsBtn.addEventListener('click', generateTaskCardsFunc);
    }

    // Monopoly: Print Task Cards
    const printTaskCardsBtn = document.getElementById('print-task-cards');
    if (printTaskCardsBtn) {
      printTaskCardsBtn.addEventListener('click', printTaskCards);
    }

    // Monopoly: Favorite Task Cards
    const favoriteTaskCardsBtn = document.getElementById('favorite-task-cards');
    if (favoriteTaskCardsBtn) {
      favoriteTaskCardsBtn.addEventListener('click', favoriteTaskCards);
    }

    // Community carousel favorite buttons
    const communityFavoriteBtns = document.querySelectorAll('.community-actions [data-action="favorite"]');
    communityFavoriteBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent carousel click
        
        const slide = btn.closest('.carousel-slide');
        if (!slide) return;
        
        const topic = slide.getAttribute('data-topic');
        const slideIndex = slide.getAttribute('data-slide-index');
        const communityImage = slide.querySelector('.community-image');
        
        if (!communityImage) return;
        
        // Toggle favorite state
        const isActive = btn.classList.toggle('is-active');
        btn.textContent = isActive ? '已收藏' : '收藏';
        
        if (isActive) {
          // Save to favorites
          const communityData = {
            topic: topic,
            imageSrc: communityImage.src,
            type: 'community',
            slideIndex: slideIndex,
            timestamp: new Date().toISOString()
          };
          
          window.GeminiAPI.saveFlashcardToFavorites(communityData);
          console.log(`Community slide ${slideIndex} (${topic}) favorited!`);
        } else {
          console.log(`Community slide ${slideIndex} (${topic}) unfavorited`);
        }
      });
    });

    const commentBtns = document.querySelectorAll('.community-actions [data-action="comment"]');
    commentBtns.forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent carousel click
        alert('评论功能即将上线 😊');
      });
    });

    // Profile: Nickname editing
    const editNicknameBtn = document.getElementById('edit-nickname-btn');
    const nicknameInput = document.getElementById('nickname-input');
    
    if (editNicknameBtn) {
      editNicknameBtn.addEventListener('click', editNickname);
    }
    
    if (nicknameInput) {
      nicknameInput.addEventListener('blur', saveNickname);
      nicknameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          saveNickname();
        }
      });
    }

    // Load saved nickname on page load
    const savedNickname = localStorage.getItem('userNickname');
    const profileNameDisplay = document.getElementById('profile-name-display');
    if (savedNickname && profileNameDisplay) {
      profileNameDisplay.textContent = savedNickname;
    }

    // Favorites: Batch selection and download
    const selectAllBtn = document.getElementById('select-all-btn');
    const batchDownloadBtn = document.getElementById('batch-download-btn');
    
    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', toggleSelectAll);
    }
    
    if (batchDownloadBtn) {
      batchDownloadBtn.addEventListener('click', batchDownloadFavorites);
    }

    // Draw radar chart when profile view is active
    setTimeout(() => {
      if (views.profile && views.profile.classList.contains('view-active')) {
        drawPodcastRadarChart();
      }
    }, 100);

    // Initialize carousel
    initCarousel();
    
    // Comment Section: Generate Share Card
    const generateShareBtn = document.getElementById('generate-share-btn');
    if (generateShareBtn) {
      generateShareBtn.addEventListener('click', generateShareCard);
    }
    
    const downloadShareBtn = document.getElementById('download-share-card');
    if (downloadShareBtn) {
      downloadShareBtn.addEventListener('click', downloadShareCard);
    }
    
    const favoriteShareBtn = document.getElementById('favorite-share-card');
    if (favoriteShareBtn) {
      favoriteShareBtn.addEventListener('click', favoriteShareCard);
    }
    
    // Pricing Modal
    const upgradeMembershipBtn = document.getElementById('upgrade-membership-btn');
    if (upgradeMembershipBtn) {
      upgradeMembershipBtn.addEventListener('click', showPricingModal);
    }
    
    const closePricingBtn = document.getElementById('close-pricing-btn');
    if (closePricingBtn) {
      closePricingBtn.addEventListener('click', closePricingModal);
    }
    
    const pricingOverlay = document.getElementById('pricing-overlay');
    if (pricingOverlay) {
      pricingOverlay.addEventListener('click', closePricingModal);
    }
    
    // Plan selection buttons
    const planButtons = document.querySelectorAll('.plan-btn[data-plan]');
    planButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const plan = btn.getAttribute('data-plan');
        selectPlan(plan);
      });
    });
    
    // Initialize download quota
    initializeDownloadQuota();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }

  // Test Gemini API connectivity on page load
  setTimeout(() => {
    if (window.GeminiAPI && window.GeminiAPI.testGeminiConnection) {
      console.log('=== Gemini API Connection Test ===');
      window.GeminiAPI.testGeminiConnection().then(result => {
        if (result) {
          console.log('✅ Gemini API 连接测试成功');
        } else {
          console.warn('⚠️ Gemini API 连接测试失败，请检查控制台错误信息');
        }
      });
    }
  }, 1000);
})();
