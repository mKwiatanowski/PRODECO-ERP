import React, { useEffect, useState, useMemo } from 'react';
import { ResizableTh } from '../../components/ResizableTh';
import { Search, FileText, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { InventoryDocumentDetailsModal } from './InventoryDocumentDetailsModal';

interface InventoryDocumentItem {
    id: string;
    productId: string;
    quantity: number;
    price?: number;
}

interface InventoryDocument {
    id: string;
    documentNumber: string;
    type: string;
    date: string;
    contractor?: string;
    referenceId?: string;
    items: InventoryDocumentItem[];
    createdAt: string;
}

export const DocumentList: React.FC = () => {
    const [documents, setDocuments] = useState<InventoryDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeType, setActiveType] = useState<'ALL' | 'PZ' | 'WZ' | 'OTHER'>('ALL');
    const [selectedDocId, setSelectedDocId] = useState<string | null>(null);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            const data = await window.electron.inventory.getDocuments();
            setDocuments(data);
        } catch (error) {
            console.error("Failed to load documents", error);
            toast.error("Błąd ładowania historii dokumentów.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    const filteredDocuments = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.documentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (doc.referenceId && doc.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

            const matchesType = activeType === 'ALL' ||
                (activeType === 'PZ' && doc.type === 'PZ') ||
                (activeType === 'WZ' && doc.type === 'WZ') ||
                (activeType === 'OTHER' && !['PZ', 'WZ'].includes(doc.type));

            return matchesSearch && matchesType;
        });
    }, [documents, searchTerm, activeType]);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'PZ': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            case 'RW': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
            case 'WZ': return 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30';
            case 'PW': return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
            case 'INW': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border border-slate-500/30';
        }
    };

    const formatDate = (dateValue: any) => {
        if (!dateValue) return '-';
        const date = new Date(dateValue);
        if (isNaN(date.getTime())) return 'Niepoprawna data';
        return date.toLocaleDateString('pl-PL') + ' ' + date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden flex flex-col h-full shadow-xl">
            {/* Header Toolbar */}
            <div className="p-6 border-b border-slate-700 bg-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-emerald-500" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Dokumenty Magazynowe</h2>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    {/* Type Filter Switch */}
                    <div className="flex space-x-1 bg-slate-900/50 p-1 rounded-xl border border-slate-800 backdrop-blur-sm shadow-inner overflow-x-auto max-w-full">
                        <button
                            onClick={() => setActiveType('ALL')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeType === 'ALL' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            Wszystkie
                        </button>
                        <button
                            onClick={() => setActiveType('PZ')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeType === 'PZ' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            Przyjęcia (PZ)
                        </button>
                        <button
                            onClick={() => setActiveType('WZ')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeType === 'WZ' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            Wydania (WZ)
                        </button>
                        <button
                            onClick={() => setActiveType('OTHER')}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all whitespace-nowrap ${activeType === 'OTHER' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'}`}
                        >
                            Inne
                        </button>
                    </div>

                    {/* Omni-Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Szukaj po numerze lub ref..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all placeholder-slate-500"
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto bg-[#0d1117] custom-scrollbar">
                <table className="min-w-max w-full text-left border-collapse table-fixed">
                    <thead className="bg-[#161b22] sticky top-0 z-10 shadow-sm border-b border-slate-700">
                        <tr>
                            <ResizableTh tableId="inventory_documents" columnId="number" initialWidth={200} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Nr Dokumentu</ResizableTh>
                            <ResizableTh tableId="inventory_documents" columnId="type" initialWidth={100} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-center">Typ</ResizableTh>
                            <ResizableTh tableId="inventory_documents" columnId="date" initialWidth={200} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Data Wystawienia</ResizableTh>
                            <ResizableTh tableId="inventory_documents" columnId="ref" initialWidth={250} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Identyfikator Ref.</ResizableTh>
                            <ResizableTh tableId="inventory_documents" columnId="items" initialWidth={120} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Ilość Poz.</ResizableTh>
                            <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right w-24">Akcje</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                        {isLoading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin"></div>
                                        <p>Wczytywanie historii dokumentów...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : filteredDocuments.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    <p className="text-lg">Brak dokumentów w rejestrze</p>
                                    {searchTerm && <p className="text-sm mt-1">Spróbuj zmienić parametry wyszukiwania</p>}
                                </td>
                            </tr>
                        ) : (
                            filteredDocuments.map(doc => (
                                <tr key={doc.id} className="hover:bg-slate-700/30 transition-colors group cursor-default">
                                    <td className="px-6 py-4 overflow-hidden text-ellipsis whitespace-nowrap" title={doc.documentNumber}>
                                        <div className="text-white font-mono font-medium">{doc.documentNumber}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center overflow-hidden text-ellipsis whitespace-nowrap">
                                        <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wider ${getTypeColor(doc.type)}`}>
                                            {doc.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-300 tabular-nums overflow-hidden text-ellipsis whitespace-nowrap">
                                        {formatDate(doc.date || doc.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-400 font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap" title={doc.referenceId || ''}>
                                        {doc.referenceId || <span className="text-slate-600 italic">Brak referencji</span>}
                                    </td>
                                    <td className="px-6 py-4 text-right overflow-hidden text-ellipsis whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border border-slate-700 font-medium text-emerald-400">
                                            {doc.items?.length || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedDocId(doc.id)}
                                            className="p-1.5 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-all group"
                                            title="Pokaż szczegóły dokumentu"
                                        >
                                            <Eye className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Footer Summary */}
            <div className="bg-[#161b22] px-6 py-4 text-sm text-slate-400 flex justify-between items-center border-t border-slate-700">
                <span>Wyświetlono: <strong className="text-emerald-400">{filteredDocuments.length}</strong> z <strong className="text-white">{documents.length}</strong></span>
                <span>System ERP: Obieg Zamknięty</span>
            </div>

            {/* Details Modal */}
            {selectedDocId && (
                <InventoryDocumentDetailsModal
                    documentId={selectedDocId}
                    onClose={() => setSelectedDocId(null)}
                />
            )}
        </div>
    );
};
