import React, { useEffect, useState, useMemo } from 'react';
import { ProjectForm } from '../modules/projects/ProjectForm';
import { ResizableTh } from '../components/ResizableTh';
import { Plus, X, Search } from 'lucide-react';
import { Project } from '../../api/api';

export const Projects: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchProjects = async () => {
        try {
            const data = await window.electron.projects.getAll();
            setProjects(data);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [refreshKey]);

    const filteredProjects = useMemo(() => {
        return projects.filter(p =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.clientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [projects, searchTerm]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-1 rounded text-xs font-semibold">W trakcie</span>;
            case 'COMPLETED': return <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-1 rounded text-xs font-semibold">Zakończony</span>;
            case 'PLANNING': return <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-1 rounded text-xs font-semibold">Planowanie</span>;
            default: return <span className="bg-slate-500/20 text-slate-400 border border-slate-500/30 px-2 py-1 rounded text-xs font-semibold">{status}</span>;
        }
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                        Projekty
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzanie realizacjami i kosztorysami projektów</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nowy Projekt
                </button>
            </div>

            {/* Omni-Search Toolbar */}
            <div className="mb-6">
                <div className="relative w-full max-w-md">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Szukaj projektu lub klienta..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex flex-col h-full">
                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                        <table className="min-w-max w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
                                <tr>
                                    <ResizableTh tableId="projects" columnId="date" initialWidth={120} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Data</ResizableTh>
                                    <ResizableTh tableId="projects" columnId="name" initialWidth={300} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Nazwa Projektu</ResizableTh>
                                    <ResizableTh tableId="projects" columnId="client" initialWidth={250} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Klient</ResizableTh>
                                    <ResizableTh tableId="projects" columnId="status" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Status</ResizableTh>
                                    <ResizableTh tableId="projects" columnId="cost" initialWidth={180} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-right">Koszt Materiałów</ResizableTh>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filteredProjects.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                                            {searchTerm ? 'Brak projektów pasujących do wyszukiwania.' : 'Brak aktywnych projektów.'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProjects.map((project) => (
                                        <tr key={project.id} className="hover:bg-slate-800/30 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-indigo-500">
                                            <td className="px-6 py-4 text-slate-500 font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 font-medium text-white group-hover:text-blue-400 transition-colors font-semibold overflow-hidden text-ellipsis whitespace-nowrap" title={project.name}>
                                                {project.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap" title={project.clientName}>
                                                {project.clientName}
                                            </td>
                                            <td className="px-6 py-4 overflow-hidden text-ellipsis whitespace-nowrap">
                                                {getStatusBadge(project.status)}
                                            </td>
                                            <td className="px-6 py-4 text-right overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded">
                                                    {formatCurrency(project.totalMaterialCost)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Optional Footer/Summary */}
                    <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-end">
                        Liczba projektów: {filteredProjects.length}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 [-webkit-app-region:no-drag]">
                    <div className="bg-slate-900 rounded-2xl w-full max-w-5xl shadow-2xl border border-slate-700 relative animate-in fade-in zoom-in duration-200 mt-8 mb-8 max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors z-10"
                            title="Zamknij"
                        >
                            <X className="w-8 h-8" />
                        </button>
                        <div className="overflow-y-auto w-full flex-1 rounded-2xl rounded-tr-none">
                            <ProjectForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
