import React, { useEffect, useState, useMemo } from 'react';
import { ResizableTh } from '../../components/ResizableTh';
import { Search, Filter } from 'lucide-react';

// Define the shape of the data based on Entity
interface InventoryBatch {
    id: string;
    productId: string;
    batchNumber: string;
    originalQuantity: number;
    remainingQuantity: number;
    purchasePrice: number;
    categoryId?: string;
    createdAt: string;
}

export const ProductList: React.FC = () => {
    const [batches, setBatches] = useState<InventoryBatch[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [categories, setCategories] = useState<{ id: string, value: string }[]>([]);

    const fetchData = async () => {
        try {
            // @ts-ignore - electron is exposed via preload
            const data = await window.electron.getInventory();
            setBatches(data);

            // @ts-ignore
            const dicts = await window.electron.getDictionaries();
            setCategories(dicts['MATERIAL_CATEGORY'] || []);
        } catch (error) {
            console.error("Failed to fetch inventory data", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Helper to group by Product ID for a cleaner view
    const groupedProducts = useMemo(() => {
        const grouped = batches.reduce((acc, batch) => {
            if (!acc[batch.productId]) {
                acc[batch.productId] = {
                    name: batch.productId,
                    categoryId: batch.categoryId,
                    totalQty: 0,
                    totalValue: 0,
                    batches: []
                };
            }
            acc[batch.productId].totalQty += batch.remainingQuantity;
            acc[batch.productId].totalValue += batch.remainingQuantity * batch.purchasePrice;
            acc[batch.productId].batches.push(batch);
            return acc;
        }, {} as Record<string, { name: string, categoryId?: string, totalQty: number, totalValue: number, batches: InventoryBatch[] }>);

        return Object.values(grouped).filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = categoryFilter === '' || product.categoryId === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [batches, searchTerm, categoryFilter]);

    const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

    const toggleExpand = (productName: string) => {
        if (expandedProduct === productName) {
            setExpandedProduct(null);
        } else {
            setExpandedProduct(productName);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Toolbar: Omni-search and category filter */}
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
                <div className="relative w-full sm:w-64">
                    <Filter className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        aria-label="Filter by Category"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-10 py-2.5 text-slate-300 focus:ring-2 focus:ring-emerald-500/50 outline-none transition-all appearance-none cursor-pointer"
                    >
                        <option value="">Wszystkie Kategorie</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.value}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 flex flex-col flex-1 min-h-0">
                {/* Scrollable Container */}
                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                    <table className="min-w-max w-full text-left text-slate-300 border-collapse table-fixed">
                        <thead className="sticky top-0 z-10 bg-slate-800 shadow-md">
                            <tr>
                                <ResizableTh tableId="inventory_products" columnId="name" initialWidth={250} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Nazwa Produktu</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="category" initialWidth={180} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700">Kategoria Systemowa</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="quantity" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Ilość Całkowita</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="avgPrice" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Średnia Cena</ResizableTh>
                                <ResizableTh tableId="inventory_products" columnId="totalValue" initialWidth={150} className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right">Wartość</ResizableTh>
                                <th className="px-6 py-4 font-semibold text-slate-400 uppercase text-xs tracking-wider border-b border-slate-700 text-right w-24">Akcje</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {groupedProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                                        Brak wyników do wyświetlenia.
                                    </td>
                                </tr>
                            ) : (
                                groupedProducts.map((product) => {
                                    const avgPrice = product.totalQty > 0 ? (product.totalValue / product.totalQty) : 0;
                                    const isExpanded = expandedProduct === product.name;

                                    return (
                                        <React.Fragment key={product.name}>
                                            <tr
                                                onClick={() => toggleExpand(product.name)}
                                                className={`cursor-pointer transition-colors duration-150 group ${isExpanded ? 'bg-slate-700/30' : 'hover:bg-slate-700/50'}`}
                                            >
                                                <td className="px-6 py-4 font-medium text-white group-hover:text-emerald-400 transition-colors overflow-hidden text-ellipsis whitespace-nowrap" title={product.name}>
                                                    {product.name}
                                                </td>
                                                <td className="px-6 py-4 text-slate-400 text-xs uppercase tracking-wide overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {categories.find(c => c.id === product.categoryId)?.value || 'NIESKLASYFIKOWANE'}
                                                </td>
                                                <td className="px-6 py-4 text-right overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <span className={`font-mono text-sm font-bold ${product.totalQty > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {product.totalQty}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-300 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {formatCurrency(avgPrice)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-300 text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                                    {formatCurrency(product.totalValue)}
                                                </td>
                                                <td className="px-6 py-4 text-right overflow-hidden text-ellipsis whitespace-nowrap">
                                                    <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide">
                                                        {isExpanded ? 'Zwiń' : 'Szczegóły'}
                                                    </button>
                                                </td>
                                            </tr>
                                            {/* Expanded Details Row */}
                                            {isExpanded && (
                                                <tr className="bg-slate-900/40">
                                                    <td colSpan={6} className="px-6 py-0">
                                                        <div className="py-4 pl-4 border-l-2 border-slate-600 my-2 animate-in slide-in-from-top-2 duration-200">
                                                            <table className="w-full text-sm">
                                                                <thead className="text-xs text-slate-500 uppercase">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left">Partia (Batch ID)</th>
                                                                        <th className="px-4 py-2 text-left">Data Przyjęcia</th>
                                                                        <th className="px-4 py-2 text-right">Cena Zakupu</th>
                                                                        <th className="px-4 py-2 text-right">Ilość</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-slate-700/30">
                                                                    {product.batches.map(batch => (
                                                                        <tr key={batch.id} className="hover:bg-slate-700/20">
                                                                            <td className="px-4 py-2 font-mono text-emerald-500/80 tracking-tight">{batch.batchNumber}</td>
                                                                            <td className="px-4 py-2 text-slate-400">{new Date(batch.createdAt).toLocaleDateString()}</td>
                                                                            <td className="px-4 py-2 text-right font-mono">{formatCurrency(batch.purchasePrice)}</td>
                                                                            <td className="px-4 py-2 text-right font-mono text-slate-300">{batch.remainingQuantity}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                            {/* QA Test Loop - Uncomment to verification
                        {Array.from({ length: 20 }).map((_, i) => (
                             <tr key={`test-${i}`} className="hover:bg-slate-700/50">
                                <td className="px-6 py-4 font-medium text-slate-500">Test Product {i}</td>
                                <td className="px-6 py-4 text-right font-mono">100</td>
                                <td className="px-6 py-4 text-right font-mono">10.00 PLN</td>
                                <td className="px-6 py-4 text-right font-mono">1000.00 PLN</td>
                                <td className="px-6 py-4 text-right">Test</td>
                            </tr>
                        ))} 
                        */}
                        </tbody>
                    </table>
                </div>
                {/* Optional Footer/Summary can go here outside the scroll area */}
                <div className="bg-slate-800 border-t border-slate-700 px-6 py-3 text-xs text-slate-500 flex justify-end">
                    Łącznie pozycji (filtrowane): {groupedProducts.length}
                </div>
            </div>
        </div>
    );
};
