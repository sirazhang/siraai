import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import './QuizMode.css'

const QuizMode = () => {
  const navigate = useNavigate()
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [isCorrect, setIsCorrect] = useState(null)
  const [answers, setAnswers] = useState([])
  const [petMessage, setPetMessage] = useState('')

  const correctMessages = ['你真棒！', '汪汪！', '✓ 答对啦！']
  const wrongMessages = ['没关系，再想想～', '继续加油哦！']

  useEffect(() => {
    // 加载题目
    fetch('/questions.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text.split('\n').filter(line => line.trim())
        const parsedQuestions = []
        let currentQ = {}
        
        lines.forEach(line => {
          if (line.match(/^\d+\./)) {
            if (currentQ.question) {
              parsedQuestions.push(currentQ)
            }
            currentQ = { question: line, options: [] }
          } else if (line.match(/^[A-D]\./)) {
            currentQ.options.push(line)
          } else if (line.startsWith('答案：')) {
            currentQ.answer = line.split('：')[1].trim()
          }
        })
        if (currentQ.question) {
          parsedQuestions.push(currentQ)
        }
        
        setQuestions(parsedQuestions)
      })
  }, [])

  const handleAnswerSelect = (option) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(option)
    const correct = option === questions[currentQuestion].answer
    setIsCorrect(correct)
    
    const message = correct 
      ? correctMessages[Math.floor(Math.random() * correctMessages.length)]
      : wrongMessages[Math.floor(Math.random() * wrongMessages.length)]
    setPetMessage(message)

    setAnswers([...answers, { question: currentQuestion, correct }])

    // 自动跳转到下一题
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer(null)
        setIsCorrect(null)
        setPetMessage('')
      } else {
        // 完成所有题目，跳转到报告页
        navigate('/quiz-report', { state: { answers } })
      }
    }, 2000)
  }

  if (questions.length === 0) {
    return <div className="quiz-mode">加载中...</div>
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="quiz-mode">
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

      {/* 进度条 - 放在小明下方 */}
      <div className="quiz-progress-container">
        <div className="progress-bar-quiz">
          <div 
            className={`progress-fill-quiz ${isCorrect ? 'correct-flash' : ''}`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <span className="progress-count">{currentQuestion + 1}/{questions.length}</span>
      </div>

      {/* 题目区域 */}
      <div className="question-area">
        <h2 className="question-title">问题{currentQuestion + 1}：{currentQ.question.replace(/^\d+\.\s*/, '')}</h2>
        <div className="options-grid">
          {currentQ.options.map((option, index) => {
            const optionLetter = option.charAt(0)
            const isSelected = selectedAnswer === optionLetter
            const isAnswer = optionLetter === currentQ.answer
            
            return (
              <div
                key={index}
                className={`option-card ${isSelected && isCorrect ? 'correct' : ''} ${isSelected && !isCorrect ? 'wrong' : ''}`}
                onClick={() => handleAnswerSelect(optionLetter)}
              >
                {option}
              </div>
            )
          })}
        </div>
      </div>

      {/* 宠物反馈 */}
      <div className="quiz-pet">
        <img 
          src="/pet/pet_hello.png" 
          alt="pet" 
          className={isCorrect === true ? 'jump' : ''}
        />
        {petMessage && (
          <div className="pet-message-bubble">
            <img src="/pet/dialogue.png" alt="bubble" className="bubble-bg" />
            <div className="bubble-text">{petMessage}</div>
          </div>
        )}
      </div>

      <BottomNav activeIndex={2} />
    </div>
  )
}

export default QuizMode
