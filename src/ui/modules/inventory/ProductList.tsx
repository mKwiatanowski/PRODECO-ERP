import React, { useEffect, useState, useMemo } from 'react';
import { ResizableTh } from '../../components/ResizableTh';
import { Search, History } from 'lucide-react';
import { ProductHistoryModal } from './ProductHistoryModal';

// Define the shape of the data based on Entity
import { StockLevel } from '../../../api/api';

export const ProductList: React.FC = () => {
    const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<{ id: string, name: string } | null>(null);

    const fetchData = async () => {
        try {
            const data = await window.electron.inventory.getAll();
            setStockLevels(data);
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const filteredProducts = useMemo(() => {
        return stockLevels.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });
    }, [stockLevels, searchTerm]);

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar: Omni-search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-2">
                <div className="relative flex-1">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Omni-Search: Szukaj produktu po nazwie..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all shadow-inner"
                    />
                </div>
            </div>

            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-3xl flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* Scrollable Container */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="min-w-max w-full text-left text-slate-300 border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800">
                            <tr>
                                <ResizableTh tableId="inventory_products" columnId="name" initialWidth={250} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Nazwa Produktu</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="unit" initialWidth={80} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">J.M.</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="quantity" initialWidth={120} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Ilość</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="value" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Wartość (FIFO)</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="vat" initialWidth={80} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">VAT</ResizableTh>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right w-24">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        Brak wyników do wyświetlenia.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => {
                                    return (
                                        <tr key={product.productId} className="hover:bg-slate-700/50 transition-colors duration-150">
                                            <td className="px-6 py-4 font-medium text-white overflow-hidden text-ellipsis whitespace-nowrap" title={product.name}>
                                                {product.name}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs uppercase tracking-wide">
                                                {product.unit}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className={`font-mono text-sm font-bold ${Number(product.totalQuantity) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {product.totalQuantity}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-mono text-sm text-sky-400 font-semibold">
                                                    {Number(product.fifoValue).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                                                {product.vatRate}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedProduct({ id: product.productId, name: product.name })}
                                                    className="p-1.5 hover:bg-slate-600 rounded-lg text-slate-400 hover:text-white transition-all group"
                                                    title="Pokaż historię ruchów (Karta Towaru)"
                                                >
                                                    <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-slate-900/60 border-t border-slate-800/60 px-6 py-4 text-sm text-slate-400 flex justify-between items-center">
                    <div>
                        Łącznie pozycji (filtrowane): <span className="text-white font-bold">{filteredProducts.length}</span>
                    </div>
                    <div className="flex gap-6">
                        <div className="text-slate-500 uppercase text-[10px] tracking-widest font-bold self-center">Podsumowanie Magazynu:</div>
                        <div className="bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-700/50">
                            <span className="text-slate-500 mr-2 italic">Wartość magazynu:</span>
                            <span className="text-emerald-400 font-mono font-bold text-lg">
                                {filteredProducts.reduce((sum, p) => sum + Number(p.fifoValue), 0).toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' })}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {selectedProduct && (
                <ProductHistoryModal
                    productId={selectedProduct.id}
                    productName={selectedProduct.name}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};
