export enum KsefStatus {
    NIEPRZESŁANO = "NIEPRZESŁANO",
    OCZEKUJE = "OCZEKUJE",
    PRZYJĘTO = "PRZYJĘTO",
    BŁĄD = "BŁĄD"
}

export interface DictionaryItem {
    id: string;
    category: string;
    code: string;
    value: string;
    isSystem: boolean;
}

export interface InventoryBatch {
    id: string;
    productId: string;
    batchNumber: string;
    originalQuantity: number;
    remainingQuantity: number;
    purchasePrice: number;
    categoryId?: string;
    createdAt: string | Date;
}

export interface StockLevel {
    productId: string;
    name: string;
    unit: string;
    vatRate: string;
    totalQuantity: number;
    fifoValue: number;
}

export interface Client {
    id: string;
    name: string;
    nip: string;
    regon?: string;
    email: string;
    phone?: string;
    address?: string;
    street: string;
    postalCode: string;
    city: string;
    type: string;
    isActive?: boolean;
    createdAt: string | Date;
}

export interface Project {
    id: string;
    name: string;
    description?: string;
    status: string;
    clientId: string;
    clientName: string;
    totalMaterialCost: number;
    createdAt: string | Date;
}

export interface PurchaseInvoice {
    id: string;
    invoiceNumber: string;
    supplier: string;
    supplierNip: string;
    invoiceDate: string | Date;
    grossAmount: number;
    currency: string;
    status: string;
    isMpp: boolean;
    createdAt: string | Date;
}

export interface Product {
    id: string;
    name: string;
    type: 'TOWAR' | 'USLUGA';
    gtuCode?: string;
    vatRate: string;
    unit: string;
    isActive: boolean;
    totalQuantity?: number;
}

export interface InvoiceItemData {
    id?: string;
    productId: string | null;
    productName?: string;
    type: 'TOWAR' | 'USLUGA';
    quantity: number;
    unit: string;
    priceNetCents: number;
    vatRate: string;
    vatValueCents: number;
    priceGrossCents: number;
}

export interface InvoiceData {
    id: string;
    type: 'PURCHASE' | 'SALE';
    invoiceNumber: string;
    issueDate: string | Date;
    dueDate: string | Date;
    clientId?: string;
    nip?: string;
    ksefId?: string;
    currency: string;
    totalNetCents: number;
    totalVatCents: number;
    totalGrossCents: number;
    isPaid: boolean;
    createdAt: string | Date;
    items?: InvoiceItemData[];
    ksefStatus?: KsefStatus;
    ksefReferenceNumber?: string;
    ksefArchiveLink?: string;
}

export interface ExpenseData {
    id: string;
    category: string;
    description?: string;
    amountCents: number;
    date: string | Date;
    createdAt: string | Date;
}

export interface FinancialSummary {
    totalIncomesCents: number;
    totalExpensesCents: number;
    balanceCents: number;
}

export interface IDictionaryAPI {
    getAll: () => Promise<Record<string, DictionaryItem[]>>;
    add: (data: { category: string; value: string; code?: string }) => Promise<DictionaryItem>;
    update: (data: { id: string; value: string; code?: string }) => Promise<DictionaryItem>;
    delete: (id: string) => Promise<void>;
}

export interface IInventoryAPI {
    getAll: () => Promise<StockLevel[]>;
    getDocuments: () => Promise<any[]>;
    addStock: (data: { productId: string; batchNumber: string; quantity: number; price: number; categoryId: string }) => Promise<InventoryBatch>;
    getValue: () => Promise<number>;

    // Obsługa Produktów
    getProducts: () => Promise<Product[]>;
    addProduct: (payload: Omit<Product, 'id'>) => Promise<Product>;
    getProductHistory: (productId: string) => Promise<any[]>;
    getInventoryDocumentDetails: (documentId: string) => Promise<any>;
}

export interface IFinanceAPI {
    // Legacy support
    createInvoice: (data: any) => Promise<PurchaseInvoice>;

    // Moduł Finansowy (Master Plan)
    getInvoices: () => Promise<InvoiceData[]>;
    addInvoice: (invoice: Partial<InvoiceData>, items: InvoiceItemData[]) => Promise<InvoiceData>;
    updateInvoice: (id: string, invoice: Partial<InvoiceData>, items: InvoiceItemData[]) => Promise<InvoiceData>;
    getFinancialSummary: () => Promise<FinancialSummary>;
    printInvoice: (invoiceId: string) => Promise<void>;
    sendToKsef: (invoiceId: string) => Promise<void>;
}

export interface IProjectAPI {
    createProject: (data: { name: string; description?: string; clientId: string }) => Promise<Project>;
    update: (data: { id: string; name: string; description?: string; status: string; clientId: string }) => Promise<Project>;
    getAll: () => Promise<Project[]>;
}

export interface IClientAPI {
    create: (data: Partial<Client>) => Promise<Client>;
    update: (data: Partial<Client> & { id: string }) => Promise<Client>;
    getAll: () => Promise<Client[]>;
    deleteClient: (id: string) => Promise<void>;
    fetchGusData: (nip: string) => Promise<Partial<Client>>;
}

export interface IElectronAPI {
    // Modules
    inventory: IInventoryAPI;
    finance: IFinanceAPI;
    projects: IProjectAPI;
    clients: IClientAPI;
    dictionaries: IDictionaryAPI;

    // Direct methods (legacy/flat support if needed, but moving to modular)
    getInventory: IInventoryAPI['getAll'];
    getInventoryDocuments: IInventoryAPI['getDocuments'];
    addStock: IInventoryAPI['addStock'];
    getInventoryValue: IInventoryAPI['getValue'];
    createInvoice: IFinanceAPI['createInvoice'];
    getInvoices: IFinanceAPI['getInvoices'];
    createProject: IProjectAPI['createProject'];
    getProjects: IProjectAPI['getAll'];
    createClient: IClientAPI['create'];
    getClients: IClientAPI['getAll'];
    deleteClient: IClientAPI['deleteClient'];
    fetchGusData: IClientAPI['fetchGusData'];
    getDictionaries: IDictionaryAPI['getAll'];
    addDictionary: IDictionaryAPI['add'];
    updateDictionary: IDictionaryAPI['update'];
    deleteDictionary: IDictionaryAPI['delete'];
    printInvoice: IFinanceAPI['printInvoice'];
    sendToKsef: IFinanceAPI['sendToKsef'];
    getProductHistory: IInventoryAPI['getProductHistory'];
    getInventoryDocumentDetails: IInventoryAPI['getInventoryDocumentDetails'];

    // Window Controls
    minimize: () => void;
    maximize: () => void;
    close: () => void;
}
