import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { AppDataSource } from '../src/core/db/data-source'
import { InventoryService } from '../src/modules/inventory/inventory.service'
import { FinanceService } from '../src/modules/finance/finance.service'
import { ProjectService } from '../src/modules/projects/project.service'
import { ClientService } from '../src/modules/clients/client.service'
import { DictionaryService } from '../src/modules/system/dictionary.service'
import { PrintService } from '../src/services/print.service'
import { KsefService } from '../src/services/ksef.service'

// Main Process Logic
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')

let win: BrowserWindow | null
let inventoryService: InventoryService

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
    win = new BrowserWindow({
        width: 1200,
        height: 800,
        frame: false, // Frameless for custom Aurora UI
        titleBarStyle: 'hidden',
        backgroundColor: '#0f172a', // Dark theme background
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: false,
        },
    })

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL)
    } else {
        if (!process.env.DIST) throw new Error("DIST path not defined")
        win.loadFile(path.join(process.env.DIST, 'index.html'))
    }
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})

app.whenReady().then(async () => {
    // Register Window Controls before anything else to ensure the app can be closed even if DB crashes
    ipcMain.on('window:minimize', () => {
        console.log('[IPC] window:minimize called');
        const focusedWin = BrowserWindow.getFocusedWindow();
        focusedWin?.minimize();
    })
    ipcMain.on('window:maximize', () => {
        console.log('[IPC] window:maximize called');
        const focusedWin = BrowserWindow.getFocusedWindow();
        if (focusedWin?.isMaximized()) {
            focusedWin?.unmaximize();
        } else {
            focusedWin?.maximize();
        }
    })
    ipcMain.on('window:close', () => {
        console.log('[IPC] window:close called');
        const focusedWin = BrowserWindow.getFocusedWindow();
        focusedWin?.close();
    })

    // Initialize Database - Fail Fast!
    await AppDataSource.initialize()
    console.log("Database initialized")

    inventoryService = new InventoryService(AppDataSource)
    const financeService = new FinanceService(AppDataSource)
    const projectService = new ProjectService(AppDataSource)
    const clientService = new ClientService(AppDataSource)
    const printService = new PrintService()
    const ksefService = new KsefService()

    const dictionaryService = new DictionaryService(AppDataSource)
    await dictionaryService.seedDefaults()

    // Register IPC Handlers
    ipcMain.handle('projects:createProject', async (_, data) => {
        return await projectService.createProject(data)
    })

    ipcMain.handle('projects:getAll', async () => {
        return await projectService.getProjects()
    })

    ipcMain.handle('inventory:getAll', async () => {
        return await inventoryService.getStockLevels()
    })

    ipcMain.handle('inventory:getDocuments', async () => {
        return await inventoryService.getDocuments()
    })

    ipcMain.handle('inventory:addStock', async (_, data) => {
        const { productId, batchNumber, quantity, price, categoryId, unit } = data
        return await inventoryService.addStock(productId, batchNumber, quantity, price, unit, categoryId)
    })

    ipcMain.handle('inventory:getValue', async () => {
        return await inventoryService.getTotalInventoryValue()
    })

    ipcMain.handle('inventory:getProducts', async () => {
        return await inventoryService.getProducts()
    })

    ipcMain.handle('inventory:getProductHistory', async (_, productId) => {
        return await inventoryService.getProductHistory(productId)
    })

    ipcMain.handle('inventory:getInventoryDocumentDetails', async (_, documentId) => {
        return await inventoryService.getInventoryDocumentDetails(documentId)
    })

    ipcMain.handle('finance:createInvoice', async (_, data) => {
        return await financeService.createPurchaseInvoice(data)
    })

    ipcMain.handle('finance:getInvoices', async () => {
        return await financeService.getAllInvoices() // Renamed to avoid confusion with legacy
    })

    ipcMain.handle('finance:addInvoice', async (_, invoice, items) => {
        return await financeService.addInvoice(invoice, items)
    })
    ipcMain.handle('finance:updateInvoice', async (_, id, invoice, items) => {
        return await financeService.updateInvoice(id, invoice, items)
    })

    ipcMain.handle('finance:getFinancialSummary', async () => {
        return await financeService.getFinancialSummary()
    })

    ipcMain.handle('finance:printInvoice', async (_, invoiceId) => {
        return await printService.printInvoice(invoiceId)
    })

    ipcMain.handle('finance:sendToKsef', async (_, invoiceId) => {
        // Generujemy XML (logowanie)
        await ksefService.generateKsefXml(invoiceId)
        // Aktualizujemy status na OCZEKUJE (symulacja)
        // W realnym systemie tutaj byłaby wysyłka asynchroniczna
        return await ksefService.updateKsefStatus(invoiceId, 'OCZEKUJE' as any)
    })

    ipcMain.handle('clients:create', async (_, data) => {
        return await clientService.createClient(data)
    })

    ipcMain.handle('clients:getAll', async () => {
        return await clientService.getClients()
    })

    ipcMain.handle('clients:update', async (_, data) => {
        return await clientService.updateClient(data.id, data)
    })

    ipcMain.handle('dictionaries:getAll', async () => {
        return await dictionaryService.getDictionaries()
    })

    ipcMain.handle('dictionaries:add', async (_, data) => {
        return await dictionaryService.addDictionary(data.category, data.value, data.code)
    })

    ipcMain.handle('dictionaries:update', async (_, data) => {
        return await dictionaryService.updateDictionary(data.id, data.value, data.code)
    })

    ipcMain.handle('dictionaries:delete', async (_, id) => {
        return await dictionaryService.deleteDictionary(id)
    })




    createWindow()
})
