import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './BottomNav.css'

const BottomNav = ({ activeIndex = 0 }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { 
      icon: '/icon/homescreen1.png', 
      activeIcon: '/icon/homescreen2.png',
      path: '/', 
      name: '首页' 
    },
    { 
      icon: '/icon/library1.png', 
      activeIcon: '/icon/library2.png',
      path: '/books', 
      name: '书库' 
    },
    { 
      icon: '/icon/test1.png', 
      activeIcon: '/icon/test2.png',
      path: '/quiz', 
      name: '测试' 
    },
    { 
      icon: '/icon/community1.png', 
      activeIcon: '/icon/community2.png',
      path: '/stage-summary', 
      name: '阶段总结' 
    }
  ]

  const handleNavClick = (index, path) => {
    navigate(path)
  }

  return (
    <div className="bottom-nav">
      {navItems.map((item, index) => {
        const isActive = activeIndex === index
        return (
          <div
            key={index}
            className={`nav-item ${isActive ? 'active' : ''}`}
            onClick={() => handleNavClick(index, item.path)}
          >
            <img src={isActive ? item.activeIcon : item.icon} alt={item.name} />
          </div>
        )
      })}
    </div>
  )
}

export default BottomNav
