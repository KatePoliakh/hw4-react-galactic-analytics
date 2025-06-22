import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/Header/Header'
import { AnalyticsPage } from './pages/Analytics/AnalyticsPage'
import { GeneratorPage } from './pages/Generator/GeneratorPage'
import { HistoryPage } from './pages/History/HistoryPage'

function App() {
  
  return (
    <Router>
    <div className="app">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<AnalyticsPage />} />
          <Route path="/generate" element={<GeneratorPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  </Router>
  )
}

export default App
