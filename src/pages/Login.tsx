import { auth, provider } from '../firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { FileJson } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        try {
            await signInWithPopup(auth, provider);
            navigate('/'); // Login เสร็จให้เด้งไปหน้าแรก
        } catch (error) {
            console.error("Login Failed", error);
            alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-zinc-200 max-w-sm w-full text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-xl flex items-center justify-center text-white mx-auto mb-6 shadow-sm">
                    <FileJson size={32} />
                </div>
                <h1 className="text-2xl font-bold text-zinc-800 mb-2">JSON Gentor</h1>
                <p className="text-zinc-500 mb-8 text-sm">เข้าสู่ระบบเพื่อบันทึกและจัดการโปรเจกต์ของคุณ</p>

                <button
                    onClick={handleGoogleLogin}
                    className="w-full py-3 px-4 bg-white border border-zinc-300 rounded-lg text-zinc-700 font-medium hover:bg-zinc-50 hover:border-zinc-400 transition flex items-center justify-center gap-3 shadow-sm"
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    ดำเนินการต่อด้วย Google
                </button>
            </div>
        </div>
    );
}