import React, { useEffect, useState } from 'react';
import { X, History, ArrowUpRight, ArrowDownLeft, FileText, Calendar, Package } from 'lucide-react';

interface HistoryItem {
    id: string;
    documentId: string;
    productId: string;
    quantity: number;
    price?: number;
    costPrice?: number; // TICKET 10.3: Koszt FIFO
    document: {
        documentNumber: string;
        type: 'PZ' | 'WZ' | 'RW' | 'PW';
        date: string;
        referenceId?: string;
    };
}

interface ProductHistoryModalProps {
    productId: string;
    productName: string;
    onClose: () => void;
}

export const ProductHistoryModal: React.FC<ProductHistoryModalProps> = ({ productId, productName, onClose }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await window.electron.inventory.getProductHistory(productId);
                setHistory(data);
            } catch (error) {
                console.error("Failed to fetch product history", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [productId]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <History className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">Karta Towaru</h2>
                            <p className="text-slate-400 text-sm flex items-center gap-1.5">
                                <Package className="w-3.5 h-3.5" />
                                {productName}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
                        title="Zamknij"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 animate-pulse">Pobieranie historii ruchów...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic">
                            <History className="w-12 h-12 mb-4 opacity-20" />
                            <p>Brak zarejestrowanych ruchów dla tego produktu.</p>
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-slate-800 rounded-xl">
                            <table className="w-full text-left text-slate-300 border-collapse">
                                <thead className="bg-slate-800/80 sticky top-0">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Data</th>
                                        <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Typ</th>
                                        <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Numer Dokumentu</th>
                                        <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Ilość</th>
                                        <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Cena / Koszt (FIFO)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {history.map((item) => {
                                        const isPZ = item.document.type === 'PZ' || item.document.type === 'PW';
                                        const isWZ = item.document.type === 'WZ';
                                        return (
                                            <tr key={item.id} className="hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                                                        {new Date(item.document.date).toLocaleDateString('pl-PL')}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${isPZ ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                        }`}>
                                                        {isPZ ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                                        {item.document.type}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm">
                                                    <div className="flex items-center gap-2 font-mono text-xs">
                                                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                                                        {item.document.documentNumber}
                                                        {item.document.referenceId && (
                                                            <span className="text-slate-500 text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                                                                Ref: {item.document.referenceId}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <span className={`font-bold font-mono text-sm ${isPZ ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                        {isPZ ? '+' : '-'}{item.quantity}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right font-mono text-sm">
                                                    {isWZ ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-slate-500 text-[10px] flex items-center gap-1 group-hover:text-amber-500/50 transition-colors">
                                                                <Package className="w-3 h-3" /> Koszt zakupu
                                                            </span>
                                                            <span className="text-amber-500 font-bold" title="Koszt własny sprzedaży (FIFO)">
                                                                {item.costPrice ? `${item.costPrice.toFixed(2)}` : '0.00'}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400">
                                                            {item.price ? `${item.price.toFixed(2)}` : '-'}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/30 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 max-w-sm italic">
                        * W przypadku dokumentów WZ wyświetlany jest wyliczony koszt zakupu (FIFO), a nie cena sprzedaży z faktury.
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all shadow-lg active:scale-95"
                        title="Zamknij"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        </div>
    );
};
