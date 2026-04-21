import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Home, Users, Calendar, GraduationCap, UserCheck, Contact, User, Menu, X, ChevronRight } from 'lucide-react';
import { openAttendance } from '../native/attendanceLauncher';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userAuid');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Dashboard', icon: Home },
        { path: '/mentor-allocation', label: 'Mentor Allocation', icon: Users },
        { path: '/student-list', label: 'Student List', icon: GraduationCap },
        { path: '/timetable', label: 'Time Table', icon: Calendar },
        { label: 'Attendance', icon: UserCheck, action: openAttendance },
        { path: '/faculty', label: 'Faculty', icon: Contact },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || isMobileMenuOpen
                    ? 'bg-white/80 backdrop-blur-md shadow-lg border-b border-slate-200/50'
                    : 'bg-transparent border-b border-transparent'
                }`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="relative">
                                <div className="absolute inset-0 bg-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                <img src="/logo.png" alt="Acharya Logo" className="h-10 w-auto relative z-10 transform group-hover:scale-105 transition-transform" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 tracking-tight">
                                    AIML Portal
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Student Dashboard</span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <div className="hidden lg:flex items-center space-x-1 bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50 backdrop-blur-sm">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.path && location.pathname === item.path;
                                const className = `flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive
                                    ? 'bg-white text-indigo-600 shadow-md font-bold transform scale-105'
                                    : 'text-slate-500 hover:text-slate-900 hover:bg-white/50 font-medium'
                                    }`;
                                const content = (
                                    <>
                                        <Icon size={18} className={isActive ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                                        <span className="text-sm">{item.label}</span>
                                    </>
                                );

                                if (item.action) {
                                    return (
                                        <button key={item.label} type="button" onClick={item.action} className={className}>
                                            {content}
                                        </button>
                                    );
                                }

                                return (
                                    <Link key={item.path} to={item.path} className={className}>
                                        {content}
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="flex items-center space-x-4">
                            {/* Desktop Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors font-bold text-sm group"
                            >
                                <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                <span>Logout</span>
                            </button>

                            {/* Mobile Menu Toggle */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="lg:hidden p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                            >
                                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Dropdown Menu */}
                {isMobileMenuOpen && (
                    <div className="lg:hidden absolute top-20 left-0 right-0 bg-white border-b border-slate-200 shadow-xl animate-slideDown">
                        <div className="px-4 py-6 space-y-2 max-h-[80vh] overflow-y-auto">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = item.path && location.pathname === item.path;
                                const className = `flex items-center justify-between w-full px-5 py-4 rounded-2xl transition-all ${isActive
                                    ? 'bg-indigo-50 text-indigo-600 font-bold border border-indigo-100'
                                    : 'text-slate-600 hover:bg-slate-50 font-medium border border-transparent'
                                    }`;
                                const content = (
                                    <>
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl ${isActive ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                                                <Icon size={20} />
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                        {isActive && <ChevronRight size={18} />}
                                    </>
                                );

                                if (item.action) {
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => {
                                                setIsMobileMenuOpen(false);
                                                item.action();
                                            }}
                                            className={className}
                                        >
                                            {content}
                                        </button>
                                    );
                                }

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={className}
                                    >
                                        {content}
                                    </Link>
                                );
                            })}
                            <div className="pt-4 mt-4 border-t border-slate-100">
                                <button
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleLogout();
                                    }}
                                    className="flex items-center justify-center w-full gap-2 px-5 py-4 rounded-2xl bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors"
                                >
                                    <LogOut size={20} />
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main Content Spacer for Fixed Navbar */}
            <div className="h-24"></div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-6rem)]">
                {children}
            </main>
        </div>
    );
};

export default Layout;
