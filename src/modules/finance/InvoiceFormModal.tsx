import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Plus, Trash2, Calculator, Info, AlertCircle, Search } from 'lucide-react';
import { useRef } from 'react';
import { InvoiceData, InvoiceItemData, Product, Client, DictionaryItem } from '../../api/api';

interface InvoiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (invoice: Partial<InvoiceData>, items: InvoiceItemData[]) => Promise<void>;
    initialData?: InvoiceData | null;
}

// Helpery centowe
const toCents = (val: number | string): number => {
    const num = typeof val === 'string' ? parseFloat(val.replace(',', '.')) : val;
    return isNaN(num) ? 0 : Math.round(num * 100);
};

const fromCents = (cents: number): string => {
    return (cents / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const InvoiceFormModal: React.FC<InvoiceFormModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    // Nagłówek
    const [type, setType] = useState<'SALE' | 'PURCHASE'>('SALE');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [clientId, setClientId] = useState('');
    const [nip, setNip] = useState('');
    const [clientName, setClientName] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [saleDate, setSaleDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().split('T')[0];
    });
    const [currency] = useState('PLN');
    const [isPaid, setIsPaid] = useState(false);
    const [bankAccountNumber, setBankAccountNumber] = useState('');

    // Pozycje
    const [items, setItems] = useState<Partial<InvoiceItemData>[]>([
        { productId: null, productName: '', type: 'USLUGA', quantity: 1, unit: 'szt.', priceNetCents: 0, vatRate: '23%', vatValueCents: 0, priceGrossCents: 0 }
    ]);

    // Dane pomocnicze
    const [availableProducts, setAvailableProducts] = useState<Product[]>([]);
    const [availableClients, setAvailableClients] = useState<Client[]>([]);
    const [dictionaries, setDictionaries] = useState<Record<string, DictionaryItem[]>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showValidation, setShowValidation] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [clientSearch, setClientSearch] = useState('');
    const [activeRowSearch, setActiveRowSearch] = useState<number | null>(null);
    const clientInputRef = useRef<HTMLInputElement>(null);

    const fetchNextNumber = async (targetType: string) => {
        console.log(`[Form] Fetching next number for ${targetType}...`);
        setIsSubmitting(true);
        try {
            const nextNumber = await window.electron.settings.testNumbering(targetType);
            if (nextNumber && !initialData) {
                console.log(`[Form] Received number: ${nextNumber}`);
                setInvoiceNumber(nextNumber);
            }
        } catch (error) {
            console.error("[Form] Failed to fetch next number:", error);
        } finally {
            setIsSubmitting(false);
            // Auto-focus on client search after number is loaded
            setTimeout(() => clientInputRef.current?.focus(), 100);
        }
    };

    const handleGeneratePdf = async () => {
        if (!initialData?.id) return;
        try {
            const result = await window.electron.finance.generatePdf(initialData.id);
            if (result.success) {
                console.log("PDF saved to:", result.path);
            } else if (result.reason !== 'CANCELED') {
                alert("Błąd podczas generowania PDF: " + result.reason);
            }
        } catch (error: any) {
            alert("Błąd krytyczny generowania PDF: " + error.message);
        }
    };

    const resetForm = () => {
        setType('SALE');
        setInvoiceNumber('');
        setClientId('');
        setNip('');
        setClientName('');
        setClientAddress('');
        setBankAccountNumber('');
        const today = new Date().toISOString().split('T')[0];
        setIssueDate(today);
        setSaleDate(today);
        const d = new Date();
        d.setDate(d.getDate() + 14);
        setDueDate(d.toISOString().split('T')[0]);
        setIsPaid(false);
        setItems([{ productId: null, productName: '', type: 'USLUGA', quantity: 1, unit: 'szt.', priceNetCents: 0, vatRate: '23%', vatValueCents: 0, priceGrossCents: 0 }]);
        setClientSearch('');
        setShowValidation(false);
        setIsSubmitting(false);
    };

    useEffect(() => {
        if (isOpen) {
            setLoadError(null);
            window.electron?.inventory?.getProducts().then(products => setAvailableProducts(products || []));
            window.electron?.clients?.getAll().then(clients => setAvailableClients(clients || []));
            window.electron?.dictionaries?.getAll().then(dicts => setDictionaries(dicts || {}));

            setIsSubmitting(false);
            setActiveRowSearch(null); // Reset search state on open

            if (initialData) {
                try {
                    console.log("[Form] Loading initial data for invoice:", initialData.id);
                    setType(initialData.type || 'SALE');
                    setInvoiceNumber((initialData as any).number || initialData.invoiceNumber || '');
                    setClientId(initialData.clientId || '');
                    setNip(initialData.nip || '');

                    // Bezpieczne parsowanie dat
                    const safeDate = (val: any): string => {
                        try {
                            const d = new Date(val);
                            if (isNaN(d.getTime())) return new Date().toISOString().split('T')[0];
                            return d.toISOString().split('T')[0];
                        } catch { return new Date().toISOString().split('T')[0]; }
                    };
                    setIssueDate(safeDate(initialData.issueDate));
                    setDueDate(safeDate(initialData.dueDate));
                    setIsPaid(!!initialData.isPaid);

                    // Bezpieczne mapowanie pozycji — normalizacja pól dziesiętnych do *Cents
                    if (initialData.items && initialData.items.length > 0) {
                        const normalizedItems = initialData.items.map((item: any) => {
                            const netPriceCents = Number(item.priceNetCents) || Math.round(Number(item.netPrice || 0) * 100);
                            const vatCents = Number(item.vatValueCents) || Math.round(Number(item.vatValue || 0) * 100);
                            const grossCents = Number(item.priceGrossCents) || Math.round(Number(item.grossValue || 0) * 100);
                            return {
                                productId: item.productId || null,
                                productName: item.productName || item.description || '',
                                type: item.type || (item.productId ? 'TOWAR' : 'USLUGA') as 'TOWAR' | 'USLUGA',
                                quantity: Number(item.quantity) || 1,
                                unit: item.unit || 'szt.',
                                priceNetCents: netPriceCents,
                                vatRate: item.vatRate || '23%',
                                vatValueCents: vatCents,
                                priceGrossCents: grossCents
                            };
                        });
                        setItems(normalizedItems);
                    }

                    // Ustaw dane klienta z relacji
                    if (initialData.client) {
                        setClientName(initialData.client.name || '');
                        setClientAddress(initialData.client.address || `${initialData.client.street || ''}, ${initialData.client.postalCode || ''} ${initialData.client.city || ''}`);
                    }
                } catch (err: any) {
                    console.error("[Form] CRITICAL: Failed to load initialData", err);
                    setLoadError(err.message || 'Nieznany błąd ładowania danych dokumentu.');
                }
            } else {
                console.log("[Form] Resetting for new document");
                resetForm();
                // Po zresetowaniu formularza pobieramy numer (jeśli to nowa faktura)
                fetchNextNumber('INVOICE');
            }
        }
    }, [isOpen, initialData]);

    // Reakcja na zmianę typu dokumentu - odświeżamy numer tylko dla nowych faktur
    useEffect(() => {
        if (isOpen && !initialData) {
            fetchNextNumber('INVOICE');
        }
    }, [type]);

    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Sync bank account when client is selected or loaded
    useEffect(() => {
        if (clientId && availableClients.length > 0) {
            const client = availableClients.find(c => c.id === clientId);
            if (client) {
                setBankAccountNumber(client.bankAccountNumber || '');
            }
        }
    }, [clientId, availableClients]);

    const handleClientSelect = (client: Client) => {
        setClientId(client.id);
        setNip(client.nip || '');
        setClientName(client.name);
        setClientAddress(client.address || `${client.street}, ${client.postalCode} ${client.city}`);
        setBankAccountNumber(client.bankAccountNumber || '');
    };

    const filteredClients = useMemo(() => {
        if (!clientSearch || !availableClients) return [];
        return availableClients.filter(c =>
            (c.name?.toLowerCase().includes(clientSearch.toLowerCase())) ||
            (c.nip?.includes(clientSearch))
        ).slice(0, 5);
    }, [availableClients, clientSearch]);

    // Logika wyliczania pozycji
    const updateItem = (index: number, updates: Partial<InvoiceItemData>) => {
        const newItems = [...items];
        const item = { ...newItems[index], ...updates };

        // Jeśli wybrano produkt z bazy
        if (updates.productId && updates.productId !== 'manual' && availableProducts) {
            const product = availableProducts.find(p => p.id === updates.productId);
            if (product) {
                item.vatRate = product.vatRate;
                item.productName = product.name;
                item.productId = product.id;
                item.unit = product.unit;
                item.type = product.type as 'TOWAR' | 'USLUGA';
            }
        } else if (updates.productName !== undefined && !updates.productId) {
            // Wpis ręczny lub zmiana nazwy
            item.productId = null;
            if (!item.type) item.type = 'USLUGA';
            if (!item.vatRate) item.vatRate = '23%';
        }

        // Przelicz wartości wiersza z precyzją 2 miejsc po przecinku
        const qty = item.quantity ?? 1;
        const netPrice = (item.priceNetCents ?? 0) / 100;
        const netValue = Math.round(qty * netPrice * 100) / 100;

        const rateMatch = (item.vatRate || '23%').match(/(\d+)/);
        const rate = rateMatch ? parseInt(rateMatch[1], 10) / 100 : 0;
        const vatValue = Math.round(netValue * rate * 100) / 100;
        const grossValue = Math.round((netValue + vatValue) * 100) / 100;

        item.quantity = qty;
        item.priceNetCents = Math.round(netPrice * 100);
        item.vatValueCents = Math.round(vatValue * 100);
        item.priceGrossCents = Math.round(grossValue * 100);

        newItems[index] = item;
        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productId: null, productName: '', type: 'USLUGA', quantity: 1, unit: 'szt.', priceNetCents: 0, vatRate: '23%', vatValueCents: 0, priceGrossCents: 0 }]);
    };

    const removeItem = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    // Podsumowanie
    const totals = useMemo(() => {
        let totalNet = 0;
        let totalVat = 0;
        const vatGroups: Record<string, { net: number, vat: number }> = {};

        items.forEach(item => {
            const qty = item.quantity || 0;
            const netPrice = item.priceNetCents || 0;
            const itemNet = Math.round(qty * netPrice);
            const itemVat = item.vatValueCents || 0;

            totalNet += itemNet;
            totalVat += itemVat;

            const rate = item.vatRate || 'zw';
            if (!vatGroups[rate]) vatGroups[rate] = { net: 0, vat: 0 };
            vatGroups[rate].net += itemNet;
            vatGroups[rate].vat += itemVat;
        });

        return {
            totalNet,
            totalVat,
            totalGross: totalNet + totalVat,
            vatGroups
        };
    }, [items]);

    // Walidacja
    const isFormValid = useMemo(() => {
        const hasInvoiceNumber = !!invoiceNumber.trim();
        const hasClient = !!clientId || !!clientName || !!nip;
        const hasDate = !!issueDate;
        const hasItems = items.length > 0 && items.every(i => !!i.productName && (i.priceNetCents || 0) >= 0 && (i.quantity || 0) > 0);

        const state = { hasInvoiceNumber, hasClient, hasDate, hasItems, itemsCount: items.length, clientId, clientName, nip };
        console.log("Validation state:", state);

        return hasInvoiceNumber && hasClient && hasDate && hasItems;
    }, [invoiceNumber, clientId, clientName, nip, issueDate, items]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        console.log("SUBMIT START", {
            type,
            invoiceNumber,
            clientId,
            clientName,
            nip,
            items,
            totals
        });

        if (!isFormValid) {
            setShowValidation(true);
            console.warn("SUBMIT BLOCKED", {
                reason: "Form validation failed",
                isFormValid,
                invoiceNumber: !!invoiceNumber.trim(),
                hasClient: !!clientId || !!clientName || !!nip,
                hasDate: !!issueDate,
                itemsValid: items.length > 0 && items.every(i => !!i.productName && (i.priceNetCents || 0) >= 0 && (i.quantity || 0) > 0)
            });
            alert("Nie można wystawić dokumentu. Proszę uzupełnić wszystkie wymagane pola (zaznaczone na czerwono).");
            return;
        }

        setIsSubmitting(true);
        try {
            const invoicePayload: Partial<InvoiceData> = {
                type,
                number: invoiceNumber,
                clientId: clientId || undefined,
                nip: nip || undefined,
                issueDate: new Date(issueDate),
                dueDate: new Date(dueDate),
                currency,
                totalNetCents: totals.totalNet,
                totalVatCents: totals.totalVat,
                totalGrossCents: totals.totalGross,
                isPaid
            };

            const itemsPayload = items.map(item => {
                const qty = item.quantity || 0;
                const unitPrice = item.priceNetCents || 0;
                const lineNet = Math.round(qty * unitPrice);

                return {
                    productId: item.productId || null,
                    productName: item.productName || '',
                    type: item.type || 'USLUGA',
                    quantity: Number(qty),
                    unit: item.unit || 'szt.',
                    // --- TICKET 19.10: Financial data required by InvoiceService ---
                    netPrice: Number(unitPrice / 100),
                    netValue: Number(lineNet / 100),
                    vatValue: Number((item.vatValueCents || 0) / 100),
                    grossValue: Number((item.priceGrossCents || 0) / 100),
                    vatRate: item.vatRate!,
                    priceNetCents: Number(lineNet),
                    vatValueCents: Number(item.vatValueCents!),
                    priceGrossCents: Number(item.priceGrossCents!)
                } as InvoiceItemData;
            });

            console.log("SENDING TO API", { invoicePayload, itemsPayload });
            await onSubmit(invoicePayload, itemsPayload);
            console.log("SUBMIT SUCCESS");
            onClose();
        } catch (error: any) {
            console.error("CRITICAL ERROR DURING SUBMIT:", error);
            alert("BŁĄD SYSTEMOWY: " + (error.message || "Wystąpił nieoczekiwany problem podczas zapisu dokumentu. Sprawdź konsolę (F12) po więcej szczegółów."));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    // Error Boundary — fallback UI zamiast crash
    if (loadError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
                <div className="bg-slate-900 border border-rose-500/30 rounded-3xl p-10 max-w-md text-center shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-6" />
                    <h2 className="text-xl font-black text-rose-400 mb-3">Błąd ładowania danych dokumentu</h2>
                    <p className="text-slate-400 text-sm mb-8">{loadError}</p>
                    <button
                        onClick={() => { setLoadError(null); onClose(); }}
                        className="bg-rose-600 hover:bg-rose-500 text-white px-8 py-3 rounded-xl font-bold transition-all"
                    >
                        Zamknij
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden animate-in fade-in duration-300">
            {/* Top Bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-indigo-500/20 rounded-xl">
                        <Calculator className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{initialData ? 'EDYCJA DOKUMENTU' : 'KREATOR DOKUMENTU'}</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{initialData ? `Korekta faktury: ${initialData.number || initialData.invoiceNumber}` : `Nowa faktura ${type === 'SALE' ? 'sprzedaży' : 'zakupu'}`}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {initialData && (
                        <button
                            type="button"
                            onClick={handleGeneratePdf}
                            className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Generuj PDF
                        </button>
                    )}
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
                    >
                        <X className="w-6 h-6 text-slate-400 group-hover:text-white" />
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                {/* Section 1: Nagłówek Dokumentu */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Info className="w-4 h-4" /> Dane Kontrahenta
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="relative">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Wybierz Kontrahenta (NIP / Nazwa)</label>
                                <div className="relative">
                                    <input
                                        ref={clientInputRef}
                                        type="text"
                                        disabled={isSubmitting}
                                        placeholder="Zacznij pisać aby wyszukać..."
                                        value={clientSearch || clientName}
                                        onChange={(e) => {
                                            setClientSearch(e.target.value);
                                            setClientName(e.target.value);
                                            if (!e.target.value) {
                                                setClientId('');
                                                setNip('');
                                            }
                                        }}
                                        className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 ${(showValidation && !clientId && !clientName) ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-800'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />

                                    {clientSearch && filteredClients.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                            {filteredClients.map(client => (
                                                <button
                                                    key={client.id}
                                                    type="button"
                                                    onClick={() => {
                                                        handleClientSelect(client);
                                                        setClientSearch('');
                                                    }}
                                                    className="w-full px-4 py-3 text-left hover:bg-slate-800 flex flex-col gap-1 transition-colors border-b border-slate-800/50 last:border-0"
                                                >
                                                    <span className="text-xs font-black text-white">{client.name}</span>
                                                    <span className="text-[10px] text-slate-500">NIP: {client.nip} | {client.city}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Dane Adresowe</label>
                                <div className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-base text-slate-400 italic min-h-[50px] flex items-center">
                                    {clientAddress || "Wybierz klienta, aby uzupełnić dane..."}
                                </div>
                            </div>
                            {nip && (
                                <div className="md:col-span-2 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Wybrany NIP:</span>
                                        <span className="text-xs font-bold text-slate-300">{nip}</span>
                                    </div>
                                    {bankAccountNumber && (
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Nr konta:</span>
                                            <span className="text-xs font-bold text-slate-300 font-mono italic opacity-80">{bankAccountNumber.replace(/(.{2})(.{4})(.{4})(.{4})(.{4})(.{4})(.{4})/, '$1 $2 $3 $4 $5 $6 $7')}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Calculator className="w-4 h-4" /> Parametry Faktury
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Numer Dokumentu</label>
                                <input
                                    type="text"
                                    required
                                    disabled={isSubmitting}
                                    placeholder="np. FV/2026/02/001"
                                    value={invoiceNumber}
                                    onChange={(e) => setInvoiceNumber(e.target.value)}
                                    className={`w-full bg-slate-950 border rounded-xl px-4 py-3 text-base focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all ${(showValidation && !invoiceNumber.trim()) ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-800'} ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setType('SALE')}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${type === 'SALE' ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    Sprzedaż
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setType('PURCHASE')}
                                    className={`py-3 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${type === 'PURCHASE' ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                                >
                                    Zakup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-900/20 p-6 rounded-3xl border border-slate-800/40">
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data wystawienia</label>
                        <input type="date" value={issueDate} onChange={e => setIssueDate(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-base [color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Data sprzedaży</label>
                        <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-base [color-scheme:dark]" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Termin płatności</label>
                        <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-base [color-scheme:dark]" />
                    </div>
                    <div className="flex items-end pb-1 gap-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={isPaid}
                                onChange={e => setIsPaid(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-200 transition-colors">Oznacz jako opłacone</span>
                        </label>
                    </div>
                </div>

                {/* Section 2: Tabela Pozycji (Detail) */}
                <div className="bg-slate-900/40 rounded-3xl border border-slate-800">
                    <div className="p-4 border-b border-slate-800 bg-slate-800/20 flex justify-between items-center">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">Pozycje Faktury</h3>
                        <button
                            type="button"
                            onClick={addItem}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <Plus className="w-4 h-4" /> Dodaj Pozycję
                        </button>
                    </div>

                    <div className="overflow-visible pb-4">
                        <div className="min-w-[1100px]">
                            {/* Headery Flexboxowe */}
                            <div className="flex bg-slate-950 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800">
                                <div className="w-12 px-4 py-3 text-center">Lp.</div>
                                <div className="flex-1 px-4 py-3">Produkt / Usługa</div>
                                <div className="w-24 px-4 py-3 text-center">Ilość</div>
                                <div className="w-20 px-4 py-3 text-center">J.m.</div>
                                <div className="w-28 px-4 py-3 text-right">Cena Netto</div>
                                <div className="w-28 px-4 py-3 text-right">Wartość Netto</div>
                                <div className="w-24 px-4 py-3 text-center">VAT</div>
                                <div className="w-28 px-4 py-3 text-right">Wartość VAT</div>
                                <div className="w-32 px-4 py-3 text-right">Brutto</div>
                                <div className="w-12 px-4 py-3"></div>
                            </div>

                            <div className="divide-y divide-slate-800">
                                {items.map((item, index) => {
                                    const netVal = Math.round((item.quantity || 0) * (item.priceNetCents || 0)) / 100;
                                    const vatVal = (item.vatValueCents || 0) / 100;

                                    return (
                                        <div key={index} className={`flex transition-colors duration-150 group items-center hover:bg-slate-800/20 ${activeRowSearch === index ? 'relative z-50 overflow-visible bg-slate-800/30' : 'relative'}`}>

                                            <div className="w-12 px-4 py-4 text-xs font-bold text-slate-600 text-center">{index + 1}</div>

                                            <div className="flex-1 px-4 py-4 relative">
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Wpisz nazwę lub wybierz..."
                                                        value={item.productName || ''}
                                                        onFocus={() => setActiveRowSearch(index)}
                                                        onChange={(e) => updateItem(index, { productName: e.target.value, productId: null })}
                                                        className={`w-full bg-transparent border border-slate-800/60 rounded-lg px-3 py-1.5 text-base font-normal h-[38px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-800 outline-none pr-16 transition-colors ${(showValidation && !item.productName) ? 'border-rose-500 ring-1 ring-rose-500/50' : ''}`}
                                                    />
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                                        {item.productId ? (
                                                            item.type === 'TOWAR' ? (
                                                                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[8px] font-black border border-emerald-500/20 uppercase tracking-tighter opacity-60">
                                                                    TOWAR
                                                                </span>
                                                            ) : (
                                                                <span className="px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[8px] font-black border border-sky-500/20 uppercase tracking-tighter opacity-60">
                                                                    USŁUGA
                                                                </span>
                                                            )
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                title="Przełącz typ pozycji (Towar/Usługa)"
                                                                onClick={() => updateItem(index, { type: item.type === 'TOWAR' ? 'USLUGA' : 'TOWAR' })}
                                                                className={`px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-tighter transition-all hover:scale-105 active:scale-95 ${item.type === 'TOWAR'
                                                                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/20'
                                                                    : 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                                                                    }`}
                                                            >
                                                                {item.type === 'TOWAR' ? 'TOWAR' : 'USŁUGA'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {activeRowSearch === index && (
                                                        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-slate-900 border border-slate-700 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] overflow-hidden max-h-64 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
                                                            {(availableProducts || [])
                                                                .filter(p => !item.productName || p.name.toLowerCase().includes(item.productName.toLowerCase()))
                                                                .map(p => (
                                                                    <button
                                                                        key={p.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            updateItem(index, { productId: p.id, productName: p.name });
                                                                            setActiveRowSearch(null);
                                                                        }}
                                                                        className="w-full px-4 py-3 text-left hover:bg-slate-800 flex justify-between items-center border-b border-slate-800/50 last:border-0 transition-colors"
                                                                    >
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-white">{p.name}</span>
                                                                            <span className="text-[10px] text-slate-500">{p.type === 'TOWAR' ? 'Towar' : 'Usługa'} | VAT: {p.vatRate}</span>
                                                                        </div>
                                                                        <div className="text-right">
                                                                            {p.type === 'TOWAR' ? (
                                                                                <span className={`text-xs font-bold ${p.totalQuantity === 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                                                                                    {p.totalQuantity} {p.unit}
                                                                                </span>
                                                                            ) : (
                                                                                <span className="text-xs text-slate-500 font-black opacity-40">∞</span>
                                                                            )}
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            {(dictionaries['SERVICE_TYPE'] || [])
                                                                .filter(s => !item.productName || s.value.toLowerCase().includes(item.productName.toLowerCase()))
                                                                .map(s => (
                                                                    <button
                                                                        key={s.id}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            updateItem(index, {
                                                                                productId: null,
                                                                                productName: s.value,
                                                                                vatRate: s.code || '23%',
                                                                                unit: 'usł.'
                                                                            });
                                                                            setActiveRowSearch(null);
                                                                        }}
                                                                        className="w-full px-4 py-3 text-left hover:bg-slate-800 flex items-center gap-2 border-b border-slate-800/50 last:border-0 transition-colors"
                                                                    >
                                                                        <Info className="w-3 h-3 text-sky-400" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-bold text-slate-300">{s.value}</span>
                                                                            <span className="text-[10px] text-slate-500">Usługa systemowa</span>
                                                                        </div>
                                                                    </button>
                                                                ))}
                                                            {item.productName && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => setActiveRowSearch(null)}
                                                                    className="w-full px-4 py-3 text-left hover:bg-slate-800 text-[10px] font-black uppercase text-indigo-400 text-center transition-colors border-t border-slate-800"
                                                                >
                                                                    Użyj: "{item.productName}"
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="w-24 px-4 py-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, { quantity: parseFloat(e.target.value) || 0 })}
                                                    className="w-full bg-transparent border border-slate-800/60 rounded-lg px-3 py-1.5 text-base font-normal h-[38px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-800 outline-none text-center transition-colors"
                                                />
                                            </div>

                                            <div className="w-20 px-4 py-4">
                                                <select
                                                    value={item.unit}
                                                    onChange={(e) => updateItem(index, { unit: e.target.value })}
                                                    className="w-full bg-transparent border border-slate-800/60 rounded-lg px-2 py-1.5 text-base font-normal h-[38px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-800 outline-none transition-colors"
                                                >
                                                    {(dictionaries['UNIT'] || []).map(u => (
                                                        <option key={u.id} value={u.code}>{u.value}</option>
                                                    ))}
                                                    {!dictionaries['UNIT'] && <option value="szt.">szt.</option>}
                                                </select>
                                            </div>

                                            <div className="w-28 px-4 py-4">
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0,00"
                                                    value={item.priceNetCents ? item.priceNetCents / 100 : ''}
                                                    onChange={(e) => updateItem(index, { priceNetCents: toCents(e.target.value) })}
                                                    className="w-full bg-transparent border border-slate-800/60 rounded-lg px-3 py-1.5 text-base font-normal h-[38px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-800 outline-none text-right transition-colors"
                                                />
                                            </div>

                                            <div className="w-28 px-3 py-3 text-right text-base font-normal text-slate-400">
                                                {netVal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                                            </div>

                                            <div className="w-24 px-4 py-4">
                                                <select
                                                    value={item.vatRate}
                                                    onChange={(e) => updateItem(index, { vatRate: e.target.value })}
                                                    className="w-full bg-transparent border border-slate-800/60 rounded-lg px-2 py-1.5 text-base font-normal h-[38px] focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-slate-800 outline-none transition-colors"
                                                >
                                                    {(dictionaries['TAX_RATE'] || []).map(r => (
                                                        <option key={r.id} value={r.value}>{r.value}</option>
                                                    ))}
                                                    {!dictionaries['TAX_RATE'] && (
                                                        <>
                                                            <option value="23%">23%</option>
                                                            <option value="8%">8%</option>
                                                            <option value="5%">5%</option>
                                                            <option value="0%">0%</option>
                                                            <option value="zw">zw.</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>

                                            <div className="w-28 px-3 py-3 text-right text-base font-normal text-indigo-400/60">
                                                {vatVal.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                                            </div>

                                            <div className="w-32 px-3 py-3 text-right font-semibold text-base">
                                                {fromCents(item.priceGrossCents || 0)}
                                            </div>

                                            <div className="w-12 px-4 py-4 text-center">
                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(index)}
                                                        className="p-1.5 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                        title="Usuń pozycję"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                </div >


                {/* Section 3: Podsumowanie (Footer) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-800">
                        <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Zestawienie VAT</h3>
                        <div className="space-y-2">
                            {Object.entries(totals.vatGroups).map(([rate, vals]) => (
                                <div key={rate} className="flex justify-between items-center py-2 border-b border-slate-800/50">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stawka {rate}</span>
                                    <div className="flex gap-6 text-xs">
                                        <div className="text-right">
                                            <span className="text-slate-500 text-[10px] mr-2">NETTO:</span>
                                            <span className="font-bold">{fromCents(vals.net)} zł</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-slate-500 text-[10px] mr-2">VAT:</span>
                                            <span className="font-bold text-indigo-400">{fromCents(vals.vat)} zł</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {Object.keys(totals.vatGroups).length === 0 && (
                                <p className="text-slate-500 italic text-xs">Brak pozycji do rozliczenia.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-800/50 shadow-2xl text-white flex flex-col sm:flex-row justify-between items-end gap-8 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                        <div className="flex flex-col gap-6 text-left relative z-10">
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Całkowita wartość Netto</span>
                                <span className="text-2xl font-bold text-slate-200">{fromCents(totals.totalNet)} PLN</span>
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Podatek VAT łącznie</span>
                                <span className="text-2xl font-bold text-indigo-400">{fromCents(totals.totalVat)} PLN</span>
                            </div>
                        </div>

                        <div className="text-right relative z-10">
                            <span className="block text-[8px] font-black uppercase tracking-[0.3em] bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full mb-3 inline-block border border-indigo-500/30">DO ZAPŁATY</span>
                            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm">{fromCents(totals.totalGross)} <span className="text-xl opacity-40 font-bold ml-1">PLN</span></div>
                        </div>
                    </div>
                </div >

                {/* Submit Area */}
                <div className="flex justify-end gap-4 py-8">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                    >
                        Anuluj i wróć
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5" />
                        )}
                        {initialData ? 'Zapisz Zmiany' : 'Wystaw Dokument'}
                    </button>
                </div>
            </form>

            <div className="px-8 py-3 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4">
                <span>PRODECO ERP Core v2.0.26</span>
                <span className="flex items-center gap-2 text-center md:text-right">
                    <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                    Wszystkie obliczenia są spójne z formatem KSeF FA(2)
                </span>
            </div>
        </div>
    );
};
