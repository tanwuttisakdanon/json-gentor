import { Link } from 'react-router-dom';

export default function Builder() {
    return (
        <div className="min-h-screen bg-white p-8 font-sans">
            <h1 className="text-2xl font-bold text-zinc-800 mb-4">JSON Structure Builder</h1>
            <p className="text-zinc-500 mb-8">หน้านี้เดี๋ยวเราจะมาทำระบบสร้าง Field ซ้อนกันครับ</p>
            <Link to="/" className="text-zinc-400 hover:text-zinc-800 transition">
                &larr; กลับหน้าแรก
            </Link>
        </div>
    );
}