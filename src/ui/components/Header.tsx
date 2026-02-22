import React from 'react';
import { Minus, Square, X, Bell, User } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export const Header: React.FC = () => {
    const location = useLocation();

    // Context-aware title
    const getPageTitle = (pathname: string) => {
        switch (pathname) {
            case '/': return 'Dashboard Główny';
            case '/inventory': return 'Magazyn Centralny';
            case '/finance': return 'Finanse i Księgowość';
            case '/projects': return 'Zarządzanie Projektami';
            case '/clients': return 'Baza Kontrahentów';
            default: return 'PRODECO ERP';
        }
    };

    const handleMinimize = () => window.electron.minimize();
    const handleMaximize = () => window.electron.maximize();
    const handleClose = () => window.electron.close();

    return (
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 select-none relative [-webkit-app-region:drag]">
            {/* Left: Page Title (Relative z-10 checks clickability if needed, but usually title doesn't need click) */}
            <div className="relative z-10 flex items-center gap-4 pointer-events-none">
                <h2 className="text-lg font-semibold text-slate-100 tracking-wide">
                    {getPageTitle(location.pathname)}
                </h2>
            </div>

            {/* Right: Actions & Window Controls */}
            <div className="relative z-10 flex items-center gap-4 [-webkit-app-region:no-drag]">
                {/* User Actions */}
                <div className="flex items-center gap-3 border-r border-slate-700 pr-4 mr-2">
                    <button
                        aria-label="Powiadomienia" title="Powiadomienia"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <Bell className="w-5 h-5 pointer-events-none" />
                    </button>
                    <div
                        title="Profil Użytkownika"
                        className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30"
                    >
                        <User className="w-4 h-4 pointer-events-none" />
                    </div>
                </div>

                {/* Window Controls */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={handleMinimize}
                        aria-label="Minimalizuj" title="Minimalizuj"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors [-webkit-app-region:no-drag]"
                    >
                        <Minus className="w-5 h-5 pointer-events-none" />
                    </button>
                    <button
                        onClick={handleMaximize}
                        aria-label="Maksymalizuj / Przywróć" title="Maksymalizuj / Przywróć"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors [-webkit-app-region:no-drag]"
                    >
                        <Square className="w-4 h-4 pointer-events-none" />
                    </button>
                    <button
                        onClick={handleClose}
                        aria-label="Zamknij" title="Zamknij"
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors [-webkit-app-region:no-drag]"
                    >
                        <X className="w-5 h-5 pointer-events-none" />
                    </button>
                </div>
            </div>
        </header>
    );
};
