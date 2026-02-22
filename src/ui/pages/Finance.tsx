import React, { useEffect, useState } from 'react';
import { PurchaseInvoiceForm } from '../modules/finance/PurchaseInvoiceForm';
import { ResizableTh } from '../components/ResizableTh';
import { Plus, X } from 'lucide-react';

interface PurchaseInvoice {
    id: string;
    invoiceNumber: string;
    supplier: string;
    supplierNip: string;
    invoiceDate: string;
    grossAmount: number;
    currency: string;
    status: string;
    isMpp: boolean;
    createdAt: string;
}

export const Finance: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchInvoices = async () => {
        try {
            // @ts-ignore
            const data = await window.electron.getInvoices();
            setInvoices(data);
        } catch (error) {
            console.error("Failed to fetch invoices", error);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [refreshKey]);

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };

    return (
        <div className="h-full flex flex-col p-8">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Finanse</h1>
                    <p className="text-slate-400 mt-1">Zarządzanie fakturami i finansami</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-emerald-500/20"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj Fakturę
                </button>
            </div>

            <div className="flex-1 min-h-0">
                <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 flex flex-col h-full">
                    <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                        <table className="min-w-max w-full text-left text-slate-300 border-collapse table-fixed">
                            <thead className="sticky top-0 z-10 bg-slate-800 shadow-md">
                                <tr>
                                    <ResizableTh tableId="finance" columnId="invoiceNumber" initialWidth={200} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Numer Faktury</ResizableTh>
                                    <ResizableTh tableId="finance" columnId="supplier" initialWidth={250} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Dostawca</ResizableTh>
                                    <ResizableTh tableId="finance" columnId="nip" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">NIP</ResizableTh>
                                    <ResizableTh tableId="finance" columnId="date" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Data Wystawienia</ResizableTh>
                                    <ResizableTh tableId="finance" columnId="grossAmount" initialWidth={180} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Wartość Całkowita</ResizableTh>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {invoices.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                                            Brak dokumentów. Kliknij "Dodaj Fakturę", aby rozpocząć.
                                        </td>
                                    </tr>
                                ) : (
                                    invoices.map((invoice) => (
                                        <tr key={invoice.id} className="hover:bg-slate-700/50 transition-colors duration-150 group">
                                            <td className="px-6 py-4 font-medium text-white group-hover:text-emerald-400 transition-colors overflow-hidden text-ellipsis whitespace-nowrap" title={invoice.invoiceNumber}>
                                                {invoice.invoiceNumber}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 overflow-hidden text-ellipsis whitespace-nowrap" title={invoice.supplier}>
                                                {invoice.supplier}
                                                {invoice.isMpp && (
                                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 uppercase">
                                                        MPP
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 font-mono text-sm tracking-wider overflow-hidden text-ellipsis whitespace-nowrap">
                                                {invoice.supplierNip}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
                                                {new Date(invoice.invoiceDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono text-emerald-400 font-bold">
                                                    {formatCurrency(invoice.grossAmount)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
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
                            <PurchaseInvoiceForm onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
