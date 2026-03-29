import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Builder from './pages/Builder'

function App() {
  return (
    <Routes>
      {/* ครอบทุกหน้าด้วย Layout */}
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
      </Route>
    </Routes>
  )
}

export default App