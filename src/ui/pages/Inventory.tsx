import React, { useState } from 'react';
import { ProductList } from '../modules/inventory/ProductList';
import { DocumentList } from '../modules/inventory/DocumentList';
import { ManualReceipt } from '../modules/inventory/ManualReceipt';
import { Plus, PackageOpen, FileText } from 'lucide-react';

export const Inventory: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'STAN' | 'DOKUMENTY'>('STAN');
    const [refreshKey, setRefreshKey] = useState(0); // Trigger list refresh

    const handleSuccess = () => {
        setIsModalOpen(false);
        setRefreshKey(prev => prev + 1); // Refresh list
    };

    return (
        <div className="h-full flex flex-col p-8 bg-slate-950 min-h-screen text-slate-200">
            <div className="flex justify-between items-center mb-8 flex-shrink-0">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                        Magazyn
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzanie stanami magazynowymi i obiegiem dokumentów</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Nowa Dostawa (Ręcznie)
                </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-4 mb-6 border-b border-slate-800 pb-px">
                <button
                    onClick={() => setActiveTab('STAN')}
                    className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all font-bold text-sm tracking-wide ${activeTab === 'STAN' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-800'}`}
                >
                    <PackageOpen className="w-5 h-5" /> STANY MAGAZYNOWE
                </button>
                <button
                    onClick={() => setActiveTab('DOKUMENTY')}
                    className={`flex items-center gap-2 pb-3 px-2 border-b-2 transition-all font-bold text-sm tracking-wide ${activeTab === 'DOKUMENTY' ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-800'}`}
                >
                    <FileText className="w-5 h-5" /> OBIEG DOKUMENTÓW
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
                    <div className="bg-slate-800 rounded-2xl w-full max-w-xl shadow-2xl border border-slate-700 relative animate-in fade-in zoom-in duration-200">
                        <div className="p-1">
                            <ManualReceipt onSuccess={handleSuccess} onClose={() => setIsModalOpen(false)} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
