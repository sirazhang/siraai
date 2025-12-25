import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './QuizReport.css'

const QuizReport = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const answers = location.state?.answers || []
  const [isCardFlipped, setIsCardFlipped] = useState(false)
  
  const correctCount = answers.filter(a => a.correct).length
  const totalCount = answers.length || 5
  const accuracyRate = Math.round((correctCount / totalCount) * 100)
  const readingTime = 5 // 当前阅读时长（分钟）
  const totalReadingGoal = 120 // 总目标时长（分钟）
  const readingTimeRate = Math.round((readingTime / totalReadingGoal) * 100)
  const coins = 2 // 每题一个金币
  const totalCoinsGoal = 30 // 总目标金币
  const coinsRate = Math.round((coins / totalCoinsGoal) * 100)

  return (
    <div className="quiz-report">
      {/* 用户信息 */}
      <div className="user-info">
        <img src="/icon/user.png" alt="user" className="user-avatar" />
        <div className="user-greeting">
          <div className="greeting-text">你好，</div>
          <div className="user-name">小明！</div>
        </div>
      </div>

      {/* 搜索图标 */}
      <div className="search-icon">
        <img src="/icon/search.png" alt="search" />
      </div>

      {/* 左侧宠物区域 */}
      <div className="pet-congratulation">
        <img src="/pet/pet4.png" alt="pet" className="pet-image" />
        <div className="pet-dialogue-container">
          <img src="/pet/dialogue.png" alt="dialogue" className="dialogue-bg" />
          <div className="dialogue-text">你太厉害啦！</div>
        </div>
      </div>

      {/* 右侧核心数据展示区 */}
      <div className="stats-container">
        
        <div className="progress-rings">
          {/* 正确率 */}
          <div className="ring-item">
            <div className="circular-progress">
              <svg width="180" height="180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#E0E0E0" strokeWidth="16" />
                <circle 
                  cx="90" 
                  cy="90" 
                  r="70" 
                  fill="none" 
                  stroke="#6FA87D" 
                  strokeWidth="16"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - accuracyRate / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="progress-content">
                <img src="/icon/accurate.png" alt="accuracy" className="stat-icon" />
                <div className="stat-value">{accuracyRate}%</div>
              </div>
            </div>
            <div className="stat-label">正确率</div>
          </div>

          {/* 阅读时长 */}
          <div className="ring-item">
            <div className="circular-progress">
              <svg width="180" height="180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#E0E0E0" strokeWidth="16" />
                <circle 
                  cx="90" 
                  cy="90" 
                  r="70" 
                  fill="none" 
                  stroke="#FFB74D" 
                  strokeWidth="16"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - readingTimeRate / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="progress-content">
                <img src="/icon/time.png" alt="time" className="stat-icon" />
                <div className="stat-value">{readingTime}分钟</div>
              </div>
            </div>
            <div className="stat-label">阅读时长</div>
          </div>

          {/* 获得金币 */}
          <div className="ring-item">
            <div className="circular-progress">
              <svg width="180" height="180">
                <circle cx="90" cy="90" r="70" fill="none" stroke="#E0E0E0" strokeWidth="16" />
                <circle 
                  cx="90" 
                  cy="90" 
                  r="70" 
                  fill="none" 
                  stroke="#FFD54F" 
                  strokeWidth="16"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - coinsRate / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 90 90)"
                />
              </svg>
              <div className="progress-content">
                <img src="/icon/coin.png" alt="coins" className="stat-icon" />
                <div className="stat-value">{coins}枚</div>
              </div>
            </div>
            <div className="stat-label">金币数量</div>
          </div>
        </div>

        {/* 互动翻转卡片 */}
        <div className="flip-card-wrapper">
          <div 
            className={`flip-card ${isCardFlipped ? 'flipped' : ''}`}
            onClick={() => setIsCardFlipped(!isCardFlipped)}
          >
            <div className="flip-card-inner">
              {/* 正面 */}
              <div className="flip-card-front">
                <h3 className="card-title">趣味知识拓展</h3>
                <p className="card-content">
                  小知识：郑人买履是战国时期的寓言，讽刺了那些墨守成规、不懂得灵活变通的人哦。
                </p>
              </div>
              
              {/* 背面 */}
              <div className="flip-card-back">
                <h3 className="card-title">小提醒</h3>
                <p className="card-content">
                  下次阅读可以多关注寓言里的人物行为，能更快找到问题答案啦。
                </p>
              </div>
            </div>
          </div>
          <div className="flip-hint">点击卡片翻转</div>
        </div>
      </div>

      <BottomNav activeIndex={2} />
    </div>
  )
}

export default QuizReport
