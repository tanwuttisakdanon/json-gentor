import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-white font-sans overflow-hidden text-zinc-800">
            {/* แถบเมนูด้านซ้าย */}
            <Sidebar />

            {/* พื้นที่เนื้อหาหลักด้านขวา */}
            <main className="flex-1 overflow-y-auto bg-white">
                <Outlet />
            </main>
        </div>
    );
}