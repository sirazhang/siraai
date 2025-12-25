import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReadingArea.css'

const ReadingArea = () => {
  const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [showNotes, setShowNotes] = useState(false)
  const [notesExpanded, setNotesExpanded] = useState(false) // 默认收起
  const [pages, setPages] = useState([])
  const [notes, setNotes] = useState([])
  const [currentPageNotes, setCurrentPageNotes] = useState([])
  const [isReading, setIsReading] = useState(false)
  const [selectedLine, setSelectedLine] = useState(null)
  const [likedLines, setLikedLines] = useState([])
  const [dislikedLines, setDislikedLines] = useState([])
  const [highlightedLines, setHighlightedLines] = useState([0, 1, 2])
  const [petDialogueText, setPetDialogueText] = useState('')
  const [showPetDialogue, setShowPetDialogue] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [explanationText, setExplanationText] = useState('')
  const [explanationTarget, setExplanationTarget] = useState('')
  const audioRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  const fullPetDialogue = '🌟 今日小目标 🌟\n📖 用 16 分钟，读完 4 页、2 个小故事\n👉 找出一句最搞笑😂的句子 读给爸爸妈妈听\n❓ 想一想\n👟 为什么郑人不在店里试鞋，却一定要回家量尺寸？'

  useEffect(() => {
    // 加载内容并按页分割
    fetch('/content.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n')
        const pageData = []
        let currentPageLines = []
        let currentPageNum = null

        lines.forEach(line => {
          const pageMatch = line.match(/【第(\d+)页】/)
          if (pageMatch) {
            if (currentPageLines.length > 0 && currentPageNum !== null) {
              pageData.push({ pageNum: currentPageNum, lines: currentPageLines })
            }
            currentPageNum = parseInt(pageMatch[1])
            currentPageLines = []
          } else if (line.trim() && !line.includes('[FIGURE_START]') && !line.startsWith('id:') && !line.startsWith('source:')) {
            currentPageLines.push(line.trim())
          }
        })

        if (currentPageLines.length > 0 && currentPageNum !== null) {
          pageData.push({ pageNum: currentPageNum, lines: currentPageLines })
        }

        setPages(pageData)
      })

    // 加载笔记
    fetch('/note_fable.txt')
      .then(res => res.text())
      .then(text => {
        const noteLines = text.split('\n').filter(line => line.trim())
        setNotes(noteLines)
      })
  }, [])

  // 根据当前页码更新笔记内容
  useEffect(() => {
    const pageNotes = notes.filter(note => note.includes(`【第${currentPage}页】`))
    const nextPageMarker = notes.findIndex((note, idx) => 
      idx > notes.indexOf(pageNotes[0] || '') && note.includes('【第')
    )
    
    const startIdx = notes.indexOf(pageNotes[0] || '')
    if (startIdx !== -1) {
      const endIdx = nextPageMarker !== -1 ? nextPageMarker : notes.length
      const pageContent = notes.slice(startIdx + 1, endIdx).filter(n => n.trim())
      setCurrentPageNotes(pageContent)
      // 不自动展开笔记，由用户点击展开
    } else {
      setCurrentPageNotes([])
    }
  }, [currentPage, notes])

  // 宠物对话框打字效果
  useEffect(() => {
    if (showPetDialogue && !isReading) {
      let charIndex = 0
      setPetDialogueText('')
      
      const typeChar = () => {
        if (charIndex < fullPetDialogue.length) {
          setPetDialogueText(fullPetDialogue.substring(0, charIndex + 1))
          charIndex++
          typingTimeoutRef.current = setTimeout(typeChar, 50)
        }
      }
      typeChar()

      return () => {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }
      }
    }
  }, [showPetDialogue, isReading])

  const handleStartReading = () => {
    setIsReading(true)
    // 保留宠物，仅隐藏对话框
    setShowPetDialogue(false)
  }

  // 点击屏幕任意位置隐藏对话
  const handleScreenClick = () => {
    if (showPetDialogue && isReading) {
      setShowPetDialogue(false)
    }
  }

  const handleLineClick = (lineIndex) => {
    setSelectedLine(selectedLine === lineIndex ? null : lineIndex)
  }

  const handlePlayAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play().catch(err => console.log('Audio play failed:', err))
        setIsPlaying(true)
      }
    }
  }

  const handleNextPage = () => {
    if (currentPage < pages.length) {
      setCurrentPage(currentPage + 1)
      setSelectedLine(null)
      setShowPetDialogue(false)
      // 移动高亮区域
      setHighlightedLines([0, 1, 2])
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      setSelectedLine(null)
      setHighlightedLines([0, 1, 2])
    }
  }

  const handleLike = (lineKey) => {
    if (likedLines.includes(lineKey)) {
      setLikedLines(likedLines.filter(i => i !== lineKey))
    } else {
      setLikedLines([...likedLines, lineKey])
      setDislikedLines(dislikedLines.filter(i => i !== lineKey))
    }
  }

  const handleDislike = (lineKey) => {
    if (dislikedLines.includes(lineKey)) {
      setDislikedLines(dislikedLines.filter(i => i !== lineKey))
    } else {
      setDislikedLines([...dislikedLines, lineKey])
      setLikedLines(likedLines.filter(i => i !== lineKey))
    }
  }

  const handleDontUnderstand = (line, lineIndex) => {
    // Set the target text to be highlighted
    setExplanationTarget(line)
    // Show the explanation
    setExplanationText('"固执己见"：指一个人只相信自己的想法，不愿意接受他人的意见。')
    setShowExplanation(true)
    
    // Hide the pet dialogue if it's showing
    setShowPetDialogue(false)
  }

  const handleTextClick = (lineIndex) => {
    // 点击文本，高亮区域下移（显示3行）
    const newHighlightedLines = [lineIndex, lineIndex + 1, lineIndex + 2]
    setHighlightedLines(newHighlightedLines)
    setSelectedLine(lineIndex)
  }

  const renderContent = () => {
    const currentPageData = pages.find(p => p.pageNum === currentPage)
    if (!currentPageData) return null

    return currentPageData.lines.map((line, index) => {
      const lineKey = `${currentPage}-${index}`
      const isHighlighted = highlightedLines.includes(index)
      const isSelected = selectedLine === index
      const isExplanationTarget = line.includes('固执己见') || line.includes('郑度') || line.includes('固执己见地说')

      return (
        <div
          key={index}
          className={`content-line ${isHighlighted ? 'highlighted' : 'dimmed'} ${isExplanationTarget ? 'explanation-target' : ''}`}
          onClick={() => handleTextClick(index)}
        >
          <p>{line}</p>
          {isSelected && (
            <div className="line-actions">
              <img 
                src={likedLines.includes(lineKey) ? '/icon/like2.png' : '/icon/like1.png'}
                alt="like"
                className="action-icon"
                onClick={(e) => { e.stopPropagation(); handleLike(lineKey); }}
              />
              <button 
                className="dont-understand-btn"
                onClick={(e) => { e.stopPropagation(); handleDontUnderstand(line, index); }}
              >
                不懂
              </button>
            </div>
          )}
        </div>
      )
    })
  }

  return (
    <div className="reading-area" onClick={handleScreenClick}>
      {/* 返回按钮 */}
      <div className="return-btn" onClick={() => navigate('/pet-unlock')}>
        <img src="/icon/back.png" alt="return" />
      </div>

      {/* 左侧章节导航 */}
      <div className="chapter-nav">
        <div className="book-cover">
          <img src="/book/book_cover2.png" alt="book cover" />
          <div className="voice-overlay" onClick={handlePlayAudio}>
            <img 
              src="/icon/voice.png" 
              alt="play audio" 
              className={isPlaying ? 'playing' : ''}
            />
          </div>
        </div>
        <h2 className="chapter-title">郑人买履</h2>
        <div className="chapter-list">
          <div className="chapter-item">第一章 &gt;</div>
        </div>
        <audio 
          ref={audioRef} 
          src="/voice1.mp3"
          onEnded={() => setIsPlaying(false)}
        />
      </div>

      {/* 左下角宠物 - 仅在阅读模式显示 */}
      {isReading && (
        <div className="bottom-left-pet">
          <img src="/pet/pet_reading.png" alt="pet" className="pet-image" />
          {showExplanation && (
            <div className="pet-explanation-bubble">
              <div className="explanation-text">{explanationText}</div>
            </div>
          )}
        </div>
      )}

      {/* 右下角对话框 - 仅未开始阅读时显示 */}
      {showPetDialogue && !isReading && (
        <div className="reading-pet-container">
          <img src="/pet/pet_reading.png" alt="pet" className="reading-pet" />
          <div className="pet-goal-bubble">
            <div className="goal-content">
              {petDialogueText.split('\n').map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
            <button className="start-reading-btn" onClick={handleStartReading}>
              开始阅读
            </button>
          </div>
        </div>
      )}

      {/* 中央阅读区 */}
      <div className="content-area">
        {/* 页码 */}
        {pages.length > 0 && (
          <div className="page-number">- {currentPage} -</div>
        )}
        
        {/* 可滚动的文本内容 */}
        <div className="content-text-area">
          {renderContent()}
        </div>

        {/* 翻页按钮 - 始终可见 */}
        {isReading && (
          <div className="page-controls">
            <button 
              className="page-btn prev" 
              onClick={(e) => { e.stopPropagation(); handlePrevPage(); }}
              disabled={currentPage === 1}
            >
              上一页
            </button>
            <button 
              className="page-btn next" 
              onClick={(e) => { e.stopPropagation(); handleNextPage(); }}
              disabled={currentPage >= pages.length}
            >
              下一页
            </button>
          </div>
        )}
      </div>

      {/* 右侧学霸笔记 */}
      <div className={`notes-panel ${notesExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="notes-toggle" onClick={() => setNotesExpanded(!notesExpanded)}>
          <img src="/icon/card.png" alt="notes" />
          <span>学霸笔记</span>
        </div>
        {notesExpanded && (
          <div className="notes-content">
            {currentPageNotes.length > 0 ? (
              currentPageNotes.map((note, index) => (
                <div key={index} className="note-item">
                  {note}
                </div>
              ))
            ) : (
              <div className="note-empty">当前页无笔记</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReadingArea
