import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Box, Settings, LogOut, Menu, X } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
    const [role, setRole] = React.useState<'admin' | 'karyawan' | null>(null);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Read role from Session Storage (set by RoleSelector)
                const sessionRole = sessionStorage.getItem(`userRole_${user.uid}`) as 'admin' | 'karyawan' | null;

                if (!sessionRole) {
                    // If no role in session, force user to pick one
                    navigate('/role-selection');
                    return;
                }

                setRole(sessionRole);

                // Path Protection: Redirect karyawan if accessing restricted paths
                if (sessionRole === 'karyawan') {
                    if (location.pathname === '/dashboard' || location.pathname === '/dashboard/knowledge' || location.pathname === '/dashboard/settings') {
                        navigate('/dashboard/chat');
                    }
                }
            } else {
                navigate('/login');
            }
        });
        return () => unsubscribe();
    }, [location.pathname, navigate]);

    const handleLogout = async () => {
        await auth.signOut();
        navigate('/login');
    };

    const allMenuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', roles: ['admin'] },
        { icon: MessageSquare, label: 'Chat SOP Expert', path: '/dashboard/chat', roles: ['admin', 'karyawan'] },
        { icon: Box, label: 'SOP & Knowledge', path: '/dashboard/knowledge', roles: ['admin'] },
        { icon: Settings, label: 'Pengaturan', path: '/dashboard/settings', roles: ['admin'] },
    ];

    const menuItems = allMenuItems.filter(item => role && item.roles.includes(role));

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
                className={`fixed inset-y-0 left-0 z-50 lg:relative lg:block transition-all duration-300 ease-in-out bg-[#061E29] border-r border-neutral-800/50 flex flex-col ${isMobileMenuOpen
                    ? 'translate-x-0 w-64 shadow-2xl'
                    : '-translate-x-full lg:translate-x-0 ' + (isSidebarOpen ? 'lg:w-72' : 'lg:w-20')
                    }`}
            >
                <div className={`p-4 flex items-center border-b border-neutral-900 h-16 ${isSidebarOpen || isMobileMenuOpen ? 'justify-between' : 'justify-center'}`}>
                    {(isSidebarOpen || isMobileMenuOpen) && (
                        <Link to="/dashboard" className="flex items-center">
                            <img src="/logo_sidebar.png" alt="Logo" className="h-8 transition-all duration-300" />
                        </Link>
                    )}
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
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-neutral-50/50 relative">
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-neutral-200/60 flex items-center justify-between px-4 lg:px-8 shrink-0 sticky top-0 z-30 transition-all">
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
