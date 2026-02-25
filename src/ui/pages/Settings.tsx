import React, { useState, useEffect } from 'react';
import { Save, Building2, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const formatIBAN = (value: string | undefined): string => {
    if (!value) return '';
    const clean = value.replace(/\s/g, '');
    if (clean.length <= 2) return clean;
    let result = clean.substring(0, 2);
    for (let i = 2; i < clean.length; i += 4) {
        result += ' ' + clean.substring(i, i + 4);
    }
    return result.trim();
};

const formatPostalCode = (value: string): string => {
    const clean = value.replace(/\D/g, '').substring(0, 5);
    if (clean.length > 2) {
        return `${clean.slice(0, 2)}-${clean.slice(2)}`;
    }
    return clean;
};

export const Settings: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        nip: '',
        address: '',
        postalCode: '',
        city: '',
        bankAccountNumber: '',
        email: '',
        phone: ''
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const profile = await (window as any).electron.settings.getProfile();
                if (profile) {
                    setFormData({
                        name: profile.name || '',
                        nip: profile.nip || '',
                        address: profile.address || '',
                        postalCode: profile.postalCode || '',
                        city: profile.city || '',
                        bankAccountNumber: profile.bankAccountNumber || '',
                        email: profile.email || '',
                        phone: profile.phone || ''
                    });
                }
            } catch (error) {
                console.error('Error loading settings:', error);
                toast.error('Nie udało się załadować profilu firmy.');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        let finalValue = value;

        if (name === 'postalCode') {
            finalValue = formatPostalCode(value);
        } else if (name === 'bankAccountNumber') {
            const cleanValue = value.replace(/\s/g, '');
            if (cleanValue.length > 26) return;
            finalValue = cleanValue;
        }

        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await (window as any).electron.settings.updateProfile(formData);
            toast.success('Ustawienia zapisane pomyślnie!');
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Wystąpił błąd podczas zapisywania.');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-slate-950 min-h-screen text-slate-200 font-sans">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-500">
                        Profil Właściciela
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Zarządzaj ustawieniami firmy i danymi do faktur</p>
                </div>
                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95"
                >
                    <Save className="w-5 h-5" />
                    Zapisz Profile
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">

                {/* Basic Info */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                            <Building2 className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Dane Podstawowe</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nazwa Firmy</label>
                            <input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                placeholder="Pełna nazwa przedsiębiorstwa"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">NIP</label>
                            <input
                                name="nip"
                                value={formData.nip}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner font-mono"
                                placeholder="000-000-00-00"
                            />
                        </div>
                    </div>
                </div>

                {/* Address Info */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-300 group">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                            <MapPin className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Adres Siedziby</h2>
                    </div>
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Ulica i numer</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Kod pocztowy</label>
                                <input
                                    name="postalCode"
                                    value={formData.postalCode}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner font-mono"
                                    placeholder="00-000"
                                    maxLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Miejscowość</label>
                                <input
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Finance & Contact */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-xl hover:border-indigo-500/30 transition-all duration-300 group lg:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-500/20 transition-colors">
                            <CreditCard className="w-6 h-6 text-indigo-500" />
                        </div>
                        <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Dane Finansowe i Kontaktowe</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Numer konta (IBAN)</label>
                            <input
                                name="bankAccountNumber"
                                value={formatIBAN(formData.bankAccountNumber)}
                                onChange={handleChange}
                                onCopy={(e) => {
                                    e.preventDefault();
                                    const rawValue = formData.bankAccountNumber || '';
                                    e.clipboardData.setData('text/plain', rawValue);
                                }}
                                maxLength={32}
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner font-mono text-sm"
                                placeholder="PL 00 0000 0000 0000 0000 0000 0000"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Telefon</label>
                                <input
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
