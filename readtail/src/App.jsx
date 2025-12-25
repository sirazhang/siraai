import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import BookSelection from './pages/BookSelection'
import PetUnlock from './pages/PetUnlock'
import ReadingArea from './pages/ReadingArea'
import CameraMode from './pages/CameraMode'
import QuizMode from './pages/QuizMode'
import QuizReport from './pages/QuizReport'
import SummaryPage from './pages/SummaryPage'
import StageSummary from './pages/StageSummary'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/books" element={<BookSelection />} />
        <Route path="/pet-unlock" element={<PetUnlock />} />
        <Route path="/reading" element={<ReadingArea />} />
        <Route path="/camera" element={<CameraMode />} />
        <Route path="/quiz" element={<QuizMode />} />
        <Route path="/quiz-report" element={<QuizReport />} />
        <Route path="/summary" element={<SummaryPage />} />
        <Route path="/stage-summary" element={<StageSummary />} />
      </Routes>
    </Router>
  )
}

export default App
