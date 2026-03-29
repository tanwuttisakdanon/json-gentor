import { useEffect } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from './firebase'
import { useJsonStore } from './store/jsonStore'

import Layout from './components/Layout'
import Home from './pages/Home'
import Builder from './pages/Builder'
import DataEntry from './pages/DataEntry'
import Export from './pages/Export'
import Login from './pages/Login' // 1. นำเข้าหน้า Login

function App() {
  const { setUser } = useJsonStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // ฟังก์ชันนี้จะทำงานอัตโนมัติเมื่อสถานะ Login เปลี่ยนแปลง
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // ถ้า Login แล้ว ก็เก็บข้อมูลลง Store
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        });
        // ถ้าอยู่หน้า Login ให้เด้งไปหน้าแรก
        if (location.pathname === '/login') navigate('/');
      } else {
        // ถ้ายังไม่ได้ Login หรือ Logout ออกไปแล้ว
        setUser(null);
        // บังคับให้ไปหน้า Login
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname, setUser]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/data" element={<DataEntry />} />
        <Route path="/export" element={<Export />} />
      </Route>
    </Routes>
  )
}

export default App