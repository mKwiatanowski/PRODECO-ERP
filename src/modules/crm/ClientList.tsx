import React, { useState, useEffect } from 'react';
import { Search, Plus, Building2, Mail, Globe, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { Client } from '../../api/api';
import { ClientForm } from './ClientForm';

export const ClientList: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadClients = async () => {
        setIsLoading(true);
        try {
            const data = await window.electron.clients.getAll();
            setClients(data);
        } catch (error) {
            console.error("Failed to load clients", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    const handleSave = async (clientData: Partial<Client>) => {
        try {
            if (selectedClient) {
                await window.electron.clients.update({ ...clientData, id: selectedClient.id } as Client & { id: string });
            } else {
                await window.electron.clients.create(clientData);
            }
            await loadClients();
            setIsFormOpen(false);
            setSelectedClient(null);
        } catch (error) {
            console.error("Failed to save client", error);
            alert("Błąd podczas zapisywania kontrahenta.");
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Czy na pewno chcesz usunąć tego kontrahenta?")) {
            try {
                await window.electron.clients.deleteClient(id);
                await loadClients();
            } catch (error) {
                console.error("Failed to delete client", error);
            }
        }
    };

    const filteredClients = clients.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nip.includes(searchTerm)
    );

    return (
        <div className="flex flex-col h-full bg-slate-950 text-slate-100 p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                        <Building2 className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter text-white">BAZA KONTRAHENTÓW</h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Moduł CRM & Master Data</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Szukaj po nazwie lub NIP..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-900/50 border border-slate-800 rounded-2xl pl-12 pr-6 py-3.5 text-sm w-full md:w-80 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setSelectedClient(null);
                            setIsFormOpen(true);
                        }}
                        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group"
                    >
                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                        Dodaj Kontrahenta
                    </button>
                </div>
            </div>

            {/* Stats / Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Wszyscy klienci</p>
                    <p className="text-3xl font-black text-indigo-400">{clients.length}</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Firmy (B2B)</p>
                    <p className="text-3xl font-black text-emerald-400">{clients.filter(c => c.type === 'FIRMA').length}</p>
                </div>
                <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Osoby fizyczne</p>
                    <p className="text-3xl font-black text-amber-400">{clients.filter(c => c.type === 'OSOBA_FIZYCZNA').length}</p>
                </div>
            </div>

            {/* Table Area */}
            <div className="flex-1 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl backdrop-blur-md">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/80 sticky top-0 z-10">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Kontrahent</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Identyfikacja</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Kontakt & Adres</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Typ</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Wczytywanie bazy...</p>
                                    </td>
                                </tr>
                            ) : filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500">
                                        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-10" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Nie znaleziono kontrahentów</p>
                                    </td>
                                </tr>
                            ) : filteredClients.map((client) => (
                                <tr key={client.id} className="group hover:bg-slate-800/30 transition-all duration-300">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-xl border ${client.type === 'FIRMA' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                                                {client.type === 'FIRMA' ? <Building2 className="w-5 h-5" /> : <MoreVertical className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <div className="font-black text-sm text-white group-hover:text-indigo-400 transition-colors uppercase">{client.name}</div>
                                                <div className="text-[10px] text-slate-500 font-bold tracking-widest mt-1">ID: {client.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black text-slate-600 uppercase">NIP:</span>
                                                <span className="text-xs font-bold text-slate-300 font-mono tracking-wider">{client.nip}</span>
                                            </div>
                                            {client.regon && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-600 uppercase">REG:</span>
                                                    <span className="text-xs font-bold text-slate-400 font-mono tracking-wider">{client.regon}</span>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                                                <Mail className="w-3 h-3 text-indigo-500" /> {client.email}
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                <Globe className="w-3 h-3" /> {client.city}, {client.street}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${client.type === 'FIRMA' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                            {client.type === 'FIRMA' ? 'B2B - Firma' : 'B2C - Prywatny'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => {
                                                    setSelectedClient(client);
                                                    setIsFormOpen(true);
                                                }}
                                                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all shadow-lg"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(client.id)}
                                                className="p-2.5 bg-slate-800 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-lg"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer Info */}
                <div className="px-8 py-4 bg-slate-900 border-t border-slate-800/50 flex justify-between items-center">
                    <p className="text-[10px] text-slate-600 font-bold tracking-widest uppercase">Wyświetlanie {filteredClients.length} z {clients.length} kontrahentów</p>
                    <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                        <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                    </div>
                </div>
            </div>

            <ClientForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                initialData={selectedClient}
            />
        </div>
    );
};
