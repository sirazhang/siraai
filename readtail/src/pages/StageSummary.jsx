import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import './StageSummary.css';

const StageSummary = () => {
  const navigate = useNavigate();
  const [showGradeMenu, setShowGradeMenu] = useState(false);
  const [currentGrade, setCurrentGrade] = useState('三年级');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSticker, setCurrentSticker] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [showBookClub, setShowBookClub] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);

  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  
  // Sticker images from public directory
  const stickerImages = [
    '/sticker_fable.png',
    '/sticker_shadow.png'
  ];

  // 宠物数据
  const forestPets = [
    { id: 1, src: '/pet/pet4.png', name: '小明', level: 'LV3', top: '60%', left: '15%' },
    { id: 2, src: '/pet/pet5.png', name: '小红', level: 'LV5', top: '15%', left: '25%', flying: true },
    { id: 3, src: '/pet/pet6.png', name: '小白', level: 'LV2', top: '70%', left: '55%' },
    { id: 4, src: '/pet/pet7.png', name: '小黄', level: 'LV4', top: '45%', left: '70%' },
    { id: 5, src: '/pet/pet8.png', name: '小黑', level: 'LV1', top: '80%', left: '85%' },
    { id: 6, src: '/pet/pet10.gif', name: '小橙', level: 'LV6', top: '50%', left: '40%' },
  ];

  const handleGradeChange = (grade) => {
    setCurrentGrade(grade);
    setShowGradeMenu(false);
  };

  const toggleAudio = () => {
    const audio = document.getElementById('podcast-audio');
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextSticker = () => {
    setCurrentSticker((prev) => (prev + 1) % stickerImages.length);
  };

  const handleDownload = () => {
    setIsDownloading(true);
    // Simulate download
    setTimeout(() => setIsDownloading(false), 1000);
  };

  const handlePrint = () => {
    setIsPrinting(true);
    // Simulate print
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleFriendClick = () => {
    setShowBookClub(true);
  };

  const handleCloseBookClub = () => {
    setShowBookClub(false);
    setSelectedPet(null);
  };

  const handlePetClick = (pet) => {
    setSelectedPet(selectedPet?.id === pet.id ? null : pet);
  };

  const handleRewardClick = () => {
    alert('兑换奖励功能待开发，敬请期待！');
  };

  return (
    <div className="stage-summary">
      {/* 宠物装饰元素 */}
      <div className="pet-decor">
        <img src="/pet/pet5.png" alt="pet" className="pet-flying" />
      </div>

      {/* 用户信息和年级选择 */}
      <div className="user-grade-section">
        <div className="user-info">
          <img src="/icon/user.png" alt="user" className="user-avatar" />
          <div className="user-greeting">
            <div className="greeting-text">你好，</div>
            <div className="user-name">小明！</div>
          </div>
        </div>
        
        <div className="grade-selector-wrapper">
          <div className="grade-selector" onClick={() => setShowGradeMenu(!showGradeMenu)}>
            <span className="grade-text">我的年级</span>
            <span className="grade-arrow">▼</span>
          </div>
          
          {showGradeMenu && (
            <div className="grade-menu">
              {grades.map((grade) => (
                <div 
                  key={grade} 
                  className="grade-option"
                  onClick={() => handleGradeChange(grade)}
                >
                  {grade}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 核心功能区 */}
      <div className="core-features">
        {/* 今日阅读手帐 */}
        <div className="diary-section">
          <div className="diary-header">
            <img src="/icon/notebook.png" alt="notebook" className="header-icon" />
            <h2>今日阅读手帐</h2>
          </div>
          <div className="print-section">
            <img src="/icon/print.png" alt="print" className="print-icon" onClick={handlePrint} />
            <div className="print-label">点击打印手帐</div>
          </div>
          <div className="diary-content">
            <img src={stickerImages[currentSticker]} alt="sticker" className="sticker-image" onClick={nextSticker} />
          </div>
        </div>

        {/* 右侧模块 */}
        <div className="right-modules">
          {/* 总结随心听 */}
          <div className="podcast-section" onClick={toggleAudio}>
            <div className="module-row">
              <img src="/icon/podcast.png" alt="podcast" className="header-icon-large" />
              <div className="module-text">
                <h2>总结随心听</h2>
                <div className="section-subtitle">点击，听一下你今日的阅读博客</div>
              </div>
            </div>
          </div>

          {/* 宠物读书社 */}
          <div className="book-club-section" onClick={handleFriendClick}>
            <div className="module-row">
              <img src="/icon/pethome.png" alt="pethome" className="header-icon-large" />
              <div className="module-text">
                <h2>宠物读书社</h2>
                <div className="section-subtitle">看看其他小伙伴的阅读进度</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 音频元素 */}
      <audio 
        id="podcast-audio"
        src="/podcast.mp3" 
        onEnded={() => setIsPlaying(false)}
      />

      {/* 宠物读书社弹窗 */}
      {showBookClub && (
        <div className="book-club-modal-overlay" onClick={handleCloseBookClub}>
          <div className="book-club-modal" onClick={(e) => e.stopPropagation()}>
            {/* 关闭按钮 */}
            <img 
              src="/icon/close.png" 
              alt="close" 
              className="modal-close-btn" 
              onClick={handleCloseBookClub} 
            />
            
            {/* 主内容区 */}
            <div className="book-club-content">
              {/* 左侧森林地图 */}
              <div className="forest-map-container">
                <img src="/icon/forest.png" alt="forest" className="forest-bg" />
                
                {/* 宠物散落在地图上 */}
                {forestPets.map((pet) => (
                  <div 
                    key={pet.id}
                    className={`forest-pet ${pet.flying ? 'flying' : ''}`}
                    style={{ top: pet.top, left: pet.left }}
                    onClick={() => handlePetClick(pet)}
                  >
                    <img src={pet.src} alt={pet.name} />
                    {/* 点击显示昵称和等级 */}
                    {selectedPet?.id === pet.id && (
                      <div className="pet-info-tooltip">
                        <span className="pet-nickname">{pet.name}</span>
                        <span className="pet-level">{pet.level}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 右侧信息面板 */}
              <div className="info-panel">
                <div className="info-item">
                  <img src="/icon/coin.png" alt="coin" className="info-icon" />
                  <span className="info-text">累计金币：300枚</span>
                </div>
                
                <div className="info-item">
                  <img src="/icon/reward.png" alt="reward" className="info-icon" />
                  <span className="info-text">宠物等级：LV1</span>
                </div>
                
                <button className="reward-btn" onClick={handleRewardClick}>
                  兑换奖励
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav activeIndex={3} />
    </div>
  );
};

export default StageSummary;