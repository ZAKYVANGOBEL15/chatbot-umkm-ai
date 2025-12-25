import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Box, Settings, LogOut, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: MessageSquare, label: 'Chat Simulator', path: '/dashboard/chat' },
        { icon: Box, label: 'Produk & Knowledge', path: '/dashboard/knowledge' },
        { icon: Settings, label: 'Pengaturan', path: '/dashboard/settings' },
    ];

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-64' : 'w-20'
                    } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
            >
                <div className="p-4 flex items-center justify-between h-16 border-b border-gray-100">
                    {isSidebarOpen ? (
                        <span className="font-bold text-xl text-blue-600">Chatbot AI</span>
                    ) : (
                        <span className="font-bold text-xl text-blue-600 mx-auto">AI</span>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${location.pathname === item.path
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span className="font-medium">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors ${!isSidebarOpen && 'justify-center'
                            }`}
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium">Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
                    <h1 className="text-xl font-semibold text-gray-800">
                        {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* User profile placeholder */}
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                            U
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
