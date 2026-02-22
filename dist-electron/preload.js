"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electron", {
  // Inventory
  getInventory: () => electron.ipcRenderer.invoke("inventory:getAll"),
  getInventoryDocuments: () => electron.ipcRenderer.invoke("inventory:getDocuments"),
  addStock: (data) => electron.ipcRenderer.invoke("inventory:addStock", data),
  getInventoryValue: () => electron.ipcRenderer.invoke("inventory:getValue"),
  // Finance
  createInvoice: (data) => electron.ipcRenderer.invoke("finance:createInvoice", data),
  getInvoices: () => electron.ipcRenderer.invoke("finance:getInvoices"),
  // Projects
  createProject: (data) => electron.ipcRenderer.invoke("projects:createProject", data),
  getProjects: () => electron.ipcRenderer.invoke("projects:getAll"),
  // Clients
  createClient: (data) => electron.ipcRenderer.invoke("clients:create", data),
  getClients: () => electron.ipcRenderer.invoke("clients:getAll"),
  // System / Dictionaries
  getDictionaries: () => electron.ipcRenderer.invoke("dictionaries:getAll"),
  addDictionary: (data) => electron.ipcRenderer.invoke("dictionaries:add", data),
  updateDictionary: (data) => electron.ipcRenderer.invoke("dictionaries:update", data),
  deleteDictionary: (id) => electron.ipcRenderer.invoke("dictionaries:delete", id),
  // Window Controls
  minimize: () => electron.ipcRenderer.send("window:minimize"),
  maximize: () => electron.ipcRenderer.send("window:maximize"),
  close: () => electron.ipcRenderer.send("window:close")
});
