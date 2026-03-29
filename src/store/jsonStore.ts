import { create } from 'zustand';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { arrayMove } from '@dnd-kit/sortable'; // นำเข้าตัวช่วยสลับ Array

export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array';

export interface JsonNode {
    id: string;
    key: string;
    type: DataType;
    mockType?: string; // เพิ่มตัวนี้เพื่อบอกว่าจะสุ่มข้อมูลแบบไหน
    children?: JsonNode[];
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    photoURL: string | null;
}

// โครงสร้าง Project สำหรับแสดงผลในหน้า List
export interface ProjectHeader {
    id: string;
    name: string;
    updatedAt: any;
}

interface JsonState {
    nodes: JsonNode[];
    bulkData: Record<string, string>;
    user: UserProfile | null;
    currentProjectId: string | null; // เก็บว่าตอนนี้เราเปิดโปรเจกต์ไหนอยู่
    projectName: string;


    // Actions
    addNode: (parentId: string | null) => void;
    updateNode: (id: string, updates: Partial<JsonNode>) => void;
    removeNode: (id: string) => void;
    setBulkData: (data: Record<string, string>) => void;
    setUser: (user: UserProfile | null) => void;
    setProjectName: (name: string) => void;

    // Firebase Actions
    saveProject: () => Promise<void>;
    loadProject: (id: string, data: any) => void;
    resetProject: () => void;

    importNodes: (nodes: JsonNode[]) => void;

    reorderNodes: (parentId: string, oldIndex: number, newIndex: number) => void;

}

// ... (addTree, updateTree, removeTree เหมือนเดิม) ...
const generateId = () => Math.random().toString(36).substring(2, 9);

const reorderTree = (nodes: JsonNode[], parentId: string, oldIndex: number, newIndex: number): JsonNode[] => {
    if (parentId === 'root-id') {
        return arrayMove(nodes, oldIndex, newIndex);
    }
    return nodes.map(node => {
        if (node.id === parentId && node.children) {
            return { ...node, children: arrayMove(node.children, oldIndex, newIndex) };
        }
        if (node.children) {
            return { ...node, children: reorderTree(node.children, parentId, oldIndex, newIndex) };
        }
        return node;
    });
};

export const useJsonStore = create<JsonState>((set, get) => ({
    nodes: [{ id: 'root-id', key: 'root', type: 'object', children: [] }],
    bulkData: {},
    user: null,
    currentProjectId: null,
    projectName: "Untitled Project",

    addNode: (parentId) => set((state) => {
        const newNode: JsonNode = { id: generateId(), key: 'newField', type: 'string' };
        if (!parentId) return { nodes: [...state.nodes, newNode] };
        return { nodes: addTree(state.nodes, parentId, newNode) };
    }),

    updateNode: (id, updates) => set((state) => ({ nodes: updateTree(state.nodes, id, updates) })),
    removeNode: (id) => set((state) => ({ nodes: removeTree(state.nodes, id) })),
    setBulkData: (data) => set({ bulkData: data }),
    setUser: (user) => set({ user }),
    setProjectName: (name) => set({ projectName: name }),

    resetProject: () => set({
        nodes: [{ id: 'root-id', key: 'root', type: 'object', children: [] }],
        bulkData: {},
        currentProjectId: null,
        projectName: "Untitled Project"
    }),

    loadProject: (id, data) => set({
        currentProjectId: id,
        projectName: data.name,
        nodes: data.nodes,
        bulkData: data.bulkData
    }),

    // ฟังก์ชันพระเอก: บันทึกลง Firestore
    saveProject: async () => {
        const { user, projectName, nodes, bulkData, currentProjectId } = get();
        if (!user) return;

        const projectData = {
            name: projectName,
            nodes,
            bulkData,
            userId: user.uid,
            updatedAt: serverTimestamp()
        };

        try {
            if (currentProjectId) {
                // ถ้ามี id อยู่แล้ว ให้ Update
                await updateDoc(doc(db, 'projects', currentProjectId), projectData);
            } else {
                // ถ้าเป็นโปรเจกต์ใหม่ ให้ Create
                const docRef = await addDoc(collection(db, 'projects'), projectData);
                set({ currentProjectId: docRef.id });
            }
            alert("บันทึกสำเร็จ!");
        } catch (e) {
            console.error(e);
            alert("บันทึกไม่สำเร็จ");
        }
    },

    importNodes: (nodes) => set({ nodes }),

    reorderNodes: (parentId, oldIndex, newIndex) => set((state) => ({
        nodes: reorderTree(state.nodes, parentId, oldIndex, newIndex)
    }))
}));

// Helper functions (addTree, updateTree, removeTree) ต้องอยู่ท้ายไฟล์เหมือนเดิม
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