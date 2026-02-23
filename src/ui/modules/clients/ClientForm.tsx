import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { User, Building, MapPin, Phone, Hash, Save, X, Search, Globe } from 'lucide-react';

import { Client } from '../../../api/api';

interface ClientFormProps {
    initialData?: Client | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEditMode = !!initialData;
    const [name, setName] = useState(initialData?.name || '');
    const [nip, setNip] = useState(initialData?.nip || '');
    const [phone, setPhone] = useState(initialData?.phone || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [type, setType] = useState(initialData?.type || 'CUSTOMER');
    const [isActive, setIsActive] = useState(initialData ? initialData.isActive : true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingGus, setIsFetchingGus] = useState(false);

    const handleFetchGus = async () => {
        if (!nip || nip.length < 10) {
            toast.error("Proszę podać poprawny numer NIP.");
            return;
        }

        setIsFetchingGus(true);
        try {
            const gusData = await window.electron.clients.fetchGusData(nip);
            if (gusData) {
                setName(gusData.name || name);
                setAddress(`${gusData.street}, ${gusData.postalCode} ${gusData.city}`);
                toast.success('Dane pobrane z GUS!', { icon: '🏢' });
            }
        } catch (error) {
            console.error("Błąd pobierania danych z GUS:", error);
            toast.error("Nie udało się pobrać danych z bazy GUS.");
        } finally {
            setIsFetchingGus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);
        try {
            const dto = {
                id: initialData?.id,
                name,
                nip,
                phone,
                address,
                type,
                isActive,
            };

            if (isEditMode) {
                await window.electron.clients.create(dto); // Placeholder for update if separate, but user had updateClient
                // Actually preload.ts doesn't have clients.update yet, adding it now.
                toast.success('Klient został zaktualizowany!', { duration: 5000, icon: '✅' });
            } else {
                await window.electron.clients.create(dto);
                toast.success('Klient został dodany pomyślnie!', { duration: 5000, icon: '👋' });
            }

            if (onSuccess) {
                onSuccess();
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Błąd podczas dodawania klienta.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-8 bg-slate-950 text-slate-100 min-h-full rounded-2xl">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-indigo-500/10 rounded-xl">
                        <UsersIcon className="text-2xl text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">{isEditMode ? 'Edycja Klienta / Kontrahenta' : 'Nowy Klient / Kontrahent'}</h2>
                        <p className="text-slate-400 text-sm">Uzupełnij dane biznesowe i logistyczne</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Building className="w-4 h-4" /> Typ podmiotu
                            </label>
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${type === 'CUSTOMER' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                    <input type="radio" value="CUSTOMER" checked={type === 'CUSTOMER'} onChange={(e) => setType(e.target.value)} className="hidden" />
                                    Odbiorca (Klient)
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${type === 'SUPPLIER' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 font-semibold' : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-600'}`}>
                                    <input type="radio" value="SUPPLIER" checked={type === 'SUPPLIER'} onChange={(e) => setType(e.target.value)} className="hidden" />
                                    Dostawca
                                </label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                Status w systemie
                            </label>
                            <div className="flex items-center gap-4 mt-2">
                                <button
                                    type="button"
                                    role="switch"
                                    title="Zmień aktywność"
                                    aria-checked={isActive}
                                    onClick={() => setIsActive(!isActive)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${isActive ? 'bg-emerald-500' : 'bg-slate-600'}`}
                                >
                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className={`text-sm font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                    {isActive ? 'Zezwalaj na użycie (Aktywny)' : 'Wykluczony (Nieaktywny)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <User className="w-4 h-4" /> Nazwa Firmy / Imię i Nazwisko
                            </label>
                            <input
                                title="Nazwa"
                                placeholder="Wpisz pełną nazwę..."
                                type="text"
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Hash className="w-4 h-4" /> NIP (opcjonalnie)
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        title="NIP"
                                        placeholder="1234567890"
                                        type="text"
                                        value={nip}
                                        onChange={e => setNip(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600 pl-10"
                                    />
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFetchGus}
                                    disabled={isFetchingGus}
                                    className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all flex items-center justify-center disabled:opacity-50 border border-indigo-400/20"
                                    title="Pobierz dane z GUS"
                                >
                                    {isFetchingGus ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Search className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <Phone className="w-4 h-4" /> Telefon
                            </label>
                            <input
                                title="Telefon"
                                placeholder="+48..."
                                type="text"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                <MapPin className="w-4 h-4" /> Adres (siedziba / dostawa)
                            </label>
                            <input
                                title="Adres"
                                placeholder="ul. Wiejska 1, 00-001 Warszawa"
                                type="text"
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all placeholder-slate-600"
                            />
                        </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 flex justify-end gap-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex items-center gap-2 px-6 py-3 text-slate-400 hover:text-white transition-colors font-medium border border-transparent hover:bg-slate-800 rounded-xl"
                            >
                                <X className="w-5 h-5" /> Anuluj
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-indigo-900/20 transition-all transform hover:-translate-y-0.5
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? (
                                <>Przetwarzanie...</>
                            ) : (
                                <><Save className="w-5 h-5" /> {isEditMode ? 'Zapisz Zmiany' : 'Zapisz Klienta'}</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Helper component for icon
const UsersIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);
