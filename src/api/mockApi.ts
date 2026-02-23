import { IElectronAPI, DictionaryItem, InventoryBatch, Client, Project, PurchaseInvoice, InvoiceData, Product, KsefStatus } from './api';

const mockDictionaries: Record<string, DictionaryItem[]> = {
    'UNIT': [
        { id: '1', category: 'UNIT', code: 'SZT', value: 'szt.', isSystem: true },
        { id: '4', category: 'UNIT', code: 'KPL', value: 'kpl.', isSystem: true },
    ],
    'MATERIAL_CATEGORY': [
        { id: '2', category: 'MATERIAL_CATEGORY', code: 'PLANT', value: 'Rośliny', isSystem: true },
        { id: '5', category: 'MATERIAL_CATEGORY', code: 'SERVICE', value: 'Usługi', isSystem: true },
    ],
    'TAX_RATE': [
        { id: '3', category: 'TAX_RATE', code: '23', value: '23%', isSystem: true },
        { id: '6', category: 'TAX_RATE', code: '8', value: '8%', isSystem: true },
        { id: '7', category: 'TAX_RATE', code: 'zw', value: 'zw.', isSystem: true },
    ]
};

const mockClients: Client[] = [
    {
        id: 'c1',
        name: 'PRODECO GARDEN Sp. z o.o.',
        nip: '1234567890',
        regon: '123456789',
        email: 'biuro@prodeco.pl',
        street: 'ul. Kwiatowa 15',
        postalCode: '01-234',
        city: 'Warszawa',
        type: 'FIRMA',
        createdAt: new Date()
    }
];

const mockProducts: Product[] = [
    { id: 'p1', name: 'Kosiarka spalinowa', type: 'TOWAR', gtuCode: 'GTU_06', vatRate: '23%', unit: 'szt.', isActive: true },
    { id: 'p2', name: 'Usługa projektowa', type: 'USLUGA', vatRate: '23%', unit: 'usł.', isActive: true },
    { id: 'p3', name: 'Nawóz do trawników', type: 'TOWAR', vatRate: '8%', unit: 'kg', isActive: true },
];

const mockInvoices: InvoiceData[] = [
    {
        id: 'inv-1',
        type: 'SALE',
        invoiceNumber: 'FV/2026/02/001',
        issueDate: new Date(2026, 1, 15),
        dueDate: new Date(2026, 2, 1),
        nip: '1234567890',
        currency: 'PLN',
        totalNetCents: 1500000,
        totalVatCents: 345000,
        totalGrossCents: 1845000,
        isPaid: true,
        createdAt: new Date(),
        items: [
            { productId: 'p1', productName: 'Kosiarka spalinowa', type: 'TOWAR', quantity: 1, unit: 'szt.', priceNetCents: 1500000, vatRate: '23%', vatValueCents: 345000, priceGrossCents: 1845000 }
        ]
    }
];

const mockDocuments: any[] = [];

export const mockApi: IElectronAPI = {
    inventory: {
        getAll: async () => {
            console.log('[Mock API] Wywołano: inventory.getAll');
            return [];
        },
        getDocuments: async () => {
            console.log('[Mock API] Pobieranie dokumentów magazynowych');
            return [...mockDocuments];
        },
        addStock: async (data) => {
            console.log('[Mock API] Przyjęcie towaru:', data);
            return {
                id: 'mock-id',
                productId: data.productId,
                batchNumber: data.batchNumber,
                originalQuantity: data.quantity,
                remainingQuantity: data.quantity,
                purchasePrice: data.price,
                categoryId: data.categoryId,
                createdAt: new Date()
            } as InventoryBatch;
        },
        getValue: async () => {
            console.log('[Mock API] Liczenie wartości magazynu');
            return 0;
        },
        getProducts: async () => {
            console.log('[Mock API] Pobieranie listy produktów');
            return mockProducts;
        },
        addProduct: async (payload) => {
            console.log('[Mock API] Dodawanie produktu:', payload);
            const newProduct: Product = { id: `p-${Date.now()}`, ...payload };
            mockProducts.push(newProduct);
            return newProduct;
        },
        getProductHistory: async (productId: string) => {
            console.log('[Mock API] Pobieranie historii produktu:', productId);
            return []; // Mock return empty for now
        },
        getInventoryDocumentDetails: async (documentId: string) => {
            console.log('[Mock API] Pobieranie szczegółów dokumentu:', documentId);
            return mockDocuments.find(d => d.id === documentId) || null;
        }
    },
    finance: {
        createInvoice: async (data) => {
            console.log('[Mock API] (Legacy) Tworzenie faktury zakupu:', data);
            return {
                id: 'mock-invoice',
                invoiceNumber: 'FV/MOCK/001',
                supplier: 'Dostawca Mock',
                supplierNip: '1234567890',
                invoiceDate: new Date().toISOString(),
                grossAmount: 1000,
                currency: 'PLN',
                status: 'NEW',
                isMpp: false,
                createdAt: new Date()
            } as PurchaseInvoice;
        },
        getInvoices: async () => {
            console.log('[Mock API] Pobieranie faktur');
            return [...mockInvoices];
        },
        addInvoice: async (invoice, items) => {
            console.log('[Mock API] Zapisywanie faktury wraz z pozycjami:', { invoice, items });
            const newInvoice: InvoiceData = {
                ...invoice as InvoiceData,
                id: `mock-${Date.now()}`,
                items,
                createdAt: new Date()
            };
            mockInvoices.unshift(newInvoice);

            // Symulacja TICKET 4 w Mocku
            items.forEach(item => {
                if (item.type === 'TOWAR') {
                    // Udajemy tworzenie produktu ręcznego
                    if (!item.productId) {
                        const newProd: Product = {
                            id: `p-manual-${Date.now()}-${Math.random()}`,
                            name: item.productName!,
                            type: 'TOWAR',
                            unit: item.unit || 'szt.',
                            vatRate: item.vatRate || '23%',
                            isActive: true
                        };
                        mockProducts.push(newProd);
                        item.productId = newProd.id;
                        console.log('[Mock API] Utworzono wirtualny produkt:', newProd.name);
                    }

                    // Udajemy dokument PZ/WZ
                    const docType = newInvoice.type === 'SALE' ? 'WZ' : 'PZ';
                    const docNum = `${docType}/2026/02/${Math.floor(Math.random() * 900) + 100}`;
                    mockDocuments.push({
                        id: `doc-${Date.now()}`,
                        documentNumber: docNum,
                        type: docType,
                        date: new Date(),
                        referenceId: newInvoice.invoiceNumber,
                        items: [{
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.priceNetCents / 100
                        }]
                    });
                    console.log(`[Mock API] Wygenerowano dokument ${docNum} dla ${item.productName}`);
                }
            });

            return newInvoice;
        },
        updateInvoice: async (id, invoice, items) => {
            console.log('[Mock API] Aktualizowanie faktury:', { id, invoice, items });
            const index = mockInvoices.findIndex(inv => inv.id === id);
            if (index !== -1) {
                const updatedInvoice: InvoiceData = {
                    ...mockInvoices[index],
                    ...invoice as InvoiceData,
                    id,
                    items,
                    updatedAt: new Date()
                } as any;
                mockInvoices[index] = updatedInvoice;
                return updatedInvoice;
            }
            throw new Error("Faktura nie znaleziona w Mock API");
        },
        getFinancialSummary: async () => {
            console.log('[Mock API] Pobieranie podsumowania finansowego');
            let totalIncomesCents = 0;
            let totalExpensesCents = 0;

            mockInvoices.forEach(inv => {
                if (inv.type === 'SALE') {
                    totalIncomesCents += inv.totalGrossCents;
                } else {
                    totalExpensesCents += inv.totalGrossCents;
                }
            });

            return {
                totalIncomesCents,
                totalExpensesCents,
                balanceCents: totalIncomesCents - totalExpensesCents
            };
        },
        printInvoice: async (id: string) => {
            const invoice = mockInvoices.find(inv => inv.id === id);
            const formattedAmount = invoice
                ? new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' }).format(invoice.totalGrossCents / 100)
                : '0,00 zł';
            console.log(`[Mock API] Generowanie PDF dla faktury: ${id}. Kwota: ${formattedAmount}`);
            await new Promise(resolve => setTimeout(resolve, 1500));
            alert(`[Symulacja] Dokument Faktura_${invoice?.invoiceNumber || id}.pdf został przygotowany.`);
        },
        sendToKsef: async (id: string) => {
            const invoice = mockInvoices.find(inv => inv.id === id);
            if (!invoice) return;

            console.log(`[Mock API] Wysyłanie faktury ${invoice.invoiceNumber} do KSeF...`);
            invoice.ksefStatus = KsefStatus.OCZEKUJE;

            setTimeout(() => {
                invoice.ksefStatus = KsefStatus.PRZYJĘTO;
                invoice.ksefReferenceNumber = `KSEF-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
                console.log(`[Mock API] Faktura ${invoice.invoiceNumber} zaakceptowana przez KSeF. Ref: ${invoice.ksefReferenceNumber}`);
                alert(`Faktura ${invoice.invoiceNumber} została poprawnie zarejestrowana w KSeF.`);
            }, 2000);
        }
    },
    projects: {
        createProject: async (data) => {
            console.log('[Mock API] Tworzenie projektu:', data);
            return {
                id: 'mock-project',
                ...data,
                status: 'NEW',
                clientName: 'Klient Mock',
                totalMaterialCost: 0,
                createdAt: new Date()
            } as Project;
        },
        update: async (data) => {
            console.log('[Mock API] Aktualizacja projektu:', data);
            return { ...data, createdAt: new Date() } as Project;
        },
        getAll: async () => {
            console.log('[Mock API] Pobieranie projektów');
            return [];
        }
    },
    clients: {
        create: async (data) => {
            console.log('[Mock API] Tworzenie klienta:', data);
            const newClient: Client = {
                id: `c-${Date.now()}`,
                name: data.name || 'Nowy Kontrahent',
                nip: data.nip || '',
                regon: data.regon || '',
                email: data.email || '',
                street: data.street || '',
                postalCode: data.postalCode || '',
                city: data.city || '',
                type: data.type || 'FIRMA',
                createdAt: new Date()
            };
            mockClients.push(newClient);
            return newClient;
        },
        update: async (data) => {
            console.log('[Mock API] Aktualizacja klienta:', data);
            const index = mockClients.findIndex(c => c.id === data.id);
            if (index !== -1) {
                mockClients[index] = { ...mockClients[index], ...data };
                return mockClients[index];
            }
            return { ...data, createdAt: new Date() } as Client;
        },
        getAll: async () => {
            console.log('[Mock API] Pobieranie klientów');
            return [...mockClients];
        },
        deleteClient: async (id: string) => {
            console.log('[Mock API] Usuwanie klienta:', id);
            const index = mockClients.findIndex(c => c.id === id);
            if (index !== -1) {
                mockClients.splice(index, 1);
            }
        },
        fetchGusData: async (nip: string) => {
            console.log(`[Mock API] Zapytanie do bazy GUS dla numeru NIP: ${nip}`);

            if (nip === '1234567890') {
                return {
                    name: "PRODECO GARDEN Sp. z o.o.",
                    street: "ul. Kwiatowa 15",
                    postalCode: "01-234",
                    city: "Warszawa",
                    regon: "123456789",
                    type: "FIRMA"
                };
            }

            // Symulacja ładowania
            await new Promise(resolve => setTimeout(resolve, 800));

            return {
                name: `Firma Testowa ${nip}`,
                street: `ul. Testowa ${Math.floor(Math.random() * 100)}`,
                postalCode: `${Math.floor(Math.random() * 9)}0-${Math.floor(Math.random() * 9)}00`,
                city: "Gdańsk",
                type: "FIRMA"
            };
        }
    },

    dictionaries: {
        getAll: async () => {
            console.log('[Mock API] Pobieranie słowników');
            return mockDictionaries;
        },
        add: async (data) => {
            console.log('[Mock API] Dodawanie elementu słownika:', data);
            return { id: Math.random().toString(), ...data, isSystem: false } as DictionaryItem;
        },
        update: async (data) => {
            console.log('[Mock API] Aktualizacja słownika:', data);
            return { id: data.id, value: data.value, code: data.code || '', category: 'UNKNOWN', isSystem: false };
        },
        delete: async (id) => {
            console.log('[Mock API] Usuwanie elementu słownika:', id);
        }
    },

    // Window Controls
    minimize: () => console.log('[Mock API] Minimalizacja'),
    maximize: () => console.log('[Mock API] Maksymalizacja'),
    close: () => console.log('[Mock API] Zamknięcie'),

    // Legacy support (redirects to modular)
    getInventory: async () => mockApi.inventory.getAll(),
    getInventoryDocuments: async () => mockApi.inventory.getDocuments(),
    addStock: async (data) => mockApi.inventory.addStock(data),
    getInventoryValue: async () => mockApi.inventory.getValue(),
    createInvoice: async (data) => mockApi.finance.createInvoice(data),
    getInvoices: async () => mockApi.finance.getInvoices(),
    createProject: async (data) => mockApi.projects.createProject(data),
    getProjects: async () => mockApi.projects.getAll(),
    createClient: async (data) => mockApi.clients.create(data),
    getClients: async () => mockApi.clients.getAll(),
    deleteClient: async (id: string) => mockApi.clients.deleteClient(id),
    fetchGusData: async (nip) => mockApi.clients.fetchGusData(nip),
    getDictionaries: async () => mockApi.dictionaries.getAll(),
    addDictionary: async (data) => mockApi.dictionaries.add(data),
    updateDictionary: async (data) => mockApi.dictionaries.update(data),
    deleteDictionary: async (id) => mockApi.dictionaries.delete(id),
    printInvoice: async (id: string) => mockApi.finance.printInvoice(id),
    sendToKsef: async (id: string) => mockApi.finance.sendToKsef(id),
    getProductHistory: async (productId: string) => mockApi.inventory.getProductHistory(productId),
    getInventoryDocumentDetails: async (documentId: string) => mockApi.inventory.getInventoryDocumentDetails(documentId),
};
