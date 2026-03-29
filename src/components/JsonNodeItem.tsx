import { useState } from 'react';
import { Trash2, Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useJsonStore, type JsonNode, type DataType } from '../store/jsonStore';

interface Props {
    node: JsonNode;
    depth?: number; // ความลึกของชั้น (ใช้สำหรับทำย่อหน้า)
}

const dataTypes: DataType[] = ['string', 'number', 'boolean', 'object', 'array'];

export default function JsonNodeItem({ node, depth = 0 }: Props) {
    const { updateNode, removeNode, addNode } = useJsonStore();
    const [isExpanded, setIsExpanded] = useState(true);

    // เช็คว่า Field นี้สามารถมีลูกย่อยได้ไหม
    const isComplex = node.type === 'object' || node.type === 'array';
    const isRoot = node.id === 'root-id';

    return (
        <div className="flex flex-col mb-1 font-mono text-sm">
            <div
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-zinc-100 transition-colors group ${isRoot ? 'bg-zinc-50' : ''}`}
            >
                {/* เว้นช่องว่างตามความลึก (Indentation) */}
                <div style={{ width: depth * 24 }} className="shrink-0" />

                {/* ปุ่มลูกศร พับ/กาง */}
                {isComplex ? (
                    <button onClick={() => setIsExpanded(!isExpanded)} className="text-zinc-400 hover:text-zinc-800">
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                ) : (
                    <div className="w-4 h-4" /> // พื้นที่ว่างเปล่าๆ ให้ตรงกันถ้าไม่มีลูกศร
                )}

                {/* ช่องกรอกชื่อ Key */}
                <input
                    type="text"
                    value={node.key}
                    onChange={(e) => updateNode(node.id, { key: e.target.value })}
                    disabled={isRoot}
                    className={`bg-transparent border-b border-transparent hover:border-zinc-300 focus:border-zinc-800 focus:outline-none px-1 py-0.5 w-32 ${isRoot ? 'font-bold text-zinc-800' : 'text-zinc-700'}`}
                    placeholder="field_name"
                />

                <span className="text-zinc-400">:</span>

                {/* Dropdown เลือกประเภทข้อมูล */}
                <select
                    value={node.type}
                    onChange={(e) => updateNode(node.id, { type: e.target.value as DataType })}
                    className="bg-white border border-zinc-200 rounded px-1.5 py-1 text-zinc-600 focus:outline-none focus:border-zinc-400"
                >
                    {dataTypes.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>

                {/* กลุ่มปุ่ม Action (จะโผล่มาตอนเอาเมาส์ชี้) */}
                <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-auto gap-1">
                    {isComplex && (
                        <button
                            onClick={() => {
                                setIsExpanded(true);
                                addNode(node.id); // สั่งเพิ่มลูก
                            }}
                            className="p-1 text-zinc-400 hover:text-green-600 bg-white rounded border border-zinc-200 shadow-sm"
                            title="เพิ่ม Field ย่อย"
                        >
                            <Plus size={14} />
                        </button>
                    )}

                    {!isRoot && (
                        <button
                            onClick={() => removeNode(node.id)}
                            className="p-1 text-zinc-400 hover:text-red-500 bg-white rounded border border-zinc-200 shadow-sm"
                            title="ลบ Field"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* ถ้าเป็น Object/Array และถูกกางอยู่ ให้ Render ลูกๆ ของมันด้วย (Recursive) */}
            {isComplex && isExpanded && node.children && node.children.length > 0 && (
                <div className="flex flex-col relative">
                    {/* เส้นไกด์ไลน์แนวตั้ง (เส้นประ) */}
                    <div
                        className="absolute left-0 top-0 bottom-0 border-l border-dashed border-zinc-200"
                        style={{ marginLeft: (depth * 24) + 16 }}
                    />
                    {node.children.map(child => (
                        <JsonNodeItem key={child.id} node={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
}