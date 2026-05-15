import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import DemoForm from './pages/DemoForm'
import AdminCalls from './pages/AdminCalls'
import AdminCallDetail from './pages/AdminCallDetail'
import BulkCall from './pages/BulkCall'
import './App.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/demo" element={<DemoForm />} />
        <Route path="/admin/calls" element={<AdminCalls />} />
        <Route path="/admin/calls/:id" element={<AdminCallDetail />} />
        <Route path="/bulk" element={<BulkCall />} />
      </Routes>
    </Router>
  )
}

export default App
