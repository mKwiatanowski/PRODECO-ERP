import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Package, Calculator, Info, Save, X } from 'lucide-react';

export const ManualReceipt: React.FC<{ onSuccess?: () => void, onClose?: () => void }> = ({ onSuccess, onClose }) => {
    const [formData, setFormData] = useState({
        productId: '',
        quantity: '',
        price: '',
        categoryId: '',
        unit: 'szt.'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [categories, setCategories] = useState<{ id: string, value: string, code: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            // @ts-ignore
            const dicts = await window.electron.getDictionaries();
            setCategories(dicts['MATERIAL_CATEGORY'] || []);
        };
        fetchCategories();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Validation Logic
    const isValid = () => {
        const qty = parseFloat(formData.quantity);
        const price = parseFloat(formData.price);
        return (
            formData.productId.trim() !== '' &&
            !isNaN(qty) && qty > 0 &&
            !isNaN(price) && price >= 0
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid()) return;

        setIsSubmitting(true);
        try {
            // @ts-ignore
            await window.electron.addStock({
                ...formData,
                batchNumber: `AUTO-${Date.now()}`, // Generujemy automatycznie zamiast wpisu ręcznego
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price)
            });

            toast.success('Towar dodany pomyślnie!', {
                icon: '📦',
                className: 'bg-slate-900 text-white border border-slate-800 rounded-xl'
            });

            setFormData({ productId: '', quantity: '', price: '', categoryId: '', unit: 'szt.' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to add stock", error);
            toast.error('Błąd podczas dodawania towaru.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900/40 p-8 rounded-3xl border border-slate-800 shadow-2xl backdrop-blur-xl w-full">
            <div className="flex items-center gap-4 mb-8">
                <div className="p-2.5 bg-indigo-500/20 rounded-2xl">
                    <Package className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight leading-tight">PRZYJĘCIE ZEWNĘTRZNE</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">Ręczne wprowadzanie stanów magazynowych</p>
                </div>
                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="ml-auto p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Podstawowe dane */}
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4" /> Specyfikacja Towaru
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label htmlFor="productId" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Nazwa Produktu / Kod <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="productId"
                                id="productId"
                                value={formData.productId}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-base text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                placeholder="np. CEMENT PORTLAND 25KG"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="categoryId" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Kategoria
                            </label>
                            <select
                                name="categoryId"
                                id="categoryId"
                                value={formData.categoryId}
                                onChange={handleChange}
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-base text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                            >
                                <option value="" className="bg-slate-900 italic text-slate-500">Brak kategorii</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id} className="bg-slate-900">{c.value}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Ilości i ceny */}
                <div className="bg-slate-950/40 p-6 rounded-2xl border border-slate-800/50 space-y-6">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Calculator className="w-4 h-4" /> Wartości
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 flex flex-col justify-end h-full">
                            <label htmlFor="quantity" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 whitespace-nowrap">
                                Ilość <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="number"
                                name="quantity"
                                id="quantity"
                                min="0.01"
                                step="0.01"
                                value={formData.quantity}
                                onChange={handleChange}
                                className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-5 text-lg text-white font-mono placeholder-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                placeholder="0.00"
                                required
                            />
                        </div>

                        <div className="md:col-span-1 flex flex-col justify-end h-full">
                            <label htmlFor="unit" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 whitespace-nowrap">
                                Jednostka <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="unit"
                                    id="unit"
                                    aria-label="Jednostka miary"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-5 text-base font-bold text-indigo-400 uppercase tracking-widest focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-900 shadow-inner"
                                >
                                    {['szt.', 'kg', 'l', 'm', 'kpl.', 'opak.'].map(u => (
                                        <option key={u} value={u} className="bg-slate-900 text-white font-sans normal-case">{u}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-1 flex flex-col justify-end h-full">
                            <label htmlFor="price" className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1 whitespace-nowrap">
                                Cena Netto (PLN) <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="price"
                                    id="price"
                                    min="0.00"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    className="w-full h-14 bg-slate-950 border border-slate-800 rounded-2xl px-5 text-lg text-white font-mono placeholder-slate-700 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-800/50">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Wartość całkowita dostawy:</span>
                        <span className="text-lg font-black text-indigo-400">
                            {((parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0)).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} <span className="text-xs opacity-50">PLN</span>
                        </span>
                    </div>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors"
                        >
                            ANULUJ
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!isValid() || isSubmitting}
                        className={`group flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl
                            ${isValid() && !isSubmitting
                                ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/20 active:scale-95'
                                : 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                            }`}
                    >
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        )}
                        {isSubmitting ? 'PRZETWARZANIE...' : 'ZATWIERDŹ PRZYJĘCIE'}
                    </button>
                </div>
            </form>
        </div>
    );
};
