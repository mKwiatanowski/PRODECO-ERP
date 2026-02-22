import React, { useState, useEffect } from 'react';

// Mock Employees for now
const EMPLOYEES = [
    { id: 'EMP-001', name: 'Jan Kowalski' },
    { id: 'EMP-002', name: 'Anna Nowak' },
    { id: 'EMP-003', name: 'Piotr Wiśniewski' }
];

export const ProjectCreate: React.FC = () => {
    const [name, setName] = useState('');
    const [clientName, setClientName] = useState('');
    const [assignedEmployeeId, setAssignedEmployeeId] = useState('');
    const [materials, setMaterials] = useState<{ productId: string, quantity: number }[]>([
        { productId: '', quantity: 1 }
    ]);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [availableProducts, setAvailableProducts] = useState<string[]>([]);

    useEffect(() => {
        const fetchInventory = async () => {
            // @ts-ignore
            const inv = await window.electron.getInventory();
            // Extract unique product IDs
            // @ts-ignore
            const products = Array.from(new Set(inv.map((b: any) => b.productId)));
            // @ts-ignore
            setAvailableProducts(products);
        };
        fetchInventory();
    }, []);

    const handleMaterialChange = (index: number, field: string, value: string | number) => {
        const newMaterials = [...materials];
        // @ts-ignore
        newMaterials[index][field] = value;
        setMaterials(newMaterials);
    };

    const addMaterial = () => {
        setMaterials([...materials, { productId: '', quantity: 1 }]);
    };

    const removeMaterial = (index: number) => {
        setMaterials(materials.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
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
            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);

            // Reset
            setName('');
            setClientName('');
            setAssignedEmployeeId('');
            setMaterials([{ productId: '', quantity: 1 }]);
        } catch (error) {
            console.error(error);
            setStatus('error');
        }
    };

    return (
        <div className="p-6 bg-slate-900 text-slate-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-6 text-amber-500 font-sans tracking-wide">🏗️ Create New Project</h2>

            <form onSubmit={handleSubmit} className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Project Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                            placeholder="e.g. Garden Renovation"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">Client</label>
                        <input
                            type="text"
                            required
                            value={clientName}
                            onChange={e => setClientName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                            placeholder="Client Name"
                        />
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-400 mb-1">Assign Employee</label>
                    <select
                        required
                        value={assignedEmployeeId}
                        onChange={e => setAssignedEmployeeId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                    >
                        <option value="">-- Select Employee --</option>
                        {EMPLOYEES.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold text-slate-300">Materials Used (from Inventory)</h3>
                        <button type="button" onClick={addMaterial} className="text-sm text-amber-400 hover:text-amber-300 font-medium">+ Add Material</button>
                    </div>

                    <div className="space-y-3">
                        {materials.map((material, index) => (
                            <div key={index} className="flex gap-4 items-end bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                                <div className="flex-1">
                                    <label className="text-xs text-slate-500 block mb-1">Product</label>
                                    <select
                                        required
                                        value={material.productId}
                                        onChange={e => handleMaterialChange(index, 'productId', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-amber-500 outline-none"
                                    >
                                        <option value="">Select Product...</option>
                                        {availableProducts.map(p => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-32">
                                    <label className="text-xs text-slate-500 block mb-1">Qty to Consume</label>
                                    <input
                                        type="number"
                                        required
                                        min="0.01"
                                        step="0.01"
                                        value={material.quantity}
                                        onChange={e => handleMaterialChange(index, 'quantity', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-600 rounded px-2 py-1 text-sm focus:border-amber-500 outline-none"
                                    />
                                </div>
                                {materials.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeMaterial(index)}
                                        className="text-red-400 hover:text-red-300 p-2"
                                        title="Remove Material"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-amber-500/20 transition-all"
                    >
                        Create Project & Consume Materials
                    </button>
                </div>

                {status === 'success' && (
                    <div className="mt-4 p-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-center">
                        ✅ Project created and materials consumed successfully!
                    </div>
                )}
                {status === 'error' && (
                    <div className="mt-4 p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-center">
                        ❌ Failed to create project (likely insufficient stock).
                    </div>
                )}
            </form>
        </div>
    );
};
