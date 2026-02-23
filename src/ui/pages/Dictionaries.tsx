import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BookMarked, Plus, Save, X, Hash, Tag, Scale, Briefcase } from 'lucide-react';
import { DictionaryItem } from '../../api/api';

const CATEGORY_LABELS: Record<string, { label: string, icon: React.ReactNode }> = {
    'UNIT': { label: 'Jednostki Miary', icon: <Scale className="w-5 h-5 text-emerald-400" /> },
    'MATERIAL_CATEGORY': { label: 'Kategorie Asortymentu', icon: <Tag className="w-5 h-5 text-emerald-400" /> },
    'SERVICE_TYPE': { label: 'Typy Usług', icon: <Briefcase className="w-5 h-5 text-emerald-400" /> },
    'TAX_RATE': { label: 'Stawki VAT', icon: <Hash className="w-5 h-5 text-emerald-400" /> },
};

export const Dictionaries: React.FC = () => {
    const [dictionaries, setDictionaries] = useState<Record<string, DictionaryItem[]>>({});
    const [activeTab, setActiveTab] = useState<string>('UNIT');
    const [isLoading, setIsLoading] = useState(true);

    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [newValue, setNewValue] = useState('');
    const [newCode, setNewCode] = useState('');

    const loadDictionaries = async () => {
        setIsLoading(true);
        try {
            const data = await window.electron.dictionaries.getAll();
            setDictionaries(data);
        } catch (error) {
            console.error("Failed to load dictionaries", error);
            toast.error("Błąd podczas ładowania słowników.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadDictionaries();
    }, []);

    const handleAddOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newValue.trim()) return;

        try {
            if (editId) {
                await window.electron.dictionaries.update({
                    id: editId,
                    value: newValue,
                    code: newCode || undefined
                });
                toast.success("Wartość zaktualizowana.");
            } else {
                await window.electron.dictionaries.add({
                    category: activeTab,
                    value: newValue,
                    code: newCode || undefined
                });
                toast.success("Wartość dodana do słownika.");
            }

            setNewValue('');
            setNewCode('');
            setIsAdding(false);
            setEditId(null);
            loadDictionaries(); // Refresh
        } catch (err: any) {
            toast.error(err.message || "Błąd podczas zapisywania.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Czy na pewno chcesz usunąć tę wartość?")) return;
        try {
            await window.electron.dictionaries.delete(id);
            toast.success("Słownik usunięty.");
            loadDictionaries();
        } catch (err: any) {
            toast.error(err.message || "Błąd podczas usuwania.");
        }
    };

    const handleEdit = (item: DictionaryItem) => {
        setIsAdding(true);
        setEditId(item.id);
        setNewValue(item.value);
        setNewCode(item.code || '');
    };


    const currentItems = dictionaries[activeTab] || [];

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <BookMarked className="w-8 h-8 text-emerald-500" /> Słowniki Systemowe
                    </h1>
                    <p className="text-slate-400 mt-1">Zarządzaj centralnymi wartościami (VAT, Jednostki, Kategorie)</p>
                </div>
                {!isAdding && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/25"
                    >
                        <Plus className="w-5 h-5" />
                        Nowa Wartość
                    </button>
                )}
            </div>

            <div className="flex flex-1 min-h-0 gap-6">
                {/* Sidebar Categories */}
                <div className="w-64 bg-slate-900 rounded-2xl border border-slate-800 p-4 flex flex-col gap-2">
                    <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">Kategorie Słowników</h3>
                    {Object.entries(CATEGORY_LABELS).map(([key, config]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setActiveTab(key);
                                setIsAdding(false);
                                setEditId(null);
                                setNewValue('');
                                setNewCode('');
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm font-medium ${activeTab === key
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'
                                }`}
                        >
                            {config.icon}
                            {config.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-white">
                            {CATEGORY_LABELS[activeTab]?.label || activeTab}
                        </h2>
                        <span className="text-sm font-medium text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
                            Skontrufikowano: {currentItems.length}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {isAdding && (
                            <form onSubmit={handleAddOrUpdate} className="mb-8 p-6 bg-slate-950 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
                                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-400" /> {editId ? 'Edytuj wartość' : `Dodaj do: ${CATEGORY_LABELS[activeTab]?.label}`}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Wartość (Wyświetlana)
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={newValue}
                                            onChange={(e) => setNewValue(e.target.value)}
                                            placeholder="np. 23%, szt., Usługi ziemne"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                            Kod (Opcjonalny)
                                        </label>
                                        <input
                                            type="text"
                                            value={newCode}
                                            onChange={(e) => setNewCode(e.target.value)}
                                            placeholder="np. 23, SZT, ZIEM"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all placeholder-slate-600"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsAdding(false);
                                            setEditId(null);
                                            setNewValue('');
                                            setNewCode('');
                                        }}
                                        className="px-5 py-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 font-medium"
                                    >
                                        <X className="w-4 h-4" /> Anuluj
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-2 font-medium shadow-lg hover:shadow-emerald-500/20"
                                    >
                                        <Save className="w-4 h-4" /> Zapisz
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {isLoading ? (
                                <div className="col-span-full py-12 text-center text-slate-500">Ładowanie słowników...</div>
                            ) : currentItems.length === 0 ? (
                                <div className="col-span-full py-12 text-center text-slate-500">Brak wartości dla tej kategorii.</div>
                            ) : (
                                currentItems.map(item => (
                                    <div key={item.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors flex justify-between items-start group">
                                        <div>
                                            <p className="text-white font-medium text-lg">{item.value}</p>
                                            {item.code && <p className="text-slate-500 font-mono text-xs mt-1">CODE: {item.code}</p>}
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {item.isSystem ? (
                                                <span className="px-2 py-1 bg-slate-800 text-slate-400 text-[10px] uppercase font-bold tracking-wider rounded border border-slate-700">
                                                    System
                                                </span>
                                            ) : (
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-emerald-400 text-xs font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">
                                                        Edytuj
                                                    </button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-400 text-xs font-semibold px-2 py-1 rounded bg-slate-800 hover:bg-slate-700">
                                                        Usuń
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
