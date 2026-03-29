import { create } from 'zustand';

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface JsonNode {
    id: string;
    key: string;
    type: DataType;
    children?: JsonNode[];
}

interface JsonState {
    nodes: JsonNode[];
    bulkData: Record<string, string>; // เพิ่มตัวเก็บข้อมูลที่ Paste
    addNode: (parentId: string | null) => void;
    updateNode: (id: string, updates: Partial<JsonNode>) => void;
    removeNode: (id: string) => void;
    setBulkData: (data: Record<string, string>) => void; // เพิ่มฟังก์ชันอัปเดตข้อมูล
}

const addTree = (nodes: JsonNode[], parentId: string, newNode: JsonNode): JsonNode[] => {
    return nodes.map(node => {
        if (node.id === parentId) return { ...node, children: [...(node.children || []), newNode] };
        if (node.children) return { ...node, children: addTree(node.children, parentId, newNode) };
        return node;
    });
};

const updateTree = (nodes: JsonNode[], id: string, updates: Partial<JsonNode>): JsonNode[] => {
    return nodes.map(node => {
        if (node.id === id) return { ...node, ...updates };
        if (node.children) return { ...node, children: updateTree(node.children, id, updates) };
        return node;
    });
};

const removeTree = (nodes: JsonNode[], id: string): JsonNode[] => {
    return nodes.filter(node => node.id !== id).map(node => {
        if (node.children) return { ...node, children: removeTree(node.children, id) };
        return node;
    });
};

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useJsonStore = create<JsonState>((set) => ({
    nodes: [{ id: 'root-id', key: 'root', type: 'object', children: [] }],
    bulkData: {}, // ข้อมูลเริ่มต้นเป็น Object เปล่าๆ

    addNode: (parentId) => set((state) => {
        const newNode: JsonNode = { id: generateId(), key: 'newField', type: 'string' };
        if (!parentId) return { nodes: [...state.nodes, newNode] };
        return { nodes: addTree(state.nodes, parentId, newNode) };
    }),

    updateNode: (id, updates) => set((state) => ({ nodes: updateTree(state.nodes, id, updates) })),

    removeNode: (id) => set((state) => ({ nodes: removeTree(state.nodes, id) })),

    // Action ใหม่สำหรับบันทึกข้อมูลที่ Paste
    setBulkData: (data) => set({ bulkData: data })
}));