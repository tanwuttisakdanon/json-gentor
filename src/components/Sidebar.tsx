import { NavLink } from 'react-router-dom';
import { Home, FileJson, Database, Download } from 'lucide-react';

export default function Sidebar() {
    // รายการเมนูทั้งหมดของเรา
    const menus = [
        { name: 'หน้าแรก', path: '/', icon: <Home size={20} /> },
        { name: 'โครงสร้าง JSON', path: '/builder', icon: <FileJson size={20} /> },
        // 2 เมนูด้านล่างนี้เตรียมไว้สำหรับ Phase ต่อไปครับ
        { name: 'ใส่ข้อมูล', path: '/data', icon: <Database size={20} /> },
        { name: 'ส่งออก', path: '/export', icon: <Download size={20} /> },
    ];

    return (
        <div className="w-64 border-r border-zinc-200 bg-zinc-50 flex flex-col h-screen p-6 shrink-0">
            {/* โลโก้แอป */}
            <div className="text-xl font-bold text-zinc-800 mb-10 flex items-center gap-3">
                <div className="w-8 h-8 bg-zinc-800 rounded-md flex items-center justify-center text-white shadow-sm">
                    <FileJson size={18} />
                </div>
                JSON Gentor
            </div>

            {/* รายการเมนู */}
            <nav className="flex flex-col gap-2">
                {menus.map((menu) => (
                    <NavLink
                        key={menu.name}
                        to={menu.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 ${isActive
                                ? 'bg-zinc-200/60 text-zinc-900 font-medium'
                                : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                            }`
                        }
                    >
                        {menu.icon}
                        {menu.name}
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}