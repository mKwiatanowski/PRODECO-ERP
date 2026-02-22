import { useState } from 'react'
import { ProductList } from './ui/modules/inventory/ProductList'
import { ManualReceipt } from './ui/modules/inventory/ManualReceipt'
import { PurchaseInvoiceForm } from './ui/modules/finance/PurchaseInvoiceForm'
import { ProjectCreate } from './ui/modules/projects/ProjectCreate'

function App() {
    const [activeTab, setActiveTab] = useState('inventory')

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-emerald-500/30">
            {/* Dynamic Title Bar */}
            <div className="h-10 bg-slate-900/80 backdrop-blur-md flex items-center justify-center border-b border-slate-800 fixed w-full top-0 z-50 select-none app-drag-region" style={{ WebkitAppRegion: 'drag' } as any}>
                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-wider text-sm opacity-80 hover:opacity-100 transition-opacity">
                    <span>🌿 GREEN MANAGER ERP</span>
                </div>
            </div>

            {/* Main Layout */}
            <div className="pt-10 flex h-screen">
                {/* Sidebar */}
                <nav className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 gap-2">
                    <button
                        onClick={() => setActiveTab('inventory')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        📦 Inventory
                    </button>
                    <button
                        onClick={() => setActiveTab('finance')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${activeTab === 'finance' ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        💰 Finance
                    </button>
                    <button
                        onClick={() => setActiveTab('projects')}
                        className={`p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${activeTab === 'projects' ? 'bg-amber-600/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                    >
                        🏗️ Projects
                    </button>
                </nav>

                {/* Content Area */}
                <main className="flex-1 overflow-auto bg-slate-950 p-8 relative">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black pointer-events-none opacity-40"></div>

                    {activeTab === 'inventory' && (
                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2">
                                <ProductList />
                            </div>
                            <div className="lg:col-span-1">
                                <div className="sticky top-10">
                                    <ManualReceipt onSuccess={() => window.location.reload()} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="relative z-10">
                            <PurchaseInvoiceForm />
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="relative z-10">
                            <ProjectCreate />
                        </div>
                    )}

                </main>
            </div>
        </div>
    )
}

export default App
