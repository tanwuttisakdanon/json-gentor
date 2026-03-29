import { useJsonStore } from '../store/jsonStore';
import JsonNodeItem from '../components/JsonNodeItem';
import { generateJsonSkeleton, parseJsonToNodes } from '../utils/jsonParser';
import { Copy, Check, Save, Upload } from 'lucide-react';
import { useState, useRef } from 'react';

export default function Builder() {
    // 1. ดึง importNodes ออกมาจาก Store
    const { nodes, addNode, projectName, setProjectName, saveProject, importNodes } = useJsonStore();
    const [copied, setCopied] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // 2. สร้าง Reference สำหรับซ่อน Input Upload File
    const fileInputRef = useRef<HTMLInputElement>(null);

    const jsonSkeleton = generateJsonSkeleton(nodes);
    const jsonString = JSON.stringify(jsonSkeleton, null, 2);

    const handleSave = async () => {
        setIsSaving(true);
        await saveProject();
        setIsSaving(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // 3. ฟังก์ชันจัดการเมื่อผู้ใช้เลือกไฟล์ .json เสร็จ
    const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            // แปลง Text ในไฟล์กลับเป็นโครงสร้าง Node
            const importedNodes = parseJsonToNodes(content);

            if (importedNodes) {
                importNodes(importedNodes);
                alert("Import โครงสร้างเรียบร้อยแล้ว!");
            } else {
                alert("ไฟล์ JSON ไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง");
            }
            // ล้างค่า input ให้เลือกไฟล์เดิมซ้ำได้ในรอบหน้า
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <input
                        type="text"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="text-2xl font-bold text-zinc-800 bg-transparent border-b border-dashed border-zinc-300 focus:border-zinc-800 focus:outline-none mb-1 w-full md:w-auto min-w-[300px]"
                        placeholder="ตั้งชื่อโปรเจกต์..."
                    />
                    <p className="text-zinc-500 text-sm">กำหนดโครงสร้าง JSON ของคุณ</p>
                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition disabled:opacity-50 shadow-sm whitespace-nowrap"
                >
                    <Save size={18} />
                    {isSaving ? 'กำลังบันทึก...' : 'บันทึกโปรเจกต์'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* กล่องซ้าย: ตัวสร้างโครงสร้าง */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                            ตัวสร้างโครงสร้าง
                        </h2>

                        {/* 4. แก้ไขส่วนปุ่มให้มีทั้ง Import และ เพิ่ม Field หลัก */}
                        <div className="flex gap-2">
                            <input
                                type="file"
                                accept=".json"
                                ref={fileInputRef}
                                onChange={handleImportFile}
                                className="hidden"
                            />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-zinc-200 text-zinc-600 text-xs font-medium rounded-md hover:bg-zinc-50 hover:border-zinc-300 transition"
                                title="นำเข้าไฟล์ .json"
                            >
                                <Upload size={14} /> Import JSON
                            </button>
                            <button
                                onClick={() => addNode('root-id')}
                                className="px-3 py-1.5 bg-zinc-100 text-zinc-700 text-xs font-medium rounded-md hover:bg-zinc-200 transition"
                            >
                                + เพิ่ม Field หลัก
                            </button>
                        </div>
                    </div>

                    <div className="bg-white">
                        {nodes.map(node => (
                            <JsonNodeItem key={node.id} node={node} />
                        ))}
                    </div>
                </div>

                {/* กล่องขวา: Live Preview */}
                <div className="bg-zinc-900 rounded-xl p-6 shadow-sm sticky top-8 border border-zinc-800">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                            Live JSON Preview
                        </h2>
                        <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs bg-zinc-800 px-2 py-1 rounded">
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