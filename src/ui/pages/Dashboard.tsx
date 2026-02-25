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
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500 mb-2">
                Dashboard
            </h1>
            <p className="text-slate-500 mt-2 text-lg mb-8">Witaj w systemie PRODECO ERP.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-emerald-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-colors">
                            <TrendingUp className="w-8 h-8 text-emerald-500" />
                        </div>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">+0%</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Wartość Magazynu</div>
                    <div className="text-3xl font-black text-white">
                        {inventoryValue !== null ? formatCurrency(inventoryValue) : 'Ładowanie...'}
                    </div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                            <Users className="w-8 h-8 text-indigo-500" />
                        </div>
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Status</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Aktywne Projekty</div>
                    <div className="text-3xl font-black text-white">8</div>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-3xl shadow-xl hover:border-rose-500/30 transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-2xl group-hover:bg-rose-500/20 transition-colors">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">Alarm</span>
                    </div>
                    <div className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-1">Nieopłacone Faktury</div>
                    <div className="text-3xl font-black text-white">3</div>
                </div>
            </div>
        </div>
    );
};
