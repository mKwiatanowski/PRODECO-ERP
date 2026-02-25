import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Save, Info, RefreshCw, Layers } from 'lucide-react';

interface NumberingScheme {
    id: string;
    target: string;
    prefix: string;
    mask: string;
    isDefault: boolean;
}

export const NumberingSettings: React.FC = () => {
    const [schemes, setSchemes] = useState<NumberingScheme[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedScheme, setSelectedScheme] = useState<NumberingScheme | null>(null);
    const [preview, setPreview] = useState<string>('');

    const loadSchemes = async () => {
        setIsLoading(true);
        try {
            const data = await window.electron.settings.getNumberingSchemes();
            setSchemes(data);
            if (data.length > 0 && !selectedScheme) {
                setSelectedScheme(data[0]);
            }
        } catch (error) {
            console.error("Failed to load numbering schemes", error);
            toast.error("Błąd podczas ładowania schematów numeracji.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadSchemes();
    }, []);

    useEffect(() => {
        if (selectedScheme) {
            updatePreview();
        }
    }, [selectedScheme?.mask, selectedScheme?.prefix]);

    const updatePreview = async () => {
        if (!selectedScheme) return;
        try {
            // We use the test method from IPC (it should just simulate based on current local state)
            // But since testNumbering on backend uses DB, we might want a purely local preview
            // For now, let's call the real test backend which increments (maybe not ideal for preview)
            // Or better: local mock logic for preview to avoid DB calls on every keystroke

            let result = selectedScheme.mask;
            const now = new Date();
            result = result.replace('[PREFIX]', selectedScheme.prefix || '');
            result = result.replace('[YYYY]', now.getFullYear().toString());
            result = result.replace('[MM]', (now.getMonth() + 1).toString().padStart(2, '0'));

            const nrRegex = /\[NR(?::(\d+))?\]/;
            const match = result.match(nrRegex);
            if (match) {
                const padding = match[1] ? parseInt(match[1]) : 3;
                result = result.replace(nrRegex, "1".padStart(padding, '0'));
            }
            setPreview(result);
        } catch (err) {
            setPreview('Błędna maska');
        }
    };

    const handleSave = async () => {
        if (!selectedScheme) return;
        try {
            await window.electron.settings.updateNumberingScheme(selectedScheme);
            toast.success("Schemat został zapisany.");
            loadSchemes();
        } catch (error) {
            toast.error("Błąd podczas zapisywania schematu.");
        }
    };

    if (isLoading) {
        return <div className="p-12 text-center text-slate-500">Ładowanie ustawień numeracji...</div>;
    }

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 overflow-y-auto custom-scrollbar">
                {/* Lista schematów */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Layers className="w-4 h-4" /> Dostępne Schematy
                    </h3>
                    {schemes.map(s => (
                        <button
                            key={s.id}
                            onClick={() => setSelectedScheme(s)}
                            className={`w-full text-left p-4 rounded-2xl border transition-all ${selectedScheme?.id === s.id
                                ? 'bg-indigo-500/10 border-indigo-500/40 text-white shadow-lg'
                                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'}`}
                        >
                            <div className="flex justify-between items-center">
                                <span className="font-bold tracking-tight">
                                    {s.target === 'CLIENT' ? 'Klienci' : s.target === 'INVOICE' ? 'Faktury' : s.target}
                                </span>
                                {s.isDefault && (
                                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 uppercase">
                                        Domyślny
                                    </span>
                                )}
                            </div>
                            <div className="mt-2 font-mono text-sm opacity-60 truncate">{s.mask}</div>
                        </button>
                    ))}
                </div>

                {/* Formularz edycji */}
                {selectedScheme ? (
                    <div className="bg-slate-950/60 backdrop-blur-xl rounded-3xl border border-slate-800 p-8 shadow-2xl flex flex-col gap-6">
                        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
                            Edytuj Schemat: {selectedScheme.target === 'CLIENT' ? 'Klienci' : 'Faktury'}
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prefiks</label>
                                <input
                                    type="text"
                                    value={selectedScheme.prefix}
                                    onChange={(e) => setSelectedScheme({ ...selectedScheme, prefix: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all"
                                    placeholder="np. FV lub KLI"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Maska Numeracji</label>
                                <input
                                    type="text"
                                    value={selectedScheme.mask}
                                    onChange={(e) => setSelectedScheme({ ...selectedScheme, mask: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all font-mono"
                                    placeholder="np. [PREFIX]/[YYYY]/[NR]"
                                />
                            </div>

                            {/* Podgląd */}
                            <div className="mt-8 p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                                <span className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">Podgląd na żywo</span>
                                <div className="text-2xl font-mono font-bold text-white tracking-wider flex items-center gap-3">
                                    {preview}
                                    <RefreshCw className="w-4 h-4 text-slate-500 animate-pulse" />
                                </div>
                            </div>

                            {/* Instrukcja */}
                            <div className="flex gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 items-start">
                                <Info className="w-5 h-5 text-sky-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-slate-400 leading-relaxed">
                                    <p className="font-bold text-slate-300 mb-1">Dostępne tagi:</p>
                                    <ul className="list-disc ml-4 space-y-1">
                                        <li><code className="text-emerald-400">[PREFIX]</code> - Wstawi tekst z pola powyżej</li>
                                        <li><code className="text-emerald-400">[YYYY]</code> - Bieżący rok (np. 2026)</li>
                                        <li><code className="text-emerald-400">[MM]</code> - Bieżący miesiąc (np. 02)</li>
                                        <li><code className="text-emerald-400">[NR]</code> - Kolejny numer (domyślnie 3 cyfry)</li>
                                        <li><code className="text-emerald-400">[NR:X]</code> - Numer z paddingiem (np. <span className="italic">[NR:4]</span> da 0001)</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-800 flex justify-end">
                            <button
                                onClick={handleSave}
                                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                            >
                                <Save className="w-5 h-5" />
                                Zapisz Schemat
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-12 text-slate-500 italic">Wybierz schemat z listy po lewej, aby edytować.</div>
                )}
            </div>
        </div>
    );
};
