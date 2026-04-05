import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore'; // เปลี่ยนจาก getDocs เป็น onSnapshot
import { useJsonStore } from '../store/jsonStore';
import { useNavigate } from 'react-router-dom';
import { Plus, Clock, ArrowRight, CodeXml, AlertCircle } from 'lucide-react';
import { DataGraphic, EmptyBoxGraphic } from '../components/Illustrations';

export default function Home() {
    const { user, loadProject, resetProject } = useJsonStore();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); // เพิ่มตัวแปรเช็ค Error
    const navigate = useNavigate();

    useEffect(() => {
        // 1. เช็คว่า User โหลดเสร็จหรือยัง
        if (!user) {
            setLoading(false);
            return;
        }

        setLoading(true);

        // 2. สร้าง Query สำหรับดึงข้อมูล
        // หมายเหตุ: หากรันแล้ว Error ใน Console ให้คลิกลิงก์ใน Error เพื่อสร้าง Index ใน Firebase
        const q = query(
            collection(db, 'projects'),
            where('userId', '==', user.uid),
            orderBy('updatedAt', 'desc')
        );

        // 3. ใช้ onSnapshot เพื่อฟังการเปลี่ยนแปลงแบบ Real-time
        const unsubscribe = onSnapshot(q,
            (querySnapshot) => {
                const list = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProjects(list);
                setLoading(false);
                setError(null);
            },
            (err) => {
                console.error("Firestore Error:", err);
                setError(err.message);
                setLoading(false);
            }
        );

        // Clean up เมื่อปิดหน้า
        return () => unsubscribe();
    }, [user]);

    const handleNewProject = () => {
        resetProject();
        navigate('/builder');
    };

    return (
        <div className="min-h-screen bg-[#FCFCFC] p-8 lg:p-12 font-sans">
            <div className="max-w-5xl mx-auto">

                {/* Hero Section */}
                <div className="bg-white rounded-3xl p-10 border border-zinc-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                    <div className="max-w-lg">
                        <h1 className="text-4xl font-extrabold text-zinc-800 tracking-tight mb-4">
                            สร้าง Mock Data <br />
                            <span className="text-[#A3B18A]">ได้ง่ายกว่าที่เคย</span>
                        </h1>
                        <p className="text-zinc-500 text-lg mb-8 leading-relaxed">
                            ออกแบบโครงสร้าง JSON ใส่ข้อมูลจำนวนมาก และส่งออกเพื่อนำไปทดสอบ API ของคุณในไม่กี่คลิก
                        </p>
                        <button
                            onClick={handleNewProject}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-800 text-white rounded-xl hover:bg-zinc-700 transition shadow-lg shadow-zinc-200/50 font-medium group"
                        >
                            <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            เริ่มต้นโปรเจกต์ใหม่
                        </button>
                    </div>
                    <div className="hidden md:block">
                        <DataGraphic className="w-64 h-64 drop-shadow-sm" />
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-6 px-2">
                    <CodeXml size={20} className="text-zinc-400" />
                    <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">ประวัติการทำงานของคุณ</h2>
                </div>

                {/* ส่วนแสดง Error (ถ้ามี) */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600">
                        <AlertCircle size={20} className="shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-sm">เกิดข้อผิดพลาดในการดึงข้อมูล</p>
                            <p className="text-xs opacity-80">{error}</p>
                            <p className="text-xs mt-2 underline cursor-help">คำแนะนำ: กด F12 ดูใน Console หากพบลิงก์ให้สร้าง Index ให้กดที่ลิงก์นั้นครับ</p>
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-zinc-50 animate-pulse rounded-2xl border border-zinc-100"></div>)}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="bg-white border border-dashed border-zinc-200 rounded-3xl p-16 text-center flex flex-col items-center justify-center">
                        <EmptyBoxGraphic className="w-32 h-32 mb-4 opacity-80" />
                        <h3 className="text-xl font-semibold text-zinc-700 mb-2">ยังไม่มีประวัติการสร้าง</h3>
                        <p className="text-zinc-400 max-w-sm mx-auto">เริ่มสร้างโปรเจกต์แรกของคุณได้เลย</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                onClick={() => {
                                    loadProject(project.id, project);
                                    navigate('/builder');
                                }}
                                className="group bg-white border border-zinc-200 p-6 rounded-2xl hover:border-[#A3B18A] hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between h-48"
                            >
                                <div>
                                    <h3 className="font-bold text-zinc-800 text-lg mb-2 truncate group-hover:text-[#A3B18A] transition-colors">{project.name}</h3>
                                    <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono bg-zinc-50 w-max px-2 py-1 rounded">
                                        <Clock size={12} />
                                        <span>อัปเดต: {project.updatedAt?.toDate().toLocaleDateString('th-TH')}</span>
                                    </div>
                                </div>
                                <div className="mt-6 flex items-center justify-between text-sm font-medium text-zinc-400 group-hover:text-zinc-800 transition-colors">
                                    <span>แก้ไขโครงสร้าง</span>
                                    <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center group-hover:bg-[#A3B18A] group-hover:text-white transition-colors">
                                        <ArrowRight size={14} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}