import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
    // Inventory
    inventory: {
        getAll: () => ipcRenderer.invoke('inventory:getAll'),
        getDocuments: () => ipcRenderer.invoke('inventory:getDocuments'),
        addStock: (data: { productId: string; batchNumber: string; quantity: number; price: number; categoryId: string }) =>
            ipcRenderer.invoke('inventory:addStock', data),
        getValue: () => ipcRenderer.invoke('inventory:getValue'),
        getProducts: () => ipcRenderer.invoke('inventory:getProducts'),
        getProductHistory: (productId: string) => ipcRenderer.invoke('inventory:getProductHistory', productId),
        getInventoryDocumentDetails: (documentId: string) => ipcRenderer.invoke('inventory:getInventoryDocumentDetails', documentId),
    },

    // Finance
    finance: {
        createInvoice: (data: any) => ipcRenderer.invoke('finance:createInvoice', data),
        getInvoices: () => ipcRenderer.invoke('finance:getInvoices'),
        addInvoice: (invoice: any, items: any[]) => ipcRenderer.invoke('finance:addInvoice', invoice, items),
        updateInvoice: (id: string, invoice: any, items: any[]) => ipcRenderer.invoke('finance:updateInvoice', id, invoice, items),
        getFinancialSummary: () => ipcRenderer.invoke('finance:getFinancialSummary'),
        printInvoice: (invoiceId: string) => ipcRenderer.invoke('finance:printInvoice', invoiceId),
        sendToKsef: (invoiceId: string) => ipcRenderer.invoke('finance:sendToKsef', invoiceId),
        generatePdf: (invoiceId: string) => ipcRenderer.invoke('finance:generatePdf', invoiceId),
    },


    // Projects
    projects: {
        createProject: (data: { name: string; description?: string; clientId: string }) =>
            ipcRenderer.invoke('projects:createProject', data),
        update: (data: { id: string; name: string; description?: string; status: string; clientId: string }) =>
            ipcRenderer.invoke('projects:update', data),
        getAll: () => ipcRenderer.invoke('projects:getAll'),
    },

    // Clients
    clients: {
        create: (data: any) => ipcRenderer.invoke('clients:create', data),
        update: (data: any) => ipcRenderer.invoke('clients:update', data),
        getAll: () => ipcRenderer.invoke('clients:getAll'),
        fetchGusData: (nip: string) => ipcRenderer.invoke('clients:fetchGusData', nip),
    },

    // System / Dictionaries
    dictionaries: {
        getAll: () => ipcRenderer.invoke('dictionaries:getAll'),
        add: (data: { category: string; value: string; code?: string }) =>
            ipcRenderer.invoke('dictionaries:add', data),
        update: (data: { id: string; value: string; code?: string }) =>
            ipcRenderer.invoke('dictionaries:update', data),
        delete: (id: string) => ipcRenderer.invoke('dictionaries:delete', id),
    },

    // Settings
    settings: {
        getProfile: () => ipcRenderer.invoke('settings:getProfile'),
        updateProfile: (data: any) => ipcRenderer.invoke('settings:updateProfile', data),
        getNumberingSchemes: (target?: string) => ipcRenderer.invoke('settings:getNumberingSchemes', target),
        updateNumberingScheme: (data: any) => ipcRenderer.invoke('settings:updateNumberingScheme', data),
        testNumbering: (target: string) => ipcRenderer.invoke('settings:testNumbering', target),
    },

    // Legacy / Flat support (matching previous structure)
    getInventory: () => ipcRenderer.invoke('inventory:getAll'),
    getInventoryDocuments: () => ipcRenderer.invoke('inventory:getDocuments'),
    addStock: (data: any) => ipcRenderer.invoke('inventory:addStock', data),
    getInventoryValue: () => ipcRenderer.invoke('inventory:getValue'),
    createInvoice: (data: any) => ipcRenderer.invoke('finance:createInvoice', data),
    getInvoices: () => ipcRenderer.invoke('finance:getInvoices'),
    addInvoice: (invoice: any, items: any[]) => ipcRenderer.invoke('finance:addInvoice', invoice, items),
    updateInvoice: (id: string, invoice: any, items: any[]) => ipcRenderer.invoke('finance:updateInvoice', id, invoice, items),
    getFinancialSummary: () => ipcRenderer.invoke('finance:getFinancialSummary'),
    createProject: (data: any) => ipcRenderer.invoke('projects:createProject', data),
    getProjects: () => ipcRenderer.invoke('projects:getAll'),
    createClient: (data: any) => ipcRenderer.invoke('clients:create', data),
    getClients: () => ipcRenderer.invoke('clients:getAll'),
    getDictionaries: () => ipcRenderer.invoke('dictionaries:getAll'),
    addDictionary: (data: any) => ipcRenderer.invoke('dictionaries:add', data),
    updateDictionary: (data: any) => ipcRenderer.invoke('dictionaries:update', data),
    deleteDictionary: (id: string) => ipcRenderer.invoke('dictionaries:delete', id),
    getProductHistory: (productId: string) => ipcRenderer.invoke('inventory:getProductHistory', productId),

    // Window Controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
}

contextBridge.exposeInMainWorld('electron', electronAPI)

