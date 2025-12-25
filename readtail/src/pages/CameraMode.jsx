import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import './CameraMode.css'

const CameraMode = () => {
  const navigate = useNavigate()
  const [recognized, setRecognized] = useState(false)
  const [notes, setNotes] = useState([])
  const [currentPageNotes, setCurrentPageNotes] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [notesExpanded, setNotesExpanded] = useState(false)
  const videoRef = useRef(null)

  useEffect(() => {
    // 启动摄像头
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(stream => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      })
      .catch(err => console.error("摄像头访问失败:", err))

    // 加载笔记 - note_shadow.txt 没有页码标记，直接显示所有批注
    fetch('/note_shadow.txt')
      .then(res => res.text())
      .then(text => {
        const noteLines = text.split('\n').filter(line => line.trim())
        setNotes(noteLines)
        // 直接设置所有笔记为当前页笔记（因为没有页码分割）
        setCurrentPageNotes(noteLines)
      })

    // 模拟识别延迟
    setTimeout(() => {
      setRecognized(true)
    }, 2000)

    return () => {
      // 清理摄像头
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="camera-mode">
      {/* 返回按钮 */}
      <div className="return-btn" onClick={() => navigate('/books')}>
        <img src="/icon/back.png" alt="return" />
      </div>

      {/* 左侧章节导航 */}
      <div className="chapter-nav">
        <div className="book-cover">
          <img src="/book/book_cover_shadow.png" alt="book cover" />
        </div>
        <h2 className="chapter-title">偷影子的人</h2>
      </div>

      {/* 摄像头区域 */}
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline className="camera-video" />
        {!recognized && (
          <div className="camera-overlay">
            <p>请出示书籍封面...</p>
          </div>
        )}
      </div>

      {/* 左下角宠物反馈 */}
      {recognized && (
        <div className="pet-feedback">
          <img src="/pet/pet_reading.png" alt="pet" />
          <div className="feedback-bubble">
            已识别！《偷影子的人》
          </div>
        </div>
      )}

      {/* 右侧学霸笔记 */}
      <div className={`notes-panel-camera ${notesExpanded ? 'expanded' : 'collapsed'}`}>
        <div className="notes-header" onClick={() => setNotesExpanded(!notesExpanded)}>
          <img src="/icon/card.png" alt="notes" />
          <h3>学霸笔记</h3>
        </div>
        {notesExpanded && (
          <div className="notes-content-camera">
            {currentPageNotes.length > 0 ? (
              currentPageNotes.map((note, index) => (
                <div key={index} className="note-item-camera">
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

export default CameraMode
