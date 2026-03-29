import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight, Wand2 } from 'lucide-react';
import { useJsonStore, type JsonNode, type DataType } from '../store/jsonStore';


interface Props {
    node: JsonNode;
    depth?: number;
}

const dataTypes: DataType[] = ['string', 'number', 'boolean', 'object', 'array'];

// ตัวเลือกการสุ่มข้อมูลสำหรับ String และ Number
const stringMockTypes = [
    { value: '', label: 'ไม่สุ่ม (พิมพ์เอง)' },
    { value: 'fullName', label: 'ชื่อ-นามสกุล' },
    { value: 'email', label: 'อีเมล' },
    { value: 'phone', label: 'เบอร์โทร' },
    { value: 'uuid', label: 'UUID' },
    { value: 'city', label: 'ชื่อเมือง' },
    { value: 'word', label: 'คำศัพท์' }
];

const numberMockTypes = [
    { value: '', label: 'ไม่สุ่ม (พิมพ์เอง)' },
    { value: 'number_int', label: 'ตัวเลข (1-1000)' },
    { value: 'price', label: 'ราคา ($)' }
];

export default function JsonNodeItem({ node, depth = 0 }: Props) {
    const { updateNode, removeNode, addNode } = useJsonStore();
    const [isExpanded, setIsExpanded] = useState(true);

    const isComplex = node.type === 'object' || node.type === 'array';
    const isRoot = node.id === 'root-id';

    return (
        <div className="flex flex-col mb-1 font-mono text-sm">
            <div className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-100 transition-colors group ${isRoot ? 'bg-zinc-50' : ''}`}>

                <div style={{ width: depth * 24 }} className="shrink-0" />

                {isComplex ? (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-400 hover:text-zinc-800">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : <div className="w-4 h-4" />}

                <input
                    type="text"
                    value={node.key}
                    onChange={(e) => updateNode(node.id, { key: e.target.value })}
                    disabled={isRoot}
                    className={`bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-800 focus:outline-none px-1 py-0.5 w-32 ${isRoot ? 'font-bold text-zinc-800' : 'text-zinc-700'}`}
                    placeholder="field_name"
                />

                <span className="text-zinc-400">:</span>

                <select
                    value={node.type}
                    onChange={(e) => updateNode(node.id, { type: e.target.value as DataType, mockType: '' })}
                    className="bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-600 focus:outline-none focus:border-zinc-400"
                >
                    {dataTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                {/* ส่วนที่เพิ่มมาใหม่: Dropdown เลือกการสุ่มข้อมูล */}
                {!isComplex && !isRoot && (
                    <div className="flex items-center gap-1 ml-2 bg-zinc-50 border border-zinc-200 rounded px-1.5 py-1">
                        <Wand2 size={12} className="text-[#A3B18A]" />
                        <select
                            value={node.mockType || ''}
                            onChange={(e) => updateNode(node.id, { mockType: e.target.value })}
                            className="bg-transparent text-xs text-zinc-500 focus:outline-none cursor-pointer"
                        >
                            {node.type === 'string' && stringMockTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            {node.type === 'number' && numberMockTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            {node.type === 'boolean' && <option value="">พิมพ์เอง</option>}
                        </select>
                    </div>
                )}

                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto gap-1">
                    {isComplex && (
                        <button onClick={() => { setIsExpanded(true); addNode(node.id); }} className="p-1 text-zinc-400 hover:text-green-600 bg-white rounded border border-zinc-200 shadow-sm" title="เพิ่ม Field ย่อย">
                            <Plus size={14} />
                        </button>
                    )}
                    {!isRoot && (
                        <button onClick={() => removeNode(node.id)} className="p-1 text-zinc-400 hover:text-red-500 bg-white rounded border border-zinc-200 shadow-sm" title="ลบ Field">
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {isComplex && isExpanded && node.children && node.children.length > 0 && (
                <div className="flex flex-col relative">
                    <div className="absolute left-0 top-0 bottom-0 border-l border-dashed border-zinc-200" style={{ marginLeft: (depth * 24) + 16 }} />
                    {node.children.map(child => <JsonNodeItem key={child.id} node={child} depth={depth + 1} />)}
                </div>
            )}
        </div>
    );
}