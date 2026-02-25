"use strict";
const electron = require("electron");
const electronAPI = {
  // Inventory
  inventory: {
    getAll: () => electron.ipcRenderer.invoke("inventory:getAll"),
    getDocuments: () => electron.ipcRenderer.invoke("inventory:getDocuments"),
    addStock: (data) => electron.ipcRenderer.invoke("inventory:addStock", data),
    getValue: () => electron.ipcRenderer.invoke("inventory:getValue"),
    getProducts: () => electron.ipcRenderer.invoke("inventory:getProducts"),
    getProductHistory: (productId) => electron.ipcRenderer.invoke("inventory:getProductHistory", productId),
    getInventoryDocumentDetails: (documentId) => electron.ipcRenderer.invoke("inventory:getInventoryDocumentDetails", documentId)
  },
  // Finance
  finance: {
    createInvoice: (data) => electron.ipcRenderer.invoke("finance:createInvoice", data),
    getInvoices: () => electron.ipcRenderer.invoke("finance:getInvoices"),
    addInvoice: (invoice, items) => electron.ipcRenderer.invoke("finance:addInvoice", invoice, items),
    updateInvoice: (id, invoice, items) => electron.ipcRenderer.invoke("finance:updateInvoice", id, invoice, items),
    getFinancialSummary: () => electron.ipcRenderer.invoke("finance:getFinancialSummary"),
    printInvoice: (invoiceId) => electron.ipcRenderer.invoke("finance:printInvoice", invoiceId),
    sendToKsef: (invoiceId) => electron.ipcRenderer.invoke("finance:sendToKsef", invoiceId),
    generatePdf: (invoiceId) => electron.ipcRenderer.invoke("finance:generatePdf", invoiceId)
  },
  // Projects
  projects: {
    createProject: (data) => electron.ipcRenderer.invoke("projects:createProject", data),
    update: (data) => electron.ipcRenderer.invoke("projects:update", data),
    getAll: () => electron.ipcRenderer.invoke("projects:getAll")
  },
  // Clients
  clients: {
    create: (data) => electron.ipcRenderer.invoke("clients:create", data),
    update: (data) => electron.ipcRenderer.invoke("clients:update", data),
    getAll: () => electron.ipcRenderer.invoke("clients:getAll"),
    fetchGusData: (nip) => electron.ipcRenderer.invoke("clients:fetchGusData", nip)
  },
  // System / Dictionaries
  dictionaries: {
    getAll: () => electron.ipcRenderer.invoke("dictionaries:getAll"),
    add: (data) => electron.ipcRenderer.invoke("dictionaries:add", data),
    update: (data) => electron.ipcRenderer.invoke("dictionaries:update", data),
    delete: (id) => electron.ipcRenderer.invoke("dictionaries:delete", id)
  },
  // Settings
  settings: {
    getProfile: () => electron.ipcRenderer.invoke("settings:getProfile"),
    updateProfile: (data) => electron.ipcRenderer.invoke("settings:updateProfile", data),
    getNumberingSchemes: (target) => electron.ipcRenderer.invoke("settings:getNumberingSchemes", target),
    updateNumberingScheme: (data) => electron.ipcRenderer.invoke("settings:updateNumberingScheme", data),
    testNumbering: (target) => electron.ipcRenderer.invoke("settings:testNumbering", target)
  },
  // Legacy / Flat support (matching previous structure)
  getInventory: () => electron.ipcRenderer.invoke("inventory:getAll"),
  getInventoryDocuments: () => electron.ipcRenderer.invoke("inventory:getDocuments"),
  addStock: (data) => electron.ipcRenderer.invoke("inventory:addStock", data),
  getInventoryValue: () => electron.ipcRenderer.invoke("inventory:getValue"),
  createInvoice: (data) => electron.ipcRenderer.invoke("finance:createInvoice", data),
  getInvoices: () => electron.ipcRenderer.invoke("finance:getInvoices"),
  addInvoice: (invoice, items) => electron.ipcRenderer.invoke("finance:addInvoice", invoice, items),
  updateInvoice: (id, invoice, items) => electron.ipcRenderer.invoke("finance:updateInvoice", id, invoice, items),
  getFinancialSummary: () => electron.ipcRenderer.invoke("finance:getFinancialSummary"),
  createProject: (data) => electron.ipcRenderer.invoke("projects:createProject", data),
  getProjects: () => electron.ipcRenderer.invoke("projects:getAll"),
  createClient: (data) => electron.ipcRenderer.invoke("clients:create", data),
  getClients: () => electron.ipcRenderer.invoke("clients:getAll"),
  getDictionaries: () => electron.ipcRenderer.invoke("dictionaries:getAll"),
  addDictionary: (data) => electron.ipcRenderer.invoke("dictionaries:add", data),
  updateDictionary: (data) => electron.ipcRenderer.invoke("dictionaries:update", data),
  deleteDictionary: (id) => electron.ipcRenderer.invoke("dictionaries:delete", id),
  getProductHistory: (productId) => electron.ipcRenderer.invoke("inventory:getProductHistory", productId),
  // Window Controls
  minimize: () => electron.ipcRenderer.send("window:minimize"),
  maximize: () => electron.ipcRenderer.send("window:maximize"),
  close: () => electron.ipcRenderer.send("window:close")
};
electron.contextBridge.exposeInMainWorld("electron", electronAPI);
