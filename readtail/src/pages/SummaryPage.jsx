import React from 'react'
import BottomNav from '../components/BottomNav'
import './SummaryPage.css'

const SummaryPage = () => {
  return (
    <div className="summary-page">
      <div className="under-development">
        <div className="dev-icon">🚧</div>
        <h1>功能开发中</h1>
        <p>总结页面正在开发，敬请期待！</p>
        <div className="dev-features">
          <h3>即将推出的功能：</h3>
          <ul>
            <li>📊 学习数据统计与分析</li>
            <li>📈 阅读进度追踪</li>
            <li>🏆 成就徽章系统</li>
            <li>📝 个人学习笔记汇总</li>
            <li>🎯 学习目标设定与完成度</li>
          </ul>
        </div>
      </div>
      <BottomNav activeIndex={3} />
    </div>
  )
}

export default SummaryPage
