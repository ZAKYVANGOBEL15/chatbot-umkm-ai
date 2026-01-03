import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Box, Settings, LogOut, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: MessageSquare, label: 'Chat Simulator', path: '/dashboard/chat' },
        { icon: Box, label: 'AI Knowledge Base', path: '/dashboard/knowledge' }, // Professional rebranding
        { icon: Settings, label: 'Pengaturan', path: '/dashboard/settings' },
    ];

    return (
        <div className="flex h-screen bg-white overflow-hidden text-neutral-900 font-sans selection:bg-[#061E29] selection:text-white">
            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-all duration-300 bg-[#061E29] border-r border-neutral-800 flex flex-col ${isMobileMenuOpen
                    ? 'translate-x-0 w-64'
                    : '-translate-x-full lg:translate-x-0 ' + (isSidebarOpen ? 'lg:w-64' : 'lg:w-20')
                    }`}
            >
                <div className="p-4 flex items-center justify-between h-16 border-b border-neutral-900">
                    <Link to="/dashboard" className="flex items-center">
                        <img src="/logo_sidebar.png" alt="Logo" className={`transition-all duration-300 ${isSidebarOpen || isMobileMenuOpen ? 'h-8' : 'h-6 mx-auto'}`} />
                    </Link>
                    <button
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setIsMobileMenuOpen(false);
                            } else {
                                setIsSidebarOpen(!isSidebarOpen);
                            }
                        }}
                        className="p-1.5 hover:bg-neutral-900 rounded-lg text-neutral-400 hover:text-white transition-colors"
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${location.pathname === item.path
                                ? 'bg-white text-[#061E29] font-medium shadow-lg'
                                : 'text-neutral-400 hover:bg-neutral-900 hover:text-white'
                                }`}
                        >
                            <item.icon size={20} className={location.pathname === item.path ? "text-[#061E29]" : ""} />
                            {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-neutral-900">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-neutral-400 hover:bg-neutral-900 hover:text-red-400 w-full transition-colors ${(!isSidebarOpen && !isMobileMenuOpen) && 'justify-center'
                            }`}
                    >
                        <LogOut size={20} />
                        {(isSidebarOpen || isMobileMenuOpen) && <span className="font-medium text-sm">Keluar Portal</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-50">
                <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg text-neutral-600"
                            onClick={() => setIsMobileMenuOpen(true)}
                        >
                            <Menu size={20} />
                        </button>
                        <h1 className="text-lg lg:text-xl font-bold text-[#061E29] tracking-tight truncate">
                            {menuItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
                        </h1>
                    </div>
                </header>
                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
