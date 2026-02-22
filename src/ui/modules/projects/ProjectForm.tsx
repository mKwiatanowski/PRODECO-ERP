import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, FileText, User, Box, Layers, Play } from 'lucide-react';

interface ProjectFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

interface InventoryItem {
    id: string;
    productId: string;
    remainingQuantity: number;
    purchasePrice: number;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSuccess, onCancel }) => {
    const [name, setName] = useState('');
    const [clientName, setClientName] = useState('');
    const assignedEmployeeId = 'EMP-001'; // Mocked for now

    const [materials, setMaterials] = useState<{ productId: string, quantity: number }[]>([]);
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchInventory = async () => {
            try {
                // @ts-ignore
                const data = await window.electron.getInventory();

                // Group by productId to get total available
                const grouped = data.reduce((acc: any, batch: InventoryItem) => {
                    if (!acc[batch.productId]) {
                        acc[batch.productId] = { ...batch, remainingQuantity: 0 };
                    }
                    acc[batch.productId].remainingQuantity += batch.remainingQuantity;
                    return acc;
                }, {});

                setInventory(Object.values(grouped));
            } catch (error) {
                console.error("Failed to fetch inventory", error);
            }
        };
        fetchInventory();
    }, []);

    const addMaterial = () => {
        setMaterials([...materials, { productId: '', quantity: 1 }]);
    };

    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleMaterialChange = (index: number, field: string, value: string | number) => {
        const newMaterials = [...materials];
        // @ts-ignore
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation for materials
        for (const mat of materials) {
            if (!mat.productId) {
                toast.error('Wybierz produkt dla każdej pozycji materiałowej.');
                return;
            }
            if (mat.quantity <= 0) {
                toast.error(`Ilość dla ${mat.productId} musi być większa niż 0.`);
                return;
            }

            const stock = inventory.find(i => i.productId === mat.productId);
            if (!stock || stock.remainingQuantity < mat.quantity) {
                toast.error(`Niewystarczająca ilość towaru ${mat.productId} na magazynie. Dostępne: ${stock?.remainingQuantity || 0}`);
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const dto = {
                name,
                clientName,
                assignedEmployeeId,
                materialsToConsume: materials.map(m => ({
                    productId: m.productId,
                    quantity: Number(m.quantity)
                }))
            };

            // @ts-ignore
            await window.electron.createProject(dto);

            toast.success('Projekt utworzony pomyślnie! Towar został pobrany z magazynu.', {
                duration: 5000,
                icon: '🏗️'
            });

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Błąd podczas tworzenia projektu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-slate-950 text-slate-100 min-h-full">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-blue-500/10 rounded-xl">
                        <span className="text-2xl">🏗️</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Nowy Projekt</h2>
                        <p className="text-slate-400 text-sm">Zdefiniuj projekt i przypisz materiały z magazynu</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-slate-800">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <FileText className="w-4 h-4" /> Nazwa Projektu
                            </label>
                            <input
                                title="Nazwa Projektu"
                                placeholder="np. Ogród japoński - realizacja"
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <User className="w-4 h-4" /> Klient
                            </label>
                            <input
                                title="Klient"
                                placeholder="Nazwa klienta"
                                type="text"
                                required
                                value={clientName}
                                onChange={e => setClientName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-600"
                            />
                        </div>
                    </div>

                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" /> Materiały z Magazynu (Kosztorys)
                            </h3>
                            <button
                                type="button"
                                onClick={addMaterial}
                                className="flex items-center gap-2 text-sm bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
                            >
                                <Plus className="w-4 h-4" /> Dodaj Materiał
                            </button>
                        </div>

                        {materials.length === 0 && (
                            <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-slate-800/50 text-slate-500 text-sm">
                                Brak przypisanych materiałów. Projekt zostanie utworzony tylko z kosztami robocizny.
                            </div>
                        )}

                        <div className="space-y-3">
                            {materials.map((mat, index) => {
                                const stock = inventory.find(i => i.productId === mat.productId);
                                const isOverStock = stock && stock.remainingQuantity < mat.quantity;

                                return (
                                    <div key={index} className={`grid grid-cols-12 gap-4 items-end bg-slate-950/50 p-4 rounded-xl border ${isOverStock ? 'border-red-500/50' : 'border-slate-800/50'} hover:border-blue-500/30 transition-colors group`}>
                                        <div className="col-span-6">
                                            <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Wybierz Produkt</label>
                                            <div className="relative">
                                                <Box className="absolute left-3 top-2.5 w-4 h-4 text-slate-600" />
                                                <select
                                                    title="Wybierz Produkt"
                                                    required
                                                    value={mat.productId}
                                                    onChange={e => handleMaterialChange(index, 'productId', e.target.value)}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-blue-500 outline-none transition-colors appearance-none"
                                                >
                                                    <option value="">-- Wybierz towar --</option>
                                                    {inventory.map(item => (
                                                        <option key={item.productId} value={item.productId}>
                                                            {item.productId} (Dostępne: {item.remainingQuantity})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-span-4">
                                            <label className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wide">Ilość do zużycia</label>
                                            <input
                                                title="Ilość do zużycia"
                                                placeholder="Ilość"
                                                type="number"
                                                required
                                                min="0.01"
                                                step="0.01"
                                                value={mat.quantity}
                                                onChange={e => handleMaterialChange(index, 'quantity', e.target.value)}
                                                className={`w-full bg-slate-900 border ${isOverStock ? 'border-red-500 text-red-400' : 'border-slate-700 text-white'} rounded-lg px-3 py-2 text-sm focus:border-blue-500 outline-none transition-colors font-mono text-center`}
                                            />
                                            {isOverStock && (
                                                <span className="text-xs text-red-500 mt-1 block">Brakuje na stanie!</span>
                                            )}
                                        </div>
                                        <div className="col-span-2 flex justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeMaterial(index)}
                                                className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                                title="Usuń pozycję"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
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
                            className={`flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>Przetwarzanie...</>
                            ) : (
                                <><Play className="w-5 h-5" /> Rozpocznij Projekt</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
