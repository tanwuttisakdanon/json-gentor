import { useState, useMemo } from 'react';
import { useJsonStore, type JsonNode } from '../store/jsonStore';
import { Database, Copy, Check, Code, ListTree, TableProperties } from 'lucide-react';
import JsonViewer from '../components/JsonViewer'; // นำเข้า Tree View ที่เพิ่งสร้าง

export default function DataEntry() {
    const { nodes, bulkData, setBulkData } = useJsonStore();
    const [copied, setCopied] = useState(false);

    // เพิ่ม State สำหรับจัดการ Tab (json, tree, table)
    const [activeTab, setActiveTab] = useState<'json' | 'tree' | 'table'>('json');

    const getLeafNodes = (nodeList: JsonNode[], currentPath = ''): { id: string; path: string; type: string; key: string }[] => {
        let leaves: any[] = [];
        nodeList.forEach(node => {
            const nodeName = node.id === 'root-id' ? '' : node.key;
            const path = currentPath ? (nodeName ? `${currentPath}.${nodeName}` : currentPath) : nodeName;

            if (['string', 'number', 'boolean'].includes(node.type)) {
                leaves.push({ id: node.id, path: path || node.key, type: node.type, key: node.key });
            } else if (node.children) {
                leaves = [...leaves, ...getLeafNodes(node.children, path)];
            }
        });
        return leaves;
    };

    const leafNodes = useMemo(() => getLeafNodes(nodes), [nodes]);

    const generatedData = useMemo(() => {
        let maxLines = 1;
        const parsedData: Record<string, any[]> = {};

        Object.keys(bulkData).forEach(id => {
            const lines = bulkData[id].split('\n').map(line => line.trim());
            maxLines = Math.max(maxLines, lines.length);
            parsedData[id] = lines;
        });

        const result = [];
        for (let i = 0; i < maxLines; i++) {
            const buildObject = (nodeList: JsonNode[]): any => {
                const obj: any = {};
                nodeList.forEach(node => {
                    if (node.id === 'root-id' && node.children) return Object.assign(obj, buildObject(node.children));
                    if (['string', 'number', 'boolean'].includes(node.type)) {
                        let val = parsedData[node.id]?.[i] || "";
                        if (node.type === 'number') val = Number(val) || 0;
                        if (node.type === 'boolean') val = val.toLowerCase() === 'true';
                        obj[node.key] = val;
                    } else if (node.type === 'object' && node.children) {
                        obj[node.key] = buildObject(node.children);
                    } else if (node.type === 'array' && node.children) {
                        obj[node.key] = [buildObject(node.children)];
                    }
                });
                return obj;
            };

            if (Object.keys(parsedData).length > 0) result.push(buildObject(nodes));
        }
        return result;
    }, [nodes, bulkData]);

    const jsonString = JSON.stringify(generatedData, null, 2);
    const isEmpty = generatedData.length === 0;

    const handleCopy = () => {
        navigator.clipboard.writeText(jsonString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
                    <Database size={24} />
                    ใส่ข้อมูล (Bulk Data Entry)
                </h1>
                <p className="text-zinc-500 text-sm mt-1">Copy ข้อมูลจาก Excel/CSV มาวาง (Paste) ในกล่องแต่ละ Field ได้เลย</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* ฝั่งซ้าย: กล่องรับข้อมูล (เหมือนเดิม) */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-zinc-800 mb-6">วางข้อมูลตาม Field</h2>
                    {leafNodes.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                            ยังไม่มี Field ให้ใส่ข้อมูล กรุณากลับไปสร้างที่หน้าโครงสร้าง JSON
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leafNodes.map(field => (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-mono font-semibold text-zinc-600">
                                        <span className="text-zinc-400 font-normal">Path:</span> {field.path}
                                    </label>
                                    <textarea
                                        value={bulkData[field.id] || ''}
                                        onChange={(e) => setBulkData({ ...bulkData, [field.id]: e.target.value })}
                                        placeholder={`บรรทัด 1\nบรรทัด 2...`}
                                        className="w-full h-24 p-3 text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-500 transition resize-y"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ฝั่งขวา: Live Data Preview แบบ Multiple Views */}
                <div className="bg-[#1E1E20] rounded-xl shadow-sm sticky top-8 border border-zinc-800 flex flex-col overflow-hidden h-[700px]">

                    {/* Header & Tabs */}
                    <div className="flex items-center justify-between border-b border-zinc-800 bg-[#18181A] px-2 py-2">
                        <div className="flex gap-1">
                            <button onClick={() => setActiveTab('json')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
                                <Code size={14} /> Raw JSON
                            </button>
                            <button onClick={() => setActiveTab('tree')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'tree' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
                                <ListTree size={14} /> Tree View
                            </button>
                            <button onClick={() => setActiveTab('table')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}>
                                <TableProperties size={14} /> Table View
                            </button>
                        </div>
                        <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs px-3 py-1.5 mr-1 bg-zinc-800 rounded-md">
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-4 flex-1 overflow-auto scrollbar-hide">
                        {isEmpty ? (
                            <div className="text-zinc-500 text-sm h-full flex items-center justify-center">รอข้อมูล...</div>
                        ) : (
                            <>
                                {/* 1. Raw JSON View */}
                                {activeTab === 'json' && (
                                    <pre className="text-[13px] leading-relaxed text-[#A3B18A] font-mono">
                                        {jsonString}
                                    </pre>
                                )}

                                {/* 2. Tree View */}
                                {activeTab === 'tree' && (
                                    <div className="text-zinc-300">
                                        <JsonViewer data={generatedData} name="root_array" />
                                    </div>
                                )}

                                {/* 3. Table View (Flatten พื้นฐาน) */}
                                {activeTab === 'table' && (
                                    <div className="overflow-x-auto pb-4">
                                        <table className="w-full text-left text-sm text-zinc-300 border-collapse">
                                            <thead className="text-xs uppercase bg-zinc-800 text-zinc-400">
                                                <tr>
                                                    <th className="px-4 py-2 border-b border-zinc-700">#</th>
                                                    {leafNodes.map(col => (
                                                        <th key={col.id} className="px-4 py-2 border-b border-zinc-700">{col.key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {generatedData.map((_, index) => (
                                                    <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                                        <td className="px-4 py-2 text-zinc-500">{index + 1}</td>
                                                        {leafNodes.map(col => {
                                                            // ดึงข้อมูลแบบง่ายๆ มาแสดงในตาราง (ถ้าซ้อนลึกอาจจะต้องเขียน function วิ่งหา path)
                                                            const cellValue = bulkData[col.id]?.split('\n')[index] || "-";
                                                            return (
                                                                <td key={col.id} className="px-4 py-2 text-zinc-300">
                                                                    {cellValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}