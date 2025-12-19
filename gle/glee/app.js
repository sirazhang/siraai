(function () {
  const views = {
    home: document.getElementById("view-home"),
    profile: document.getElementById("view-profile"),
    notebook: document.getElementById("view-notebook"),
  };

  const notebookTopicEl = document.getElementById("notebook-topic");
  const audioElement = document.getElementById("audio-element");
  const audioTitle = document.getElementById("audio-title");
  const audioDuration = document.getElementById("audio-duration");
  const generateBtn = document.getElementById("generate-worksheet");
  const worksheetContent = document.getElementById("worksheet-content");
  const worksheetTopic = document.getElementById("worksheet-topic");
  const worksheetDate = document.getElementById("worksheet-date");
  const worksheetQuestions = document.getElementById("worksheet-questions");
  const downloadBtn = document.getElementById("download-worksheet");

  let currentTopic = "ielts";

  const topicDisplayMap = {
    ielts: "IELTS",
    christmas: "Christmas",
    halloween: "Halloween",
  };

  // Mock audio URLs - replace with actual audio files
  const audioMap = {
    ielts: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    christmas: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    halloween: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  };

  // Mock worksheet templates
  const worksheetTemplates = {
    ielts: [
      { q: "What is the main topic discussed in the audio?", a: "" },
      { q: "List three key vocabulary words you heard.", a: "" },
      { q: "Summarize the speaker's main argument in 2-3 sentences.", a: "" },
      { q: "What examples were given to support the main point?", a: "" },
      { q: "What is your opinion on this topic?", a: "" },
    ],
    christmas: [
      { q: "What Christmas traditions are mentioned in the audio?", a: "" },
      { q: "Describe the atmosphere or mood conveyed.", a: "" },
      { q: "List the main activities or events discussed.", a: "" },
      { q: "What cultural aspects of Christmas were highlighted?", a: "" },
      { q: "How does this relate to your own experiences?", a: "" },
    ],
    halloween: [
      { q: "What Halloween customs are described?", a: "" },
      { q: "Identify three Halloween-related vocabulary words.", a: "" },
      { q: "What is the historical background mentioned?", a: "" },
      { q: "Describe the celebrations or activities discussed.", a: "" },
      { q: "Compare Halloween traditions in different cultures.", a: "" },
    ],
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

  function loadAudio(topicKey) {
    const audioUrl = audioMap[topicKey];
    if (audioElement && audioUrl) {
      audioElement.src = audioUrl;
      if (audioTitle) {
        audioTitle.textContent = `${topicDisplayMap[topicKey]} Audio Material`;
      }
      
      audioElement.addEventListener('loadedmetadata', function() {
        const minutes = Math.floor(audioElement.duration / 60);
        const seconds = Math.floor(audioElement.duration % 60);
        if (audioDuration) {
          audioDuration.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
      });
    }
  }

  function generateWorksheet(topicKey) {
    const template = worksheetTemplates[topicKey] || worksheetTemplates.ielts;
    const displayName = topicDisplayMap[topicKey] || topicKey;
    
    if (worksheetTopic) {
      worksheetTopic.textContent = displayName;
    }
    
    if (worksheetDate) {
      const today = new Date();
      worksheetDate.textContent = today.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    if (worksheetQuestions) {
      worksheetQuestions.innerHTML = '';
      template.forEach((item, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'question-item';
        questionDiv.innerHTML = `
          <div class="question-number">Question ${index + 1}</div>
          <div class="question-text">${item.q}</div>
          <div class="question-answer" contenteditable="true" placeholder="Type your answer here..."></div>
        `;
        worksheetQuestions.appendChild(questionDiv);
      });
    }
    
    if (generateBtn) {
      generateBtn.style.display = 'none';
    }
    if (worksheetContent) {
      worksheetContent.style.display = 'flex';
    }
  }

  function downloadWorksheet() {
    const topic = topicDisplayMap[currentTopic];
    const date = new Date().toLocaleDateString('zh-CN');
    let content = `${topic} 练习纸\n生成日期: ${date}\n\n`;
    
    const questions = worksheetQuestions.querySelectorAll('.question-item');
    questions.forEach((item, index) => {
      const questionText = item.querySelector('.question-text').textContent;
      const answerText = item.querySelector('.question-answer').textContent || '[待填写]';
      content += `问题 ${index + 1}: ${questionText}\n回答: ${answerText}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topic}_worksheet_${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function openNotebookForTopic(topicKey) {
    currentTopic = topicKey;
    const displayName = topicDisplayMap[topicKey] || topicKey || "IELTS";
    
    if (notebookTopicEl) {
      notebookTopicEl.textContent = displayName;
    }
    
    // Reset worksheet UI
    if (generateBtn) {
      generateBtn.style.display = 'block';
    }
    if (worksheetContent) {
      worksheetContent.style.display = 'none';
    }
    
    loadAudio(topicKey);
    setActiveView("notebook");
  }

  function bindEvents() {
    const profileBtn = document.querySelector('[data-view="profile"]');
    if (profileBtn) {
      profileBtn.addEventListener("click", function () {
        setActiveView("profile");
      });
    }

    const homeBackBtns = document.querySelectorAll('[data-view="home"]');
    homeBackBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        setActiveView("home");
      });
    });

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

    if (generateBtn) {
      generateBtn.addEventListener("click", function () {
        generateWorksheet(currentTopic);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener("click", downloadWorksheet);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
