import { useMemo } from 'react';
import { useJsonStore, type JsonNode } from '../store/jsonStore';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';

export default function Export() {
    const { nodes, bulkData } = useJsonStore();

    // 1. ดึงข้อมูล Field ทั้งหมด
    const getLeafNodes = (nodeList: JsonNode[], currentPath = ''): { id: string; key: string }[] => {
        let leaves: any[] = [];
        nodeList.forEach(node => {
            if (['string', 'number', 'boolean'].includes(node.type)) {
                leaves.push({ id: node.id, key: node.key });
            } else if (node.children) {
                leaves = [...leaves, ...getLeafNodes(node.children)];
            }
        });
        return leaves;
    };

    const leafNodes = useMemo(() => getLeafNodes(nodes), [nodes]);

    // 2. ฟังก์ชันประกอบร่าง JSON (ย่อมาจากหน้า DataEntry)
    const jsonString = useMemo(() => {
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
                    } else if (node.type === 'object' && node.children) obj[node.key] = buildObject(node.children);
                    else if (node.type === 'array' && node.children) obj[node.key] = [buildObject(node.children)];
                });
                return obj;
            };
            if (Object.keys(parsedData).length > 0) result.push(buildObject(nodes));
        }
        return JSON.stringify(result, null, 2);
    }, [nodes, bulkData]);

    // 3. ฟังก์ชันสร้างและดาวน์โหลดไฟล์
    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportJSON = () => {
        downloadFile(jsonString, 'mock_data.json', 'application/json');
    };

    const exportCSV = () => {
        // สร้าง Header
        const headers = leafNodes.map(n => n.key).join(',');

        // หาจำนวนบรรทัดสูงสุด
        let maxLines = 1;
        Object.keys(bulkData).forEach(id => {
            const lines = bulkData[id].split('\n');
            maxLines = Math.max(maxLines, lines.length);
        });

        // สร้างข้อมูลแต่ละแถว
        let csvContent = headers + '\n';
        for (let i = 0; i < maxLines; i++) {
            const row = leafNodes.map(n => {
                let val = bulkData[n.id]?.split('\n')[i] || '';
                if (val.includes(',')) return `"${val}"`; // ครอบ "" ถ้าข้อมูลมีลูกน้ำ
                return val;
            }).join(',');
            csvContent += row + '\n';
        }

        downloadFile(csvContent, 'mock_data.csv', 'text/csv;charset=utf-8;');
    };

    return (
        <div className="min-h-screen p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-zinc-800 flex items-center gap-2">
                    <Download size={24} />
                    ส่งออกข้อมูล (Export)
                </h1>
                <p className="text-zinc-500 text-sm mt-1">ดาวน์โหลดข้อมูลที่คุณสร้างไว้เพื่อนำไปใช้งานต่อ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">

                {/* กล่อง Export JSON */}
                <div className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm flex flex-col items-center text-center hover:border-zinc-400 transition">
                    <div className="w-16 h-16 bg-zinc-100 text-zinc-800 rounded-full flex items-center justify-center mb-4">
                        <FileJson size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-800 mb-2">Export JSON</h2>
                    <p className="text-zinc-500 text-sm mb-6">ส่งออกเป็นไฟล์ .json โครงสร้างครบถ้วน เหมาะสำหรับนำไปทดสอบ API ใน Postman</p>
                    <button
                        onClick={exportJSON}
                        className="w-full py-2.5 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition font-medium"
                    >
                        ดาวน์โหลด .json
                    </button>
                </div>

                {/* กล่อง Export CSV */}
                <div className="bg-white border border-zinc-200 p-8 rounded-xl shadow-sm flex flex-col items-center text-center hover:border-zinc-400 transition">
                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-4">
                        <FileSpreadsheet size={32} />
                    </div>
                    <h2 className="text-lg font-bold text-zinc-800 mb-2">Export CSV</h2>
                    <p className="text-zinc-500 text-sm mb-6">ส่งออกเป็นไฟล์ตาราง .csv เหมาะสำหรับนำไปเปิดดูใน Excel หรือนำเข้าฐานข้อมูล</p>
                    <button
                        onClick={exportCSV}
                        className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                    >
                        ดาวน์โหลด .csv
                    </button>
                </div>

            </div>
        </div>
    );
}