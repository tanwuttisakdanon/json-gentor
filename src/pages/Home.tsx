import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center font-sans">
            <h1 className="text-4xl font-bold text-zinc-800 mb-4">JSON Gentor</h1>
            <p className="text-zinc-500 mb-8">เครื่องมือสร้าง Mock Data สไตล์มินิมอล</p>
            <Link
                to="/builder"
                className="px-6 py-2 bg-zinc-800 text-white rounded-md hover:bg-zinc-700 transition"
            >
                เริ่มสร้าง JSON
            </Link>
        </div>
    );
}