import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { BookMarked, Plus, Save, X, Hash, Tag, Scale, Briefcase, ListOrdered } from 'lucide-react';
import { DictionaryItem } from '../../api/api';
import { NumberingSettings } from '../modules/system/NumberingSettings';

const CATEGORY_LABELS: Record<string, { label: string, icon: React.ReactNode }> = {
    'UNIT': { label: 'Jednostki Miary', icon: <Scale className="w-5 h-5 text-emerald-400" /> },
    'MATERIAL_CATEGORY': { label: 'Kategorie Asortymentu', icon: <Tag className="w-5 h-5 text-emerald-400" /> },
    'SERVICE_TYPE': { label: 'Typy Usług', icon: <Briefcase className="w-5 h-5 text-emerald-400" /> },
    'TAX_RATE': { label: 'Stawki VAT', icon: <Hash className="w-5 h-5 text-emerald-400" /> },
    'NUMBERING': { label: 'Schematy Numeracji', icon: <ListOrdered className="w-5 h-5 text-emerald-400" /> },
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
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 flex items-center gap-4">
                        <BookMarked className="w-10 h-10 text-emerald-500" /> Słowniki
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzaj centralnymi wartościami systemu</p>
                </div>
                {!isAdding && activeTab !== 'NUMBERING' && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Nowa Wartość
                    </button>
                )}
            </div>

            <div className="flex flex-1 min-h-0 gap-6">
                {/* Sidebar Categories */}
                <div className="w-72 bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-4 rounded-3xl flex flex-col gap-2 shadow-xl">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 px-2">Kategorie</h3>
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
                            className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all text-sm font-bold tracking-wide ${activeTab === key
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-inner'
                                : 'text-slate-500 hover:bg-slate-800/50 hover:text-slate-300 border border-transparent'
                                }`}
                        >
                            {config.icon}
                            {config.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl flex flex-col overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {CATEGORY_LABELS[activeTab]?.label || activeTab}
                        </h2>
                        {activeTab !== 'NUMBERING' && (
                            <span className="text-[10px] font-black text-slate-500 bg-slate-950/50 px-3 py-1.5 rounded-full border border-slate-800 uppercase tracking-widest">
                                Elementy: {currentItems.length}
                            </span>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                        {activeTab === 'NUMBERING' ? (
                            <NumberingSettings />
                        ) : (
                            <>
                                {isAdding && (
                                    <form onSubmit={handleAddOrUpdate} className="mb-8 p-8 bg-slate-950/80 backdrop-blur-xl rounded-3xl border border-indigo-500/30 shadow-2xl shadow-indigo-500/10">
                                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3">
                                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                                <Plus className="w-5 h-5 text-indigo-400" />
                                            </div>
                                            {editId ? 'Edytuj wartość' : `Dodaj do: ${CATEGORY_LABELS[activeTab]?.label}`}
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
                                                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-2 font-bold shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
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
                                            <div key={item.id} className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800 hover:border-indigo-500/30 transition-all flex justify-between items-start group shadow-lg">
                                                <div>
                                                    <p className="text-white font-bold text-lg tracking-tight">{item.value}</p>
                                                    {item.code && <p className="text-slate-500 font-black text-[10px] mt-2 uppercase tracking-widest">KOD: {item.code}</p>}
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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
