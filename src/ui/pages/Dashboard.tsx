import React from 'react';
import { TrendingUp, Users, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [inventoryValue, setInventoryValue] = React.useState<number | null>(null);

    React.useEffect(() => {
        const loadData = async () => {
            try {
                const value = await window.electron.getInventoryValue();
                setInventoryValue(value);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            }
        };
        loadData();
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(value);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent mb-2">
                Dashboard
            </h1>
            <p className="text-slate-400 mb-8">Witaj w systemie PRODECO ERP.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        {/* Placeholder for trend */}
                        <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">+0%</span>
                    </div>
                    <h2 className="text-sm font-medium text-slate-400">Wartość Magazynu</h2>
                    <p className="text-2xl font-bold text-white mt-1">
                        {inventoryValue !== null ? formatCurrency(inventoryValue) : 'Ładowanie...'}
                    </p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                    </div>
                    <h2 className="text-sm font-medium text-slate-400">Aktywne Projekty</h2>
                    <p className="text-2xl font-bold text-white mt-1">8</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 hover:border-red-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-500/10 rounded-lg">
                            <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <span className="text-xs font-mono text-red-400 bg-red-500/10 px-2 py-1 rounded">2 Pilne</span>
                    </div>
                    <h2 className="text-sm font-medium text-slate-400">Nieopłacone Faktury</h2>
                    <p className="text-2xl font-bold text-white mt-1">3</p>
                </div>
            </div>
        </div>
    );
};
