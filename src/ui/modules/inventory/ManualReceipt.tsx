import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export const ManualReceipt: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        productId: '',
        batchNumber: '',
        quantity: '',
        price: '',
        categoryId: ''
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            formData.batchNumber.trim() !== '' &&
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
                quantity: parseFloat(formData.quantity),
                price: parseFloat(formData.price)
            });

            toast.success('Towar dodany pomyślnie!', {
                icon: '📦',
                duration: 4000
            });

            setFormData({ productId: '', batchNumber: '', quantity: '', price: '', categoryId: '' });
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error("Failed to add stock", error);
            toast.error('Błąd podczas dodawania towaru.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-slate-900 p-6 rounded-xl shadow-2xl border border-slate-700 w-full">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="text-emerald-500">📥</span> Przyjęcie Towaru
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="productId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Nazwa Produktu / ID <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="productId"
                            id="productId"
                            value={formData.productId}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                            placeholder="np. CEMENT-PORTLAND-25KG"
                        />
                    </div>
                    <div>
                        <label htmlFor="categoryId" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Kategoria
                        </label>
                        <select
                            name="categoryId"
                            id="categoryId"
                            value={formData.categoryId}
                            onChange={(e: any) => handleChange(e)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all appearance-none"
                        >
                            <option value="">-- Wybierz Kategorię --</option>
                            {categories.map(c => (
                                <option key={c.id} value={c.id}>{c.value}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="batchNumber" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Numer Partii <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="batchNumber"
                            id="batchNumber"
                            value={formData.batchNumber}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
                            placeholder="np. PARTIA-2023/10"
                        />
                    </div>
                    <div>
                        <label htmlFor="quantity" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                            Ilość <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="0.01"
                            step="0.01"
                            value={formData.quantity}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono"
                            placeholder="0.00"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="price" className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Cena Zakupu (Netto) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-3 text-slate-500 font-medium">PLN</span>
                        <input
                            type="number"
                            name="price"
                            id="price"
                            min="0.00"
                            step="0.01"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-14 pr-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all font-mono"
                            placeholder="0.00"
                        />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 text-right">Wartość całkowita: {((parseFloat(formData.quantity) || 0) * (parseFloat(formData.price) || 0)).toFixed(2)} PLN</p>
                </div>

                <button
                    type="submit"
                    disabled={!isValid() || isSubmitting}
                    className={`w-full font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg flex items-center justify-center gap-2
                        ${isValid() && !isSubmitting
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-900/20 transform hover:-translate-y-0.5'
                            : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'
                        }`}
                >
                    {isSubmitting ? 'Przetwarzanie...' : 'Zatwierdź Przyjęcie'}
                </button>
            </form>
        </div>
    );
};
