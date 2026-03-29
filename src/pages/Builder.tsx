import { useJsonStore } from '../store/jsonStore';
import JsonNodeItem from '../components/JsonNodeItem';
import { generateJsonSkeleton } from '../utils/jsonParser';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function Builder() {
    const { nodes, addNode } = useJsonStore();
    const [copied, setCopied] = useState(false);

    // นำ Store มาแปลงเป็น JSON จริง
    const jsonSkeleton = generateJsonSkeleton(nodes);
    // แปลงจาก Object เป็นตัวหนังสือจัดหน้าสวยๆ
    const jsonString = JSON.stringify(jsonSkeleton, null, 2);

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-800">โครงสร้าง JSON (Structure)</h1>
                    <p className="text-zinc-500 text-sm mt-1">กำหนดตัวแปรและประเภทข้อมูลได้ตามต้องการ รองรับการซ้อนทับ (Nested)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* ฝั่งซ้าย: เครื่องมือสร้าง */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            ตัวสร้างโครงสร้าง
                        </h2>
                        <button
                            onClick={() => addNode('root-id')}
                            className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-md hover:bg-zinc-200 transition"
                        >
                            + เพิ่ม Field หลัก
                        </button>
                    </div>

                    <div className="bg-white">
                        {nodes.map(node => (
                            <JsonNodeItem key={node.id} node={node} />
                        ))}
                    </div>
                </div>

                {/* ฝั่งขวา: Live JSON Preview */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-sm sticky top-8 border border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            Live JSON Preview
                        </h2>
                        <button
                            onClick={handleCopy}
                            className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs bg-zinc-800 px-2 py-1 rounded"
                        >
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            {copied ? 'คัดลอกแล้ว' : 'คัดลอก'}
                        </button>
                    </div>
                    <pre className="text-[13px] leading-relaxed text-[#A3B18A] overflow-auto max-h-[600px] font-mono scrollbar-hide">
                        {jsonString}
                    </pre>
                </div>

            </div>
        </div>
    );
}