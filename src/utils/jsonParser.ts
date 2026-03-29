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