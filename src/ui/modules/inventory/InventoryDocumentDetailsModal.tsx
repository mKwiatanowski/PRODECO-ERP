import React, { useEffect, useState } from 'react';
import { X, FileText, Calendar, User, Package, Hash, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

interface DocumentItem {
    id: string;
    productId: string;
    quantity: number;
    price?: number;
    product: {
        name: string;
        unit: string;
    };
}

interface InventoryDocumentDetails {
    id: string;
    documentNumber: string;
    type: string;
    date: string;
    contractor?: string;
    referenceId?: string;
    items: DocumentItem[];
}

interface InventoryDocumentDetailsModalProps {
    documentId: string;
    onClose: () => void;
}

export const InventoryDocumentDetailsModal: React.FC<InventoryDocumentDetailsModalProps> = ({ documentId, onClose }) => {
    const [details, setDetails] = useState<InventoryDocumentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                const data = await window.electron.inventory.getInventoryDocumentDetails(documentId);
                setDetails(data);
            } catch (error) {
                console.error("Failed to fetch document details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [documentId]);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
                <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <p className="text-slate-400">Pobieranie szczegółów dokumentu...</p>
                </div>
            </div>
        );
    }

    if (!details) return null;

    const isReceipt = details.type === 'PZ' || details.type === 'PW';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isReceipt ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white leading-tight">
                                Szczegóły dokumentu: <span className="text-emerald-400 font-mono tracking-wider">{details.documentNumber}</span>
                            </h2>
                            <p className="text-slate-400 text-xs flex items-center gap-4 mt-1">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(details.date).toLocaleDateString('pl-PL')}
                                </span>
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight ${isReceipt ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                                    }`}>
                                    {isReceipt ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {details.type}
                                </span>
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

                {/* Info Bar */}
                <div className="bg-slate-800/30 px-6 py-3 border-b border-slate-700 flex flex-wrap gap-8 text-sm">
                    {details.contractor && (
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400">Kontrahent:</span>
                            <span className="text-white font-medium">{details.contractor}</span>
                        </div>
                    )}
                    {details.referenceId && (
                        <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-400">Ref:</span>
                            <span className="text-white font-mono text-xs">{details.referenceId}</span>
                        </div>
                    )}
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-auto p-6 custom-scrollbar bg-[#0d1117]">
                    <div className="border border-slate-800 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-slate-300 border-collapse">
                            <thead className="bg-[#161b22] sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider w-12 text-center">Lp.</th>
                                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider">Produkt</th>
                                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Ilość</th>
                                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider w-20 text-center">J.m.</th>
                                    <th className="px-4 py-3 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Cena/Koszt</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {details.items.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                                        <td className="px-4 py-3 text-sm text-slate-500 text-center font-mono">{index + 1}</td>
                                        <td className="px-4 py-3 text-sm font-medium text-white">
                                            <div className="flex items-center gap-2">
                                                <Package className="w-3.5 h-3.5 text-slate-500" />
                                                {item.product?.name || 'Produkt nieznany'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className="font-bold font-mono text-emerald-400">{item.quantity}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-slate-400 uppercase tracking-wider">
                                            {item.product?.unit || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-right font-mono text-sm text-slate-300">
                                            {item.price ? Number(item.price).toFixed(2) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-700 bg-slate-800/50 flex justify-between items-center">
                    <div className="text-[10px] text-slate-500 italic max-w-sm leading-relaxed">
                        Wygenerowano z systemu ERP PRODECO. Dokument stanowi potwierdzenie operacji magazynowej.
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-all shadow-lg active:scale-95"
                    >
                        Zamknij podgląd
                    </button>
                </div>
            </div>
        </div>
    );
};
