import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
    // Inventory
    getInventory: () => ipcRenderer.invoke('inventory:getAll'),
    getInventoryDocuments: () => ipcRenderer.invoke('inventory:getDocuments'),
    addStock: (data: any) => ipcRenderer.invoke('inventory:addStock', data),
    getInventoryValue: () => ipcRenderer.invoke('inventory:getValue'),

    // Finance
    createInvoice: (data: any) => ipcRenderer.invoke('finance:createInvoice', data),
    getInvoices: () => ipcRenderer.invoke('finance:getInvoices'),

    // Projects
    createProject: (data: any) => ipcRenderer.invoke('projects:createProject', data),
    getProjects: () => ipcRenderer.invoke('projects:getAll'),

    // Clients
    createClient: (data: any) => ipcRenderer.invoke('clients:create', data),
    getClients: () => ipcRenderer.invoke('clients:getAll'),

    // System / Dictionaries
    getDictionaries: () => ipcRenderer.invoke('dictionaries:getAll'),
    addDictionary: (data: any) => ipcRenderer.invoke('dictionaries:add', data),
    updateDictionary: (data: any) => ipcRenderer.invoke('dictionaries:update', data),
    deleteDictionary: (id: string) => ipcRenderer.invoke('dictionaries:delete', id),

    // Window Controls
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
})
