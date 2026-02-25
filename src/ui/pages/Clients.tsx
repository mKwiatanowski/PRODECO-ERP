import React, { useEffect, useState, useMemo } from 'react';
import { ClientForm } from '../modules/clients/ClientForm';
import { ResizableTh } from '../components/ResizableTh';
import { Plus, X, Building, User, Search } from 'lucide-react';

import { Client } from '../../api/api';

export const Clients: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'ALL' | 'CUSTOMER' | 'SUPPLIER'>('ALL');
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchClients = async () => {
        try {
            const data = await window.electron.clients.getAll();
            setClients(data);
        } catch (error) {
            console.error("Failed to fetch clients", error);
        }
    };

    useEffect(() => {
        fetchClients();
    }, [refreshKey]);

    const filteredClients = useMemo(() => {
        return clients.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (c.nip && c.nip.includes(searchTerm)) ||
                (c.phone && c.phone.includes(searchTerm));

            const matchesTab = activeTab === 'ALL' || c.type === activeTab;

            return matchesSearch && matchesTab;
        });
    }, [clients, searchTerm, activeTab]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setEditingClient(null);
        setRefreshKey(prev => prev + 1);
    };

    const handleOpenModal = (client?: Client) => {
        setEditingClient(client || null);
        setIsModalOpen(true);
    };

    const getTypeBadge = (type: string) => {
        if (type === 'CUSTOMER') {
            return (
                <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase">
                    <User className="w-3 h-3" />
                    Klient / Odbiorca
                </span>
            );
        }
        if (type === 'SUPPLIER') {
            return (
                <span className="inline-flex items-center gap-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide uppercase">
                    <Building className="w-3 h-3" />
                    Dostawca
                </span>
            );
        }
        return <span className="text-slate-500 text-xs uppercase">{type}</span>;
    };

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                        Klienci i Kontrahenci
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzanie bazą odbiorców i dostawców</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj Klienta
                </button>
            </div>

            {/* Filters Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="flex space-x-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 shadow-inner">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                        WSZYSCY
                    </button>
                    <button
                        onClick={() => setActiveTab('CUSTOMER')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'CUSTOMER' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                        ODBIORCY
                    </button>
                    <button
                        onClick={() => setActiveTab('SUPPLIER')}
                        className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${activeTab === 'SUPPLIER' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                    >
                        DOSTAWCY
                    </button>
                </div>
                <div className="relative w-full sm:w-80">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Szukaj po nazwie, NIP lub telefonie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600"
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                        <table className="min-w-max w-full text-left border-collapse table-fixed">
                            <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
                                <tr>
                                    <ResizableTh tableId="clients" columnId="clientNumber" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Nr Klienta</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="name" initialWidth={250} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Nazwa / Firma</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="type" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Typ</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="nip" initialWidth={120} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">NIP</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="phone" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Kontakt</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="address" initialWidth={200} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Adres</ResizableTh>
                                    <ResizableTh tableId="clients" columnId="status" initialWidth={100} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-center">Status</ResizableTh>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/40">
                                {filteredClients.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-20 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <UsersIcon className="w-12 h-12 mb-4 text-slate-700" />
                                                <p className="text-lg font-medium text-slate-400 mb-1">{searchTerm ? 'Brak dopasowań.' : 'Brak klientów w bazie.'}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client.id}
                                            onDoubleClick={() => handleOpenModal(client)}
                                            className={`transition-colors group cursor-pointer border-l-2 border-transparent hover:border-indigo-500 ${!client.isActive ? 'bg-slate-900/20 opacity-60' : 'hover:bg-slate-800/30'}`}
                                        >
                                            <td className="px-6 py-4 font-mono text-indigo-400 text-xs font-bold overflow-hidden text-ellipsis whitespace-nowrap">
                                                {client.clientNumber || '-'}
                                            </td>
                                            <td className={`px-6 py-4 font-bold transition-colors overflow-hidden text-ellipsis whitespace-nowrap ${!client.isActive ? 'text-slate-500 line-through' : 'text-slate-100 group-hover:text-indigo-400'}`}>
                                                {client.name}
                                            </td>
                                            <td className="px-6 py-4 overflow-hidden text-ellipsis whitespace-nowrap">
                                                {getTypeBadge(client.type)}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-400 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                {client.nip || '-'}
                                            </td>
                                            <td className="px-6 py-4 font-mono text-slate-400 text-xs overflow-hidden text-ellipsis whitespace-nowrap">
                                                {client.phone || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap" title={client.address}>
                                                {client.address || '-'}
                                            </td>
                                            <td className="px-6 py-4 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                                                <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${client.isActive ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'}`}>
                                                    {client.isActive ? 'Aktywny' : 'Brak Opcji'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Minimal Footer */}
                    <div className="bg-slate-900 border-t border-slate-800 px-6 py-3 flex justify-between items-center z-10">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Baza CRM Prodeco</span>
                        <span className="text-xs text-slate-400 font-medium bg-slate-950/50 px-3 py-1 rounded-full border border-slate-800">
                            Łącznie: {filteredClients.length}
                        </span>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 [-webkit-app-region:no-drag]">
                    <div className="bg-slate-950 rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-800 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
                        <button
                            onClick={() => handleSuccess()} // Zamknij przez handle success symulację anulowania z resetem
                            className="absolute right-4 top-4 text-slate-500 hover:text-white transition-colors z-10 bg-slate-900/50 hover:bg-slate-800 p-2 rounded-full"
                            title="Zamknij"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <div className="overflow-y-auto w-full flex-1 rounded-2xl">
                            <ClientForm initialData={editingClient} onSuccess={handleSuccess} onCancel={handleSuccess} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Helper Icon
const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
