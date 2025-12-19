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

  const topics = ["ielts", "christmas", "halloween"];
  
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
      
      // Load favorites when viewing profile
      if (key === 'profile') {
        loadFavorites();
      }
    }
  }

  function loadFavorites() {
    const favoritesGrid = document.getElementById('favorites-grid');
    if (!favoritesGrid) return;
    
    const favorites = window.GeminiAPI.getFavoriteFlashcards();
    
    if (favorites.length === 0) {
      favoritesGrid.innerHTML = '<p class="placeholder-text">还没有收藏内容</p>';
      return;
    }
    
    favoritesGrid.innerHTML = '';
    favorites.forEach(fav => {
      const item = document.createElement('div');
      item.className = 'favorite-item';
      item.innerHTML = `
        <img src="${fav.imageSrc}" alt="Flashcard" />
        <div class="favorite-meta">
          <div>${fav.topic}</div>
          <div>${new Date(fav.timestamp).toLocaleDateString('zh-CN')}</div>
        </div>
      `;
      item.addEventListener('click', () => {
        // View the flashcard
        alert('查看收藏的闪卡');
      });
      favoritesGrid.appendChild(item);
    });
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
      const vocabularyData = await window.GeminiAPI.extractVocabularyMindMap(blogText);
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
      
      // Show user-friendly error message
      let errorMessage = '生成闪卡时出错。';
      if (error.message.includes('rate limit')) {
        errorMessage = 'API调用次数已达上限，请稍后再试。';
      } else if (error.message.includes('not found')) {
        errorMessage = 'API配置错误，请检查设置。';
      }
      
      alert(errorMessage + '\n\n详细信息: ' + error.message);
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

  function openNotebookForTopic(topicKey) {
    setActiveView("notebook");
    loadTopic(topicKey);
  }

  function bindEvents() {
    // Navigation buttons
    const navBtns = document.querySelectorAll('.nav-icon-btn');
    navBtns.forEach(btn => {
      const view = btn.getAttribute('data-view');
      btn.addEventListener('click', () => setActiveView(view));
    });

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

    // Community buttons
    const favoriteBtn = document.querySelector('[data-action="favorite"]');
    if (favoriteBtn) {
      favoriteBtn.addEventListener("click", function () {
        favoriteBtn.classList.toggle("is-active");
        favoriteBtn.textContent = favoriteBtn.classList.contains("is-active")
          ? "已收藏"
          : "收藏";
      });
    }

    const commentBtn = document.querySelector('[data-action="comment"]');
    if (commentBtn) {
      commentBtn.addEventListener("click", function () {
        alert("评论功能即将上线 😊");
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
