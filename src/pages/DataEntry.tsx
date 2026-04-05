import { useState, useMemo } from 'react';
import { useJsonStore, type JsonNode } from '../store/jsonStore';
import { Database, Copy, Check, Code, ListTree, TableProperties, Wand2 } from 'lucide-react';
import JsonViewer from '../components/JsonViewer';
import { faker } from '@faker-js/faker';

export default function DataEntry() {
    const { nodes, bulkData, setBulkData } = useJsonStore();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'json' | 'tree' | 'table'>('json');

    // ตัวแปรสำหรับจำนวนบรรทัดที่ต้องการสุ่ม
    const [mockRowCount, setMockRowCount] = useState(10);

    const getLeafNodes = (nodeList: JsonNode[], currentPath = ''): { id: string; path: string; type: string; key: string; mockType?: string }[] => {
        let leaves: any[] = [];
        nodeList.forEach(node => {
            const nodeName = node.id === 'root-id' ? '' : node.key;
            const path = currentPath ? (nodeName ? `${currentPath}.${nodeName}` : currentPath) : nodeName;

            if (['string', 'number', 'boolean'].includes(node.type)) {
                leaves.push({ id: node.id, path: path || node.key, type: node.type, key: node.key, mockType: node.mockType });
            } else if (node.children) {
                leaves = [...leaves, ...getLeafNodes(node.children, path)];
            }
        });
        return leaves;
    };

    const leafNodes = useMemo(() => getLeafNodes(nodes), [nodes]);

    // ฟังก์ชันพระเอก: เสกข้อมูลด้วย Faker.js
    const handleGenerateMockData = () => {
        const newData = { ...bulkData };
        let hasMockableFields = false;

        leafNodes.forEach(field => {
            if (!field.mockType) return; // ถ้าไม่ได้ตั้งค่าสุ่มไว้ ให้ข้ามไป (ให้พิมพ์เอง)

            hasMockableFields = true;
            const samples = [];

            for (let i = 0; i < mockRowCount; i++) {
                if (field.mockType === 'fullName') samples.push(faker.person.fullName());
                else if (field.mockType === 'email') samples.push(faker.internet.email().toLowerCase());
                else if (field.mockType === 'phone') samples.push(faker.phone.number());
                else if (field.mockType === 'uuid') samples.push(faker.string.uuid());
                else if (field.mockType === 'city') samples.push(faker.location.city());
                else if (field.mockType === 'word') samples.push(faker.word.sample());
                else if (field.mockType === 'number_int') samples.push(faker.number.int({ min: 1, max: 1000 }).toString());
                else if (field.mockType === 'price') samples.push(faker.commerce.price());
            }

            // เอาข้อมูลที่สุ่มได้มาต่อกันด้วยการขึ้นบรรทัดใหม่
            newData[field.id] = samples.join('\n');
        });

        if (hasMockableFields) {
            setBulkData(newData);
        } else {
            alert("ไม่พบ Field ที่ตั้งค่าให้สุ่มข้อมูล กรุณากลับไปหน้า 'โครงสร้าง JSON' แล้วเลือกประเภทการสุ่ม (เช่น ชื่อ, อีเมล) ก่อนครับ");
        }
    };

    // --- แทนที่ generatedData ตัวเดิมด้วยโค้ดชุดนี้ ---
    const generatedData = useMemo(() => {
        // 1. ค้นหาว่ามี Array ตัวไหนถูกติ๊กเป็น Bulk Array ไหม
        const findBulkNode = (nodeList: JsonNode[]): JsonNode | null => {
            for (const n of nodeList) {
                if (n.isBulkArray) return n;
                if (n.children) {
                    const found = findBulkNode(n.children);
                    if (found) return found;
                }
            }
            return null;
        };
        const bulkNode = findBulkNode(nodes);

        // 2. ฟังก์ชันประกอบร่างแบบ Recursive
        const buildNode = (nodeList: JsonNode[], loopIndex: number = 0): any => {
            const obj: any = {};
            nodeList.forEach(node => {
                // ข้าม root-id เพื่อไม่ให้มี key คำว่า root โผล่มา
                if (node.id === 'root-id' && node.children) {
                    return Object.assign(obj, buildNode(node.children, loopIndex));
                }

                if (['string', 'number', 'boolean'].includes(node.type)) {
                    const lines = bulkData[node.id]?.split('\n').map(l => l.trim()) || [];
                    // สำคัญ: ถ้ามีหลายบรรทัด ให้ใช้บรรทัดที่ loopIndex แต่ถ้ามีบรรทัดเดียว (เช่น company) ให้ใช้ซ้ำบรรทัดแรกตลอด
                    let valStr = lines.length > 1 ? lines[loopIndex] : lines[0];
                    if (valStr === undefined) valStr = "";

                    let finalVal: any = valStr;
                    if (node.type === 'number') finalVal = Number(valStr) || 0;
                    if (node.type === 'boolean') finalVal = valStr.toLowerCase() === 'true';

                    obj[node.key] = finalVal;
                }
                else if (node.type === 'object' && node.children) {
                    obj[node.key] = buildNode(node.children, loopIndex);
                }
                else if (node.type === 'array' && node.children) {
                    if (node.isBulkArray) {
                        // ถ้าใช่ Bulk Array ให้หาว่าลูกๆ มันมีข้อมูล Paste มากี่บรรทัด
                        let maxL = 1;
                        const getLeafIds = (nList: JsonNode[]): string[] => {
                            let ids: string[] = [];
                            nList.forEach(n => {
                                if (['string', 'number', 'boolean'].includes(n.type)) ids.push(n.id);
                                else if (n.children) ids = [...ids, ...getLeafIds(n.children)];
                            });
                            return ids;
                        };
                        const leafIds = getLeafIds(node.children);
                        leafIds.forEach(id => {
                            const lines = bulkData[id]?.split('\n').map(l => l.trim()) || [];
                            if (lines.length > maxL) maxL = lines.length;
                        });

                        // สร้าง Array ตามจำนวนบรรทัด
                        const arr = [];
                        for (let i = 0; i < maxL; i++) {
                            arr.push(buildNode(node.children, i));
                        }
                        obj[node.key] = arr;
                    } else {
                        // ถ้าเป็น Array ปกติ ให้สร้างแค่ 1 ชิ้น
                        obj[node.key] = [buildNode(node.children, loopIndex)];
                    }
                }
            });
            return obj;
        };

        // 3. ตัดสินใจว่าจะ Output ออกมาเป็น Object เดียว หรือ Array
        if (bulkNode) {
            // ถ้ามีการระบุ Bulk Array ผลลัพธ์ต้องเป็น Object ก้อนเดียวที่ครอบทุกอย่าง
            return buildNode(nodes, 0);
        } else {
            // โหมดปกติ (ไม่ได้ติ๊ก): วนลูปที่ Root เลย
            let globalMax = 1;
            Object.values(bulkData).forEach(val => {
                const lines = val.split('\n');
                if (lines.length > globalMax) globalMax = lines.length;
            });
            const result = [];
            if (Object.keys(bulkData).length > 0) {
                for (let i = 0; i < globalMax; i++) {
                    result.push(buildNode(nodes, i));
                }
            }
            return result;
        }
    }, [nodes, bulkData]);

    // เนื่องจากผลลัพธ์อาจเป็นก้อน Object เดี่ยวๆ (ไม่ใช่อาร์เรย์) เราต้องเช็คให้ Table View รันได้
    const tableData = Array.isArray(generatedData) ? generatedData : [generatedData];
    const jsonString = JSON.stringify(generatedData, null, 2);
    const isEmpty = Array.isArray(generatedData) ? generatedData.length === 0 : Object.keys(generatedData).length === 0;
    // -----------------------------------------------------------


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
                <p className="text-zinc-500 text-sm mt-1">Copy ข้อมูลมาวาง หรือใช้ระบบสุ่มข้อมูลอัตโนมัติ (Auto-Mock Data)</p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">

                {/* ฝั่งซ้าย: กล่องรับข้อมูล */}
                <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">

                    {/* แผงควบคุม Auto-Mock */}
                    <div className="mb-6 pb-6 border-b border-zinc-100 flex items-end justify-between gap-4 bg-[#F4F5F1] p-4 rounded-lg">
                        <div>
                            <label className="block text-xs font-bold text-zinc-600 mb-1.5 uppercase tracking-wider">ระบบสุ่มข้อมูลอัตโนมัติ</label>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-500">สร้างข้อมูลจำนวน</span>
                                <input
                                    type="number"
                                    min="1" max="1000"
                                    value={mockRowCount}
                                    onChange={(e) => setMockRowCount(Number(e.target.value))}
                                    className="w-20 px-2 py-1 border border-zinc-300 rounded text-sm focus:outline-none focus:border-[#A3B18A]"
                                />
                                <span className="text-sm text-zinc-500">บรรทัด</span>
                            </div>
                        </div>
                        <button
                            onClick={handleGenerateMockData}
                            className="flex items-center gap-2 px-4 py-2 bg-[#A3B18A] text-white rounded-md hover:bg-[#8D9A77] transition shadow-sm font-medium text-sm"
                        >
                            <Wand2 size={16} />
                            เสกข้อมูล!
                        </button>
                    </div>

                    <h2 className="text-sm font-semibold text-zinc-800 mb-6">วางข้อมูลตาม Field</h2>
                    {leafNodes.length === 0 ? (
                        <div className="text-center py-10 text-zinc-400 bg-zinc-50 rounded-lg border border-dashed border-zinc-200">
                            ยังไม่มี Field ให้ใส่ข้อมูล กรุณากลับไปสร้างที่หน้าโครงสร้าง JSON
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {leafNodes.map(field => (
                                <div key={field.id} className="flex flex-col gap-1.5">
                                    <label className="text-xs font-mono font-semibold text-zinc-600 flex justify-between">
                                        <span><span className="text-zinc-400 font-normal">Path:</span> {field.path}</span>
                                        {field.mockType && (
                                            <span className="text-[#A3B18A] flex items-center gap-1"><Wand2 size={10} /> สุ่มเป็น {field.mockType}</span>
                                        )}
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

                {/* ฝั่งขวา: Live Data Preview แบบ Multiple Views (โค้ดเดิม) */}
                <div className="bg-[#1E1E20] rounded-xl shadow-sm sticky top-8 border border-zinc-800 flex flex-col overflow-hidden h-[700px]">
                    <div className="flex items-center justify-between border-b border-zinc-800 bg-[#18181A] px-2 py-2">
                        <div className="flex gap-1">
                            <button onClick={() => setActiveTab('json')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'json' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}><Code size={14} /> Raw JSON</button>
                            <button onClick={() => setActiveTab('tree')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'tree' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}><ListTree size={14} /> Tree View</button>
                            <button onClick={() => setActiveTab('table')} className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition ${activeTab === 'table' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'}`}><TableProperties size={14} /> Table View</button>
                        </div>
                        <button onClick={handleCopy} className="text-zinc-400 hover:text-white transition flex items-center gap-1.5 text-xs px-3 py-1.5 mr-1 bg-zinc-800 rounded-md">
                            {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                    </div>

                    <div className="p-4 flex-1 overflow-auto scrollbar-hide">
                        {isEmpty ? (
                            <div className="text-zinc-500 text-sm h-full flex items-center justify-center">รอข้อมูล...</div>
                        ) : (
                            <>
                                {activeTab === 'json' && <pre className="text-[13px] leading-relaxed text-[#A3B18A] font-mono">{jsonString}</pre>}
                                {activeTab === 'tree' && <div className="text-zinc-300"><JsonViewer data={generatedData} name="root_array" /></div>}
                                {activeTab === 'table' && (
                                    <div className="overflow-x-auto pb-4">
                                        <table className="w-full text-left text-sm text-zinc-300 border-collapse">
                                            <thead className="text-xs uppercase bg-zinc-800 text-zinc-400">
                                                <tr>
                                                    <th className="px-4 py-2 border-b border-zinc-700">#</th>
                                                    {leafNodes.map(col => <th key={col.id} className="px-4 py-2 border-b border-zinc-700">{col.key}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tableData.map((_, index) => (
                                                    <tr key={index} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                                                        <td className="px-4 py-2 text-zinc-500">{index + 1}</td>
                                                        {leafNodes.map(col => (
                                                            <td key={col.id} className="px-4 py-2 text-zinc-300">{bulkData[col.id]?.split('\n')[index] || "-"}</td>
                                                        ))}
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