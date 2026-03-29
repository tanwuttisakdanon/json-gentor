import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Builder from './pages/Builder'
import DataEntry from './pages/DataEntry'
import Export from './pages/Export' // 1. นำเข้า

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/data" element={<DataEntry />} />
        <Route path="/export" element={<Export />} /> {/* 2. เพิ่ม Route */}
      </Route>
    </Routes>
  )
}

export default App