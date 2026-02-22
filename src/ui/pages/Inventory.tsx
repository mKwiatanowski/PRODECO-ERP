import React, { useState } from 'react';
import { ProductList } from '../modules/inventory/ProductList';
import { DocumentList } from '../modules/inventory/DocumentList';
import { ManualReceipt } from '../modules/inventory/ManualReceipt';
import { Plus, X, PackageOpen, FileText } from 'lucide-react';

export const Inventory: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'STAN' | 'DOKUMENTY'>('STAN');
    const [refreshKey, setRefreshKey] = useState(0); // Trigger list refresh

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1); // Refresh list
    };

    return (
        <div className="h-full flex flex-col p-8 bg-[#0d1117]">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Magazyn</h1>
                    <p className="text-slate-400 mt-1">Zarządzanie stanami magazynowymi i obiegiem dokumentów</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg hover:shadow-emerald-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Dodaj Towar (Ręcznie - Bez FV)
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-px">
                <button
                    onClick={() => setActiveTab('STAN')}
                    className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all font-medium ${activeTab === 'STAN' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
                >
                    <PackageOpen className="w-5 h-5" /> Stany Magazynowe
                </button>
                <button
                    onClick={() => setActiveTab('DOKUMENTY')}
                    className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all font-medium ${activeTab === 'DOKUMENTY' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-700'}`}
                >
                    <FileText className="w-5 h-5" /> Obieg Dokumentów
                </button>
            </div>

            <div className="flex-1 min-h-0">
                {activeTab === 'STAN' ? (
                    <ProductList key={refreshKey} />
                ) : (
                    <DocumentList key={refreshKey} />
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 [-webkit-app-region:no-drag]">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl border border-slate-700 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            aria-label="Zamknij Modal"
                            className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <div className="p-1">
                            <ManualReceipt onSuccess={handleSuccess} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
