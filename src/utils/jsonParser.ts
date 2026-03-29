import { type JsonNode } from '../store/jsonStore';

export const generateJsonSkeleton = (nodes: JsonNode[]) => {
    // 1. หาจุดเริ่มต้น (Root)
    const rootNode = nodes.find(n => n.id === 'root-id');
    if (!rootNode || !rootNode.children) return {};

    // 2. ฟังก์ชันแปลงข้อมูลตาม Type
    const parseNode = (node: JsonNode): any => {
        switch (node.type) {
            case 'string': return "string"; // หรือปล่อยว่าง "" ก็ได้
            case 'number': return 0;
            case 'boolean': return false;
            case 'object': {
                const obj: Record<string, any> = {};
                if (node.children) {
                    node.children.forEach(child => {
                        obj[child.key] = parseNode(child);
                    });
                }
                return obj;
            }
            case 'array': {
                // ถ้าเป็น Array เราจะเอาลูกๆ มามัดรวมกันเป็น Object 1 ก้อน เพื่อเป็นตัวแทน (Template) ของข้อมูลใน Array
                if (!node.children || node.children.length === 0) return [];
                const itemTemplate: Record<string, any> = {};
                node.children.forEach(child => {
                    itemTemplate[child.key] = parseNode(child);
                });
                return [itemTemplate];
            }
            default: return null;
        }
    };

    // 3. เริ่มประกอบร่างจากลูกๆ ของ Root ทั้งหมด
    const result: Record<string, any> = {};
    rootNode.children.forEach(child => {
        result[child.key] = parseNode(child);
    });



    return result;
};

// ฟังก์ชันสุ่ม ID
const generateId = () => Math.random().toString(36).substring(2, 9);

// ฟังก์ชันแปลง JSON String กลับเป็น Node Structure
export const parseJsonToNodes = (jsonString: string): JsonNode[] | null => {
    try {
        const parsedData = JSON.parse(jsonString);
        const rootNode: JsonNode = { id: 'root-id', key: 'root', type: 'object', children: [] };

        // ฟังก์ชัน Recursive แกะกล่องข้อมูล
        const traverse = (data: any): JsonNode[] => {
            if (typeof data !== 'object' || data === null) return [];

            return Object.keys(data).map(key => {
                const value = data[key];
                const id = generateId();

                if (Array.isArray(value)) {
                    // ถ้าเป็น Array ให้ดูลูกตัวแรกเป็นต้นแบบ
                    let children: JsonNode[] = [];
                    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                        children = traverse(value[0]);
                    }
                    return { id, key, type: 'array', children };
                }
                else if (typeof value === 'object' && value !== null) {
                    return { id, key, type: 'object', children: traverse(value) };
                }
                else {
                    // ข้อมูลธรรมดา
                    let type: any = 'string';
                    if (typeof value === 'number') type = 'number';
                    if (typeof value === 'boolean') type = 'boolean';
                    return { id, key, type };
                }
            });
        };

        rootNode.children = traverse(parsedData);
        return [rootNode];
    } catch (error) {
        console.error("Invalid JSON format", error);
        return null;
    }
};