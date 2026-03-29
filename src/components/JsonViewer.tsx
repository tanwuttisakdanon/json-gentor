import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Props {
    data: any;
    name?: string;
}

export default function JsonViewer({ data, name = "root" }: Props) {
    const [isOpen, setIsOpen] = useState(true);

    // เช็คว่าข้อมูลเป็น Object หรือ Array ไหม
    const isObject = data !== null && typeof data === 'object';
    const isArray = Array.isArray(data);

    // ถ้าเป็นข้อมูลธรรมดา (String, Number, Boolean) ให้แสดงค่าเลย
    if (!isObject) {
        return (
            <div className="flex gap-2 font-mono text-[13px] py-0.5 hover:bg-zinc-800/50 px-1 rounded w-max">
                <span className="text-zinc-400">{name}:</span>
                <span className={typeof data === 'string' ? 'text-green-400' : 'text-blue-400'}>
                    {typeof data === 'string' ? `"${data}"` : String(data)}
                </span>
            </div>
        );
    }

    // ถ้าเป็น Object หรือ Array ให้แสดงแบบพับ/กางได้
    return (
        <div className="font-mono text-[13px]">
            <div
                className="flex items-center gap-1 cursor-pointer hover:bg-zinc-800/50 py-0.5 rounded px-1 w-max transition-colors"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
                <span className="text-zinc-300 font-medium">{name}</span>
                <span className="text-zinc-500 text-xs ml-1">
                    {isArray ? `Array(${data.length})` : 'Object'}
                </span>
            </div>

            {/* ถ้ากางอยู่ ให้ Render ลูกๆ ข้างใน */}
            {isOpen && (
                <div className="ml-4 pl-2 border-l border-zinc-700/50">
                    {Object.keys(data).map((key) => (
                        <JsonViewer key={key} name={key} data={data[key as keyof typeof data]} />
                    ))}
                </div>
            )}
        </div>
    );
}