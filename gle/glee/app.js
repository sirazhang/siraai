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

  let currentTopic = "ielts";
  let isPlaying = false;

  const topics = ["ielts", "christmas", "halloween"];
  
  const topicData = {
    ielts: {
      image: "public/ieltscover.png",
      audio: "public/ielts.mp3",
      text: "public/ielts.txt",
      name: "IELTS"
    },
    christmas: {
      image: "public/christmascover.png",
      audio: "public/christmas.mp3",
      text: "public/christmas.txt",
      name: "Christmas"
    },
    halloween: {
      image: "public/halloweencover.png",
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
    }
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
      .then(response => response.text())
      .then(text => {
        if (blogText) {
          blogText.textContent = text;
        }
      })
      .catch(error => {
        console.error('Error loading text:', error);
        if (blogText) {
          blogText.textContent = `点击播放按钮开始收听${data.name}内容...`;
        }
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
