import React, { useEffect, useState, useMemo } from 'react';
import { ResizableTh } from '../../ui/components/ResizableTh';
import { InvoiceData, KsefStatus } from '../../api/api';
import { TrendingUp, TrendingDown, Wallet, Search, Plus, FileText, FileDown, Loader2, CloudUpload } from 'lucide-react';
import { InvoiceFormModal } from './InvoiceFormModal';

export const FinanceDashboard: React.FC = () => {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceData | null>(null);
    const [documentType, setDocumentType] = useState<'ALL' | 'SALE' | 'PURCHASE'>('ALL');
    const [hasError, setHasError] = useState(false);

    // Default to current year and month
    const now = new Date();
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12


    const loadData = async () => {
        setIsLoading(true);
        try {
            const [invData] = await Promise.all([
                window.electron.finance.getInvoices(),
                window.electron.finance.getFinancialSummary()
            ]);
            setInvoices(invData);
        } catch (error) {
            console.error("Failed to load finance data", error);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveInvoice = async (invoice: Partial<InvoiceData>, items: any[]) => {
        try {
            if (editingInvoice) {
                await window.electron.finance.updateInvoice(editingInvoice.id, invoice, items || []);
            } else {
                await window.electron.finance.addInvoice(invoice, items || []);
            }
            await loadData();
        } catch (error) {
            console.error("Failed to save invoice", error);
            throw error;
        }
    };

    const handleOpenEdit = (invoice: InvoiceData) => {
        setEditingInvoice(invoice);
        setIsModalOpen(true);
    };

    const handleOpenCreate = () => {
        setEditingInvoice(null);
        setIsModalOpen(true);
    };

    const handlePrint = async (id: string) => {
        setGeneratingPdfId(id);
        try {
            const result = await window.electron.finance.generatePdf(id);
            if (!result.success && result.reason !== 'CANCELED') {
                alert("Błąd podczas generowania pliku PDF: " + result.reason);
            }
        } catch (error) {
            console.error("Failed to generate PDF", error);
            alert("Błąd krytyczny podczas generowania pliku PDF.");
        } finally {
            setGeneratingPdfId(null);
        }
    };

    const handleSendToKsef = async (id: string) => {
        try {
            await window.electron.finance.sendToKsef(id);
            await loadData();
        } catch (error) {
            console.error("Failed to send to KSeF", error);
            alert("Błąd podczas wysyłki do KSeF.");
        }
    };

    const formatCurrency = (cents: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(cents / 100);
    };

    const filteredInvoices = useMemo(() => {
        try {
            return invoices.filter(inv => {
                const matchesSearch = (inv.number || "").toLowerCase().includes(searchTerm.toLowerCase());
                const matchesType = documentType === 'ALL' || inv.type === documentType;

                const date = inv.issueDate ? new Date(inv.issueDate) : new Date(0);
                const isValidDate = !isNaN(date.getTime());
                const matchesYear = isValidDate && date.getFullYear() === selectedYear;
                const matchesMonth = isValidDate && (date.getMonth() + 1) === selectedMonth;

                return matchesSearch && matchesType && matchesYear && matchesMonth;
            });
        } catch (e) {
            console.error("Error filtering invoices", e);
            return [];
        }
    }, [invoices, searchTerm, documentType, selectedYear, selectedMonth]);

    const dynamicSummary = useMemo(() => {
        try {
            const periodInvoices = invoices.filter(inv => {
                const date = inv.issueDate ? new Date(inv.issueDate) : new Date(0);
                return !isNaN(date.getTime()) && date.getFullYear() === selectedYear && (date.getMonth() + 1) === selectedMonth;
            });

            const incomes = periodInvoices
                .filter(inv => inv.type === 'SALE')
                .reduce((sum, inv) => sum + (Number(inv.totalGrossCents) || 0), 0);

            const expenses = periodInvoices
                .filter(inv => inv.type === 'PURCHASE')
                .reduce((sum, inv) => sum + (Number(inv.totalGrossCents) || 0), 0);

            return {
                totalIncomesCents: incomes,
                totalExpensesCents: expenses,
                balanceCents: incomes - expenses
            };
        } catch (e) {
            console.error("Error calculating summary", e);
            return { totalIncomesCents: 0, totalExpensesCents: 0, balanceCents: 0 };
        }
    }, [invoices, selectedYear, selectedMonth]);


    if (hasError) {
        return (
            <div className="p-8 bg-slate-950 min-h-screen text-slate-200 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold text-rose-500 mb-4">Wystąpił błąd podczas ładowania modułu finansowego.</h2>
                <button
                    onClick={() => { setHasError(false); loadData(); }}
                    className="bg-indigo-600 px-6 py-2 rounded-xl text-white font-bold"
                >
                    Spróbuj ponownie
                </button>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <InvoiceFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingInvoice(null);
                }}
                onSubmit={handleSaveInvoice}
                initialData={editingInvoice}
            />

            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                        Podsumowanie Finansowe
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzaj przepływami i dokumentami firmy</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nowy Dokument
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Przychody</span>
                    </div>
                    <div className="text-3xl font-black text-white">{formatCurrency(dynamicSummary.totalIncomesCents)}</div>
                    <div className="text-slate-500 text-sm mt-1">Łączna sprzedaż w wybranym okresie</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-rose-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl group-hover:bg-rose-500/20 transition-colors">
                            <TrendingDown className="w-8 h-8 text-rose-500" />
                        </div>
                        <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Koszty</span>
                    </div>
                    <div className="text-3xl font-black text-white">{formatCurrency(dynamicSummary.totalExpensesCents)}</div>
                    <div className="text-slate-500 text-sm mt-1">Wydatki i zakupy w wybranym okresie</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                            <Wallet className="w-8 h-8 text-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Bilans</span>
                    </div>
                    <div className="text-3xl font-black text-white">{formatCurrency(dynamicSummary.balanceCents)}</div>
                    <div className="text-slate-500 text-sm mt-1">Wynik finansowy okresu</div>
                </div>

            </div>

            {/* Invoices Table */}
            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-slate-800/60 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <FileText className="w-6 h-6 text-indigo-400" />
                        Dokumenty Finansowe
                    </h2>
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Type Switcher */}
                        <div className="flex space-x-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 shadow-inner">
                            <button
                                onClick={() => setDocumentType('ALL')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${documentType === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'}`}
                            >
                                WSZYSTKO
                            </button>
                            <button
                                onClick={() => setDocumentType('PURCHASE')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${documentType === 'PURCHASE' ? 'bg-rose-500/10 text-rose-400 shadow-sm border border-rose-500/20' : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/5'}`}
                            >
                                ZAKUP
                            </button>
                            <button
                                onClick={() => setDocumentType('SALE')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${documentType === 'SALE' ? 'bg-emerald-500/10 text-emerald-400 shadow-sm border border-emerald-500/20' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/5'}`}
                            >
                                SPRZEDAŻ
                            </button>
                        </div>

                        {/* Date Selectors */}
                        <div className="flex gap-2 items-center bg-slate-950/50 p-1 rounded-xl border border-slate-800">
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="bg-transparent text-xs font-bold text-slate-300 outline-none px-2 py-1 cursor-pointer hover:text-indigo-400 transition-colors"
                            >
                                {['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'].map((m, i) => (
                                    <option key={m} value={i + 1} className="bg-slate-900 text-white">{m}</option>
                                ))}
                            </select>
                            <div className="w-px h-4 bg-slate-800"></div>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="bg-transparent text-xs font-bold text-slate-300 outline-none px-2 py-1 cursor-pointer hover:text-indigo-400 transition-colors"
                            >
                                {[2024, 2025, 2026, 2027].map(y => (
                                    <option key={y} value={y} className="bg-slate-900 text-white">{y}</option>
                                ))}
                            </select>
                        </div>

                        <div className="relative w-full sm:w-64">

                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Szukaj numeru faktury..."
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder-slate-600"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[500px] custom-scrollbar">

                    <table className="w-full text-left border-collapse table-fixed">
                        <thead className="sticky top-0 bg-slate-900/90 backdrop-blur-xl z-10 border-b border-slate-800">
                            <tr>
                                <ResizableTh tableId="finance_dash" columnId="type" initialWidth={100} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Typ</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="number" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Numer</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="date" initialWidth={120} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Data</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="client" initialWidth={180} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest">Nabywca/Sprzedawca</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="amount" initialWidth={150} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-right">Kwota</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="status" initialWidth={120} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-center">Status</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="ksef" initialWidth={120} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-center">KSeF</ResizableTh>
                                <ResizableTh tableId="finance_dash" columnId="actions" initialWidth={110} className="px-6 py-4 text-slate-500 uppercase text-[10px] font-black tracking-widest text-center">Akcje</ResizableTh>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-500">
                                            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                                            <span className="animate-pulse font-medium text-xs uppercase tracking-widest">Pobieranie danych...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-slate-500 italic">Nie znaleziono dokumentów spełniających kryteria.</td>
                                </tr>
                            ) : (
                                filteredInvoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        onDoubleClick={() => handleOpenEdit(inv)}
                                        className="hover:bg-slate-800/30 transition-colors group cursor-pointer border-l-2 border-transparent hover:border-indigo-500"
                                    >
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-tighter ${inv.type === 'SALE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                {inv.type === 'SALE' ? 'Sprzedaż' : 'Zakup'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
                                            {inv.number}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-medium whitespace-nowrap">
                                            {inv.issueDate ? new Date(inv.issueDate).toLocaleDateString('pl-PL') : 'Brak daty'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400 font-medium truncate">
                                            {inv.client?.name || 'Brak klienta'}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-black ${inv.type === 'SALE' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {formatCurrency(Number(inv.totalGrossCents) || 0)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <span className={`flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-md border shadow-sm ${inv.isPaid
                                                    ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20'
                                                    : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                    }`}>
                                                    {inv.isPaid ? 'OPŁACONA' : 'NIEOPŁACONA'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center">
                                                <div className="transition-all duration-500 ease-in-out transform">
                                                    {inv.ksefStatus === KsefStatus.PRZYJĘTO ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 shadow-sm animate-in zoom-in duration-300" title={inv.ksefReferenceNumber}>
                                                            PRZYJĘTO
                                                        </span>
                                                    ) : inv.ksefStatus === KsefStatus.OCZEKUJE ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 shadow-sm animate-pulse">
                                                            OCZEKUJE
                                                        </span>
                                                    ) : inv.ksefStatus === KsefStatus.BŁĄD ? (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 shadow-sm">
                                                            BŁĄD
                                                        </span>
                                                    ) : (
                                                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full border border-slate-500/20 shadow-sm">
                                                            NIEPRZESŁANO
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                {(inv.ksefStatus === KsefStatus.NIEPRZESŁANO || inv.ksefStatus === KsefStatus.BŁĄD || !inv.ksefStatus) && inv.type === 'SALE' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSendToKsef(inv.id);
                                                        }}
                                                        disabled={generatingPdfId !== null}
                                                        title="Wyślij do KSeF"
                                                        className="p-2 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
                                                    >
                                                        <CloudUpload className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handlePrint(inv.id);
                                                    }}
                                                    disabled={generatingPdfId !== null}
                                                    title="Pobierz PDF"
                                                    className={`p-2 rounded-lg transition-all ${generatingPdfId === inv.id ? 'bg-rose-500/20 text-rose-400 animate-pulse' : 'bg-slate-800 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300'}`}
                                                >
                                                    {generatingPdfId === inv.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};


