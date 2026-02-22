import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, FileText, User, Calendar, Box, Layers } from 'lucide-react';

interface PurchaseInvoiceFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const PurchaseInvoiceForm: React.FC<PurchaseInvoiceFormProps> = ({ onSuccess, onCancel }) => {
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [vendorName, setVendorName] = useState('');
    const [supplierNip, setSupplierNip] = useState('');
    const [supplierAddress, setSupplierAddress] = useState('');
    const [isMpp, setIsMpp] = useState(false);
    const [ksefId, setKsefId] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [items, setItems] = useState<{ productId: string, batchNumber: string, quantity: number, netPrice: number, vatRate: string, vatAmount: number, grossPrice: number }[]>([
        { productId: '', batchNumber: '', quantity: 1, netPrice: 0, vatRate: '23%', vatAmount: 0, grossPrice: 0 }
    ]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [totalNetAmount, setTotalNetAmount] = useState(0);
    const [totalVatAmount, setTotalVatAmount] = useState(0);
    const [totalGrossAmount, setTotalGrossAmount] = useState(0);

    const parseVatRate = (rateString: string): number => {
        const cleaned = rateString.replace('%', '');
        return Number(cleaned) || 0;
    };

    // Calculate total whenever items change
    useEffect(() => {
        let net = 0;
        let vat = 0;
        let gross = 0;
        items.forEach(item => {
            net += item.quantity * item.netPrice;
            vat += item.quantity * item.vatAmount;
            gross += item.quantity * item.grossPrice;
        });
        setTotalNetAmount(net);
        setTotalVatAmount(vat);
        setTotalGrossAmount(gross);
    }, [items]);

    const handleItemChange = (index: number, field: string, value: string | number | boolean) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;

        // Auto calculate VAT and Gross
        if (field === 'netPrice' || field === 'vatRate' || field === 'quantity') {
            const netPrice = Number(newItems[index].netPrice) || 0;
            const vatRate = parseVatRate(newItems[index].vatRate);
            const vatAmount = netPrice * (vatRate / 100);
            const grossPrice = netPrice + vatAmount;

            newItems[index].vatAmount = vatAmount;
            newItems[index].grossPrice = grossPrice;
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { productId: '', batchNumber: '', quantity: 1, netPrice: 0, vatRate: '23%', vatAmount: 0, grossPrice: 0 }]);
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (items.some(item => !item.productId || !item.batchNumber || item.quantity <= 0 || item.netPrice < 0)) {
            toast.error('Proszę wypełnić poprawnie wszystkie pozycje.');
            return;
        }

        setIsSubmitting(true);
        try {
            const dto = {
                invoiceNumber,
                vendorName,
                supplierNip,
                supplierAddress,
                invoiceDate,
                isMpp,
                ksefId: ksefId || undefined,
                items: items.map(item => ({
                    ...item,
                    quantity: Number(item.quantity),
                    netPrice: Number(item.netPrice),
                    vatAmount: Number(item.vatAmount),
                    grossPrice: Number(item.grossPrice)
                }))
            };
            // @ts-ignore
            await window.electron.createInvoice(dto);

            toast.success('Faktura zakupu zapisana pomyślnie! Stany magazynowe zaktualizowane.', {
                duration: 5000,
                icon: '🧾'
            });

            // Reset form
            setInvoiceNumber('');
            setVendorName('');
            setSupplierNip('');
            setSupplierAddress('');
            setIsMpp(false);
            setKsefId('');
            setItems([{ productId: '', batchNumber: '', quantity: 1, netPrice: 0, vatRate: '23%', vatAmount: 0, grossPrice: 0 }]);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error(error);
            toast.error('Błąd podczas zapisywania faktury.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-slate-950 text-slate-100 min-h-full">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <span className="text-2xl">💰</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Nowa Faktura Zakupu</h2>
                        <p className="text-slate-400 text-sm">Wprowadź fakturę i zaktualizuj stany magazynowe</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
                    {/* Header Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pb-8 border-b border-slate-800">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <FileText className="w-4 h-4" /> Numer Faktury
                            </label>
                            <input
                                type="text"
                                required
                                value={invoiceNumber}
                                onChange={e => setInvoiceNumber(e.target.value)}
                                aria-label="Numer Faktury"
                                title="Podaj numer faktury z dokumentu"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                placeholder="np. FV/2026/02/101"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <User className="w-4 h-4" /> Dostawca
                            </label>
                            <input
                                type="text"
                                required
                                value={vendorName}
                                onChange={e => setVendorName(e.target.value)}
                                aria-label="Nazwa Dostawcy"
                                title="Podaj nazwę dostawcy"
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                placeholder="Nazwa Firmy"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <User className="w-4 h-4" /> NIP
                            </label>
                            <input
                                type="text"
                                required
                                value={supplierNip}
                                onChange={e => setSupplierNip(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600 font-mono tracking-wider"
                                placeholder="0000000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Calendar className="w-4 h-4" /> Data Wystawienia
                            </label>
                            <input
                                type="date"
                                required
                                value={invoiceDate}
                                onChange={e => setInvoiceDate(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 lg:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Adres Dostawcy
                            </label>
                            <input
                                type="text"
                                required
                                value={supplierAddress}
                                onChange={e => setSupplierAddress(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                                placeholder="Ulica, Kod, Miasto"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                KSeF ID (Opcjonalnie)
                            </label>
                            <input
                                type="text"
                                value={ksefId}
                                onChange={e => setKsefId(e.target.value)}
                                maxLength={40}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600 font-mono text-sm uppercase tracking-wider"
                                placeholder="NUMER KSEF"
                            />
                        </div>
                        <div className="space-y-2 flex flex-col justify-end pb-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isMpp}
                                    onChange={e => setIsMpp(e.target.checked)}
                                    className="w-5 h-5 rounded border-slate-700 bg-slate-950 text-indigo-500 focus:ring-indigo-500/50 focus:ring-offset-slate-900"
                                />
                                <span className="text-sm font-semibold text-slate-300">Mechanizm Podzielonej Płatności (MPP)</span>
                            </label>
                        </div>
                    </div>

                    {/* Items Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-indigo-400" /> Pozycje Faktury
                            </h3>
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-2 text-sm bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" /> Dodaj Pozycję
                            </button>
                        </div>

                        <div className="space-y-3">
                            {items.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-x-4 gap-y-4 items-end bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 hover:border-indigo-500/30 transition-colors group">
                                    <div className="col-span-12 lg:col-span-3">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Produkt (ID/Nazwa)</label>
                                        <div className="relative">
                                            <Box className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                                            <input
                                                type="text"
                                                required
                                                value={item.productId}
                                                onChange={e => handleItemChange(index, 'productId', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors"
                                                placeholder="Kod produktu"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-6 lg:col-span-2">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Numer Partii</label>
                                        <input
                                            type="text"
                                            required
                                            value={item.batchNumber}
                                            onChange={e => handleItemChange(index, 'batchNumber', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors font-mono"
                                            placeholder="Partia"
                                        />
                                    </div>
                                    <div className="col-span-6 lg:col-span-1">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Ilość</label>
                                        <input
                                            type="number"
                                            required
                                            min="0.01"
                                            step="0.01"
                                            aria-label="Ilość"
                                            title="Podaj ilość sztuk/jednostek"
                                            placeholder="Ilość"
                                            value={item.quantity}
                                            onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:border-indigo-500 outline-none transition-colors font-mono text-center"
                                        />
                                    </div>
                                    <div className="col-span-4 lg:col-span-2">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Cena Netto</label>
                                        <div className="relative">
                                            <span className="absolute left-2 top-2 text-xs text-slate-500">PLN</span>
                                            <input
                                                type="number"
                                                required
                                                min="0"
                                                step="0.01"
                                                aria-label="Cena Netto"
                                                title="Podaj cenę netto za jednostkę"
                                                placeholder="Cena netto"
                                                value={item.netPrice}
                                                onChange={e => handleItemChange(index, 'netPrice', e.target.value)}
                                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-2 py-2 text-sm focus:border-indigo-500 outline-none transition-colors font-mono text-right"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-4 lg:col-span-1">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">VAT</label>
                                        <select
                                            value={item.vatRate}
                                            onChange={e => handleItemChange(index, 'vatRate', e.target.value)}
                                            aria-label="Stawka VAT"
                                            title="Wybierz stawkę VAT"
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-sm focus:border-indigo-500 outline-none transition-colors cursor-pointer"
                                        >
                                            <option value="23%">23%</option>
                                            <option value="8%">8%</option>
                                            <option value="5%">5%</option>
                                            <option value="0%">0%</option>
                                            <option value="ZW">ZW</option>
                                        </select>
                                    </div>
                                    <div className="col-span-4 lg:col-span-2">
                                        <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Brutto</label>
                                        <div className="w-full bg-slate-900 border border-slate-700/50 text-slate-400 rounded-lg px-3 py-2 text-sm font-mono text-right cursor-not-allowed">
                                            {formatCurrency(item.grossPrice)}
                                        </div>
                                    </div>
                                    <div className="col-span-12 lg:col-span-1 flex justify-end lg:justify-center">
                                        {items.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeItem(index)}
                                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Usuń pozycję"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer / Calculation */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-6 border-t border-slate-800">
                        <div className="text-slate-400 text-sm">
                            Liczba pozycji: <span className="font-mono text-white">{items.length}</span>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <span>Netto: <span className="font-mono text-white">{formatCurrency(totalNetAmount)}</span></span>
                                <span>VAT: <span className="font-mono text-white">{formatCurrency(totalVatAmount)}</span></span>
                            </div>
                            <div className="text-slate-400 text-xs uppercase tracking-wider mt-1">Do Zapłaty Brutto</div>
                            <div className="text-3xl font-bold font-mono text-indigo-400">
                                {formatCurrency(totalGrossAmount)}
                            </div>
                        </div>
                    </div>
                    <div className="mt-8 flex justify-end gap-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-6 py-3 text-slate-300 hover:text-white transition-colors font-medium"
                            >
                                Anuluj
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>Przetwarzanie...</>
                            ) : (
                                <><Save className="w-5 h-5" /> Zapisz Fakturę</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
