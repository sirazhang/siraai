import React from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './HomePage.css'

const HomePage = () => {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* 左侧用户信息 */}
      <div className="user-info">
        <img src="/icon/user.png" alt="user" className="user-avatar" />
        <div className="user-greeting">
          <div className="greeting-text">你好，</div>
          <div className="user-name">小明！</div>
        </div>
      </div>

      {/* 左侧宠物展示区 */}
      <div className="pet-section">
        <div className="pet-container">
          <img src="/pet/pet_home.png" alt="pet home" className="pet-home" />
          <img src="/pet/pet_sleep.png" alt="sleeping pet" className="pet-sleeping" />
        </div>
        <div className="pet-dialogue-container">
          <img src="/pet/pet_dialogue.png" alt="dialogue" className="dialogue-bg" />
          <div className="dialogue-text">开始阅读可以唤起我哦～</div>
        </div>
      </div>

      {/* 右侧功能卡片区 */}
      <div className="cards-section">
        {/* 今日阅读进度卡片 */}
        <div className="progress-card">
          <h3>今日阅读进度</h3>
          <div className="progress-bar-container">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '40%' }}></div>
            </div>
            <span className="progress-text">2/5 页</span>
          </div>
          <button className="start-btn green" onClick={() => navigate('/books')}>
            快速阅读
          </button>
        </div>

        {/* 功能卡片组 */}
        <div className="function-cards">
          <div className="function-card blue-card" onClick={() => navigate('/quiz')}>
            <h3>真题检测</h3>
            <p>测试一下你的阅读理解能力</p>
            <button className="card-btn">测试一下</button>
          </div>
          <div className="function-card yellow-card" onClick={() => navigate('/stage-summary')}>
            <h3>阶段总结</h3>
            <p>回顾你的学习成果</p>
            <button className="card-btn" onClick={(e) => { e.stopPropagation(); navigate('/stage-summary'); }}>小结一下</button>
          </div>
        </div>
      </div>

      <BottomNav activeIndex={0} />
    </div>
  )
}

export default HomePage
