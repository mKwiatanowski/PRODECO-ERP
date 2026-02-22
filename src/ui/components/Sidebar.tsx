import React from 'react';
import { LayoutDashboard, Warehouse, CircleDollarSign, FolderKanban, Users, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

export const Sidebar: React.FC = () => {
    const navItems = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/inventory', label: 'Magazyn', icon: Warehouse },
        { path: '/finance', label: 'Finanse', icon: CircleDollarSign },
        { path: '/projects', label: 'Projekty', icon: FolderKanban },
        { path: '/clients', label: 'Klienci', icon: Users }, // New CRM Module
    ];

    return (
        <aside className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 shadow-2xl z-20 font-sans [-webkit-app-region:no-drag]">
            {/* Header / Brand */}
            <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/20">
                    <span className="text-white font-bold text-lg leading-none">P</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight leading-none">PRODECO</h1>
                    <span className="text-[10px] font-medium text-emerald-500 uppercase tracking-widest">Enterprise ERP</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Menu Główne
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'} // Exact match for home/dashboard
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                                ? 'bg-emerald-500/10 text-emerald-400 font-medium shadow-none'
                                : 'hover:bg-slate-800/80 hover:text-slate-100 text-slate-400'
                            }`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-emerald-500 rounded-r-full" />
                                )}

                                <item.icon
                                    className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300 group-hover:scale-105'
                                        }`}
                                />
                                <span className="tracking-wide text-sm">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Footer / Settings */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <NavLink
                    to="/dictionaries"
                    className={({ isActive }) =>
                        `flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-colors group ${isActive ? 'bg-emerald-500/10 text-emerald-400 font-medium' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`
                    }
                >
                    <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span className="text-sm">Ustawienia & Słowniki</span>
                </NavLink>
                <div className="mt-4 px-2 flex justify-between items-center text-[10px] text-slate-600 font-mono">
                    <span>v0.1.0-alpha</span>
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-pulse" title="System Online"></div>
                </div>
            </div>
        </aside>
    );
};
