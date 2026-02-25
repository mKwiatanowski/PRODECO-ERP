import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User, Building, MapPin, Phone, Save, Search, Globe, CreditCard, Clock, Percent, Truck, Mail, Info } from 'lucide-react';

import { Client } from '../../../api/api';

interface ClientFormProps {
    initialData?: Client | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

type TabType = 'BASIC' | 'FINANCE' | 'LOGISTICS';

const formatPolishNRB = (value: string | undefined): string => {
    if (!value) return '';
    const clean = value.replace(/\s/g, '');
    if (clean.length <= 2) return clean;
    let result = clean.substring(0, 2);
    for (let i = 2; i < clean.length; i += 4) {
        result += ' ' + clean.substring(i, i + 4);
    }
    return result.trim();
};

export const ClientForm: React.FC<ClientFormProps> = ({ initialData, onSuccess, onCancel }) => {
    const isEditMode = !!initialData;
    const [activeTab, setActiveTab] = useState<TabType>('BASIC');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingGus, setIsFetchingGus] = useState(false);

    const [formData, setFormData] = useState<Partial<Client>>({
        name: '',
        shortName: '',
        nip: '',
        phone: '',
        phoneNumber: '',
        email: '',
        address: '',
        street: '',
        postalCode: '',
        city: '',
        shippingAddress: '',
        paymentTermsDays: 0,
        creditLimit: 0,
        bankAccountNumber: '',
        defaultDiscount: 0,
        currency: 'PLN',
        type: 'CUSTOMER',
        isActive: true,
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                isActive: initialData.isActive !== undefined ? initialData.isActive : true
            });
        }
    }, [initialData]);

    const handleChange = (field: keyof Client, value: any) => {
        if (field === 'bankAccountNumber') {
            const cleanValue = String(value).replace(/\s/g, '');
            if (cleanValue.length > 26) return;
            setFormData(prev => ({ ...prev, [field]: cleanValue }));
            return;
        }
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFetchGus = async () => {
        if (!formData.nip || formData.nip.length < 10) {
            toast.error("Proszę podać poprawny numer NIP.");
            return;
        }

        setIsFetchingGus(true);
        try {
            const gusData = await window.electron.clients.fetchGusData(formData.nip);
            console.log("[UI DEBUG] Wynik z backendu:", gusData);

            setFormData(prev => ({
                ...prev,
                ...gusData,
                address: gusData.street && gusData.city ? `${gusData.street}, ${gusData.postalCode} ${gusData.city}` : prev.address
            }));
            toast.success('Dane pobrane pomyślnie!', { icon: '🏢' });
        } catch (error: any) {
            console.error("Błąd pobierania danych z GUS:", error);
            const msg = error.message;
            if (msg === 'TIMEOUT') {
                toast.error("Serwer GUS nie odpowiada (Timeout). Spróbuj ponownie.");
            } else if (msg === 'AUTH_ERROR') {
                toast.error("Błąd autoryzacji w systemie GUS. Sprawdź klucz API.");
            } else if (msg && msg.includes('Błąd GUS:')) {
                toast.error(msg);
            } else {
                toast.error("Błąd połączenia z serwerem testowym GUS.");
            }
        } finally {
            setIsFetchingGus(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditMode && initialData?.id) {
                await window.electron.clients.update({ ...formData, id: initialData.id });
                toast.success('Dane kontrahenta zaktualizowane!', { icon: '✅' });
            } else {
                await window.electron.clients.create(formData);
                toast.success('Kontrahent dodany do bazy!', { icon: '👋' });
            }

            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Wystąpił błąd podczas zapisu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const TabButton = ({ id, label, icon: Icon }: { id: TabType, label: string, icon: any }) => (
        <button
            type="button"
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all font-bold text-xs uppercase tracking-widest ${activeTab === id
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    );

    return (
        <div className="bg-slate-950 text-slate-100 h-full flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/20 rounded-2xl">
                        <Building className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">
                            {isEditMode ? 'Edycja Kontrahenta' : 'Nowy Kontrahent'}
                        </h2>
                        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Moduł ERP / CRM</p>
                    </div>
                </div>

            </div>

            {/* Tabs Navigation */}
            <div className="flex px-4 border-b border-slate-800 bg-slate-900/50">
                <TabButton id="BASIC" label="Podstawowe" icon={Info} />
                <TabButton id="FINANCE" label="Finanse" icon={CreditCard} />
                <TabButton id="LOGISTICS" label="Logistyka" icon={Truck} />
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'BASIC' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Typ podmiotu</label>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => handleChange('type', 'CUSTOMER')}
                                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-[11px] uppercase transition-all ${formData.type === 'CUSTOMER' ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        <User className="w-4 h-4" /> Klient
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleChange('type', 'SUPPLIER')}
                                        className={`flex-1 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-[11px] uppercase transition-all ${formData.type === 'SUPPLIER' ? 'bg-purple-500/10 border-purple-500 text-purple-400' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                                    >
                                        <Building className="w-4 h-4" /> Dostawca
                                    </button>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nazwa Pełna</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => handleChange('name', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                        placeholder="np. Nazwa Firmy Sp. z o.o."
                                    />
                                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Nazwa Skrócona</label>
                                <input
                                    type="text"
                                    value={formData.shortName}
                                    onChange={e => handleChange('shortName', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                    placeholder="np. PRODECO"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">NIP</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={formData.nip}
                                            onChange={e => handleChange('nip', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 font-mono"
                                            placeholder="1234567890"
                                        />
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleFetchGus}
                                        disabled={isFetchingGus}
                                        className="px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center disabled:opacity-50 border border-indigo-400/20 shadow-lg shadow-indigo-500/20"
                                    >
                                        {isFetchingGus ? (
                                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Biuro</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => handleChange('email', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                        placeholder="biuro@firma.pl"
                                    />
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Telefon</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.phone}
                                        onChange={e => handleChange('phone', e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                        placeholder="+48..."
                                    />
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'FINANCE' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Numer konta bankowego (IBAN)</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formatPolishNRB(formData.bankAccountNumber)}
                                        onChange={e => handleChange('bankAccountNumber', e.target.value.replace(/\s/g, ''))}
                                        onCopy={(e) => {
                                            e.preventDefault();
                                            const rawValue = formData.bankAccountNumber || '';
                                            e.clipboardData.setData('text/plain', rawValue);
                                        }}
                                        maxLength={32}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 font-mono"
                                        placeholder="00 0000 0000 0000 0000 0000 0000"
                                    />
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Termin płatności (dni)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={formData.paymentTermsDays}
                                        onChange={e => handleChange('paymentTermsDays', parseInt(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                    />
                                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Limit kredytowy</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.creditLimit}
                                        onChange={e => handleChange('creditLimit', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11 font-mono"
                                    />
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-600">zł</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Domyślny rabat (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.defaultDiscount}
                                        onChange={e => handleChange('defaultDiscount', parseFloat(e.target.value) || 0)}
                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all pl-11"
                                    />
                                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Waluta</label>
                                <select
                                    value={formData.currency}
                                    onChange={e => handleChange('currency', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all appearance-none"
                                >
                                    <option value="PLN">PLN - Złoty polski</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="USD">USD - Dolar amerykański</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'LOGISTICS' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Adres Rejestrowy
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Ulica i numer</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={e => handleChange('street', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="ul. Kwiatowa 15"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Kod pocztowy</label>
                                    <input
                                        type="text"
                                        value={formData.postalCode}
                                        onChange={e => handleChange('postalCode', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="01-234"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Miejscowość</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={e => handleChange('city', e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                                        placeholder="Warszawa"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Truck className="w-3 h-3" /> Adres Dostawy
                            </h3>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Miejsce rozładunku / Adres wysyłkowy</label>
                            <textarea
                                value={formData.shippingAddress}
                                onChange={e => handleChange('shippingAddress', e.target.value)}
                                rows={3}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all custom-scrollbar"
                                placeholder="Wpisz adres dostawy, jeśli jest inny niż rejestrowy..."
                            />
                        </div>
                    </div>
                )}

                {/* Footer / Actions */}
                <div className="mt-8 pt-8 border-t border-slate-800 flex justify-between items-center">
                    <div>
                        <button
                            type="button"
                            onClick={() => handleChange('isActive', !formData.isActive)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${formData.isActive ? 'text-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20' : 'text-slate-500 bg-slate-900 hover:bg-slate-800'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${formData.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                            {formData.isActive ? 'Aktywny' : 'Zablokowany'}
                        </button>
                    </div>
                    <div className="flex gap-4">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-800 transition-all"
                            >
                                Anuluj
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-indigo-500/20 active:scale-95 border border-indigo-400/20"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <Save className="w-5 h-5 shadow-sm" />
                            )}
                            {isEditMode ? 'Zapisz Zmiany' : 'Dodaj Kontrahenta'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};
