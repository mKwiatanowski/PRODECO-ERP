import React, { useState, useEffect } from 'react';
import { X, Save, Search, Building2, User, Globe, Mail, MapPin } from 'lucide-react';
import { Client } from '../../api/api';

interface ClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (client: Partial<Client>) => Promise<void>;
    initialData?: Client | null;
}

export const ClientForm: React.FC<ClientFormProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [formData, setFormData] = useState<Partial<Client>>({
        name: '',
        nip: '',
        regon: '',
        email: '',
        street: '',
        postalCode: '',
        city: '',
        type: 'FIRMA'
    });
    const [isFetchingGus, setIsFetchingGus] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({
                name: '',
                nip: '',
                regon: '',
                email: '',
                street: '',
                postalCode: '',
                city: '',
                type: 'FIRMA'
            });
        }
    }, [initialData, isOpen]);

    const handleFetchGus = async () => {
        if (!formData.nip || formData.nip.length < 10) {
            alert("Proszę podać poprawny numer NIP.");
            return;
        }

        setIsFetchingGus(true);
        try {
            const gusData = await window.electron.clients.fetchGusData(formData.nip);
            setFormData(prev => ({
                ...prev,
                ...gusData
            }));
        } catch (error) {
            console.error("Błąd pobierania danych z GUS:", error);
            alert("Nie udało się pobrać danych z bazy GUS.");
        } finally {
            setIsFetchingGus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error("Błąd zapisu klienta:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-800 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-2xl">
                            <Building2 className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight text-white uppercase">
                                {initialData ? 'Edytuj Kontrahenta' : 'Nowy Kontrahent'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Zarządzanie bazą klientów CRM</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 space-y-8 custom-scrollbar">
                    {/* Typ Klienta */}
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'FIRMA' }))}
                            className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest ${formData.type === 'FIRMA' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                            <Building2 className="w-4 h-4" /> Firma
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'OSOBA_FIZYCZNA' }))}
                            className={`flex-1 py-4 rounded-2xl border transition-all flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest ${formData.type === 'OSOBA_FIZYCZNA' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                        >
                            <User className="w-4 h-4" /> Os. Fizyczna
                        </button>
                    </div>

                    {/* Dane Podstawowe */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nazwa Pełna / Imię i Nazwisko</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                    placeholder="np. PRODECO GARDEN Sp. z o.o."
                                />
                                <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">NIP</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        required
                                        value={formData.nip}
                                        onChange={e => setFormData(prev => ({ ...prev, nip: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                        placeholder="1234567890"
                                    />
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                                <button
                                    type="button"
                                    onClick={handleFetchGus}
                                    disabled={isFetchingGus}
                                    className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 group border border-indigo-400/20"
                                    title="Pobierz dane z GUS"
                                >
                                    {isFetchingGus ? (
                                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">REGON</label>
                            <input
                                type="text"
                                value={formData.regon}
                                onChange={e => setFormData(prev => ({ ...prev, regon: e.target.value }))}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                placeholder="123456789"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Adres Email</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                    placeholder="biuro@firma.pl"
                                />
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            </div>
                        </div>
                    </div>

                    {/* Adres */}
                    <div className="space-y-6 bg-slate-950/50 p-6 rounded-2xl border border-slate-800/50">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Adres Siedziby / Zamieszkania</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ulica i Numer</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.street}
                                        onChange={e => setFormData(prev => ({ ...prev, street: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                        placeholder="ul. Kwiatowa 15"
                                    />
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kod Pocztowy</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.postalCode}
                                    onChange={e => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="01-234"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Miasto</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.city}
                                    onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="Warszawa"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end gap-4 pb-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all border border-transparent hover:border-slate-700"
                        >
                            Anuluj
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5" />
                            )}
                            {initialData ? 'Zapisz Zmiany' : 'Dodaj Kontrahenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
