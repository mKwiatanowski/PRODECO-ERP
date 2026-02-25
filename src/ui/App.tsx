// import React from 'react' - React 17+ JSX Transform doesn't need this

import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Inventory } from './pages/Inventory';
import { Projects } from './pages/Projects';
import { Clients } from './pages/Clients';
import { Dictionaries } from './pages/Dictionaries';
import { Settings } from './pages/Settings';
import { FinanceDashboard } from '../modules/finance/FinanceDashboard';

import { Header } from './components/Header';
import { Toaster } from 'react-hot-toast';

function App() {
    return (
        <Router>
            <Toaster position="top-right" toastOptions={{
                className: 'bg-slate-800 text-white border border-slate-700',
                style: {
                    background: '#1e293b',
                    color: '#fff',
                    border: '1px solid #334155',
                },
            }} />
            <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
                <div className="[-webkit-app-region:no-drag]">
                    <Sidebar />
                </div>
                <div className="flex-1 flex flex-col min-w-0 bg-slate-950">
                    <Header />
                    <main className="flex-1 overflow-hidden p-0 scroll-smooth custom-scrollbar [-webkit-app-region:no-drag]">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/inventory" element={<Inventory />} />
                            <Route path="/finance" element={<FinanceDashboard />} />
                            <Route path="/projects" element={<Projects />} />
                            <Route path="/clients" element={<Clients />} />
                            <Route path="/settings" element={<Settings />} />
                            <Route path="/dictionaries" element={<Dictionaries />} />
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App
