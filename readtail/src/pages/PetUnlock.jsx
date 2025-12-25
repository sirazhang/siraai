import React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './PetUnlock.css'

const PetUnlock = () => {
  const navigate = useNavigate()

  const pets = [
    { id: 1, image: '/pet/pet2.png', unlocked: false },
    { id: 2, image: '/pet/pet1.png', unlocked: true },
    { id: 3, image: '/pet/pet3.png', unlocked: false }
  ]

  const handleStartReading = () => {
    navigate('/reading')
  }

  return (
    <div className="pet-unlock">
      {/* 顶部用户信息 */}
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

      {/* 中央宠物展示区 */}
      <div className="pets-display">
        {/* 左侧宠物 */}
        <div className="pet-side locked">
          <div className="pet-image-container">
            <img src={pets[0].image} alt="pet" />
            <div className="question-mark">?</div>
          </div>
          <div className="status-label">待解锁</div>
        </div>

        {/* 中间主角宠物 */}
        <div className="pet-main">
          <img src={pets[1].image} alt="main pet" />
          <div className="status-label unlocked">已解锁</div>
          
          {/* 对话气泡 */}
          <div className="dialogue-bubble">
            <img src="/pet/dialogue.png" alt="dialogue" className="dialogue-bg" />
            <div className="dialogue-content">
              <p>完成今天的任务，可以</p>
              <p>解锁更多我的皮肤哦！</p>
            </div>
          </div>
        </div>

        {/* 右侧宠物 */}
        <div className="pet-side locked">
          <div className="pet-image-container">
            <img src={pets[2].image} alt="pet" />
            <div className="question-mark">?</div>
          </div>
          <div className="status-label">待解锁</div>
        </div>
      </div>

      {/* 开始阅读按钮 */}
      <button className="continue-btn" onClick={handleStartReading}>
        继续阅读
      </button>

      <BottomNav activeIndex={1} />
    </div>
  )
}

export default PetUnlock
