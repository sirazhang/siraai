import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './BookSelection.css'

const BookSelection = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('recommended')
  const [selectedIndex, setSelectedIndex] = useState(1) // 默认选中第2本书 (cover 2)
  const [showButton, setShowButton] = useState(false)
  const [showPetDialogue, setShowPetDialogue] = useState(false)
  const [petDialogueText, setPetDialogueText] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const dragStartX = useRef(0)
  const dragCurrentX = useRef(0)
  const typingTimeoutRef = useRef(null)

  const books = [
    { id: 1, cover: '/book/book_cover1.png', title: '中国寓言故事' },
    { id: 2, cover: '/book/book_cover2.png', title: '郑人买履' },
    { id: 3, cover: '/book/book_cover3.png', title: '成语故事' },
    { id: 4, cover: '/book/book_cover4 .png', title: '童话故事' },
    { id: 5, cover: '/book/book_cover1.png', title: '古代神话' }
  ]

  // 打字机效果
  useEffect(() => {
    if (showPetDialogue && activeTab === 'recommended') {
      const fullText = '我为你选择了一些合适的书籍'
      let charIndex = 0
      setPetDialogueText('')
      
      const typeChar = () => {
        if (charIndex < fullText.length) {
          setPetDialogueText(fullText.substring(0, charIndex + 1))
          charIndex++
          typingTimeoutRef.current = setTimeout(typeChar, 80)
        }
      }
      typeChar()
    } else {
      setPetDialogueText('')
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }, [showPetDialogue, activeTab])

  // 点击"你的书籍"直接跳转
  const handleTabClick = (tab) => {
    if (tab === 'mybooks') {
      navigate('/camera')
    } else {
      setActiveTab(tab)
    }
  }

  const handleBookClick = (index) => {
    setSelectedIndex(index)
    setShowButton(true)
  }

  const handleStartReading = () => {
    if (activeTab === 'recommended') {
      navigate('/pet-unlock')
    } else {
      navigate('/camera')
    }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    dragStartX.current = e.clientX
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    dragCurrentX.current = e.clientX
    const diff = dragStartX.current - dragCurrentX.current
    
    if (Math.abs(diff) > 100) {
      if (diff > 0 && selectedIndex < books.length - 1) {
        setSelectedIndex(selectedIndex + 1)
        setShowButton(false)
        dragStartX.current = e.clientX
      } else if (diff < 0 && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1)
        setShowButton(false)
        dragStartX.current = e.clientX
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <div className="book-selection">
      {/* 顶部用户信息 */}
      <div className="user-info user-info-adjusted">
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

      {/* 中部导航标签 */}
      <div className="nav-tabs">
        <div 
          className={`tab ${activeTab === 'recommended' ? 'active' : ''}`}
          onClick={() => handleTabClick('recommended')}
        >
          推荐书籍
        </div>
        <div 
          className={`tab ${activeTab === 'mybooks' ? 'active' : ''}`}
          onClick={() => handleTabClick('mybooks')}
        >
          你的书籍
        </div>
      </div>

      {/* 书籍展示区 */}
      <div className="books-carousel">
        {/* 宠物 - 右侧 */}
        <div 
          className="pet-hello-container"
          onMouseEnter={() => setShowPetDialogue(true)}
          onMouseLeave={() => setShowPetDialogue(false)}
        >
          <img src="/pet/pet_hello.png" alt="pet" className="pet-hello" />
          {showPetDialogue && activeTab === 'recommended' && (
            <div className="pet-dialogue-bubble">
              <img src="/pet/dialogue.png" alt="dialogue" className="dialogue-bubble-bg" />
              <div className="dialogue-bubble-text">{petDialogueText}</div>
            </div>
          )}
        </div>

        {/* 横向轮播容器 */}
        <div 
          className="horizontal-carousel"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="books-slider">
            {books.map((book, index) => {
              const isSelected = index === selectedIndex
              const offset = (index - selectedIndex) * 350
              
              return (
                <div
                  key={book.id}
                  className={`book-slide ${isSelected ? 'selected' : ''}`}
                  style={{
                    transform: `translateX(${offset}px) scale(${isSelected ? 1 : 0.8})`,
                    opacity: isSelected ? 1 : 0.5,
                    zIndex: isSelected ? 10 : 5
                  }}
                  onClick={() => handleBookClick(index)}
                >
                  <img src={book.cover} alt={book.title} />
                  
                  {isSelected && showButton && (
                    <button 
                      className="start-reading-overlay" 
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartReading()
                      }}
                    >
                      开始阅读
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BottomNav activeIndex={1} />
    </div>
  )
}

export default BookSelection
