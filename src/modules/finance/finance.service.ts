import { DataSource, EntityManager } from "typeorm"
import { PurchaseInvoice } from "./domain/purchase-invoice.entity"
import { PurchaseInvoiceItem } from "./domain/purchase-invoice-item.entity"
import { InventoryService } from "../inventory/inventory.service"
import { DocumentType } from "../inventory/domain/inventory-document.entity"
import { Invoice, InvoiceType } from "../../database/entities/invoice.entity"
import { Expense } from "../../database/entities/expense.entity"
import { InvoiceService } from "../../services/invoice.service"
import { InvoiceItem } from "../../database/entities/invoice-item.entity"
import { Product, ProductType } from "../../database/entities/product.entity"

export class FinanceService {
    private invoiceService: InvoiceService;

    constructor(private dataSource: DataSource | EntityManager) {
        this.invoiceService = new InvoiceService();
    }

    async createPurchaseInvoice(dto: {
        invoiceNumber: string,
        vendorName: string,
        supplierNip: string,
        supplierAddress: string,
        invoiceDate: string,
        isMpp: boolean,
        ksefId?: string,
        items: {
            productId: string,
            quantity: number,
            netPrice: number,
            vatRate: string,
            vatAmount: number,
            grossPrice: number,
            batchNumber: string,
            gtuCode?: string
        }[]
    }): Promise<PurchaseInvoice> {
        return await this.dataSource.transaction(async (transactionalEntityManager) => {
            // Create Invoice
            const invoice = new PurchaseInvoice()
            invoice.supplier = dto.vendorName
            invoice.supplierNip = dto.supplierNip
            invoice.supplierAddress = dto.supplierAddress
            invoice.invoiceNumber = dto.invoiceNumber
            invoice.invoiceDate = new Date(dto.invoiceDate)
            invoice.isMpp = dto.isMpp
            invoice.ksefId = dto.ksefId

            // Map Items
            invoice.items = dto.items.map(itemDto => {
                const item = new PurchaseInvoiceItem()
                item.productId = itemDto.productId
                item.quantity = itemDto.quantity
                item.netPrice = itemDto.netPrice
                item.vatRate = itemDto.vatRate
                item.vatAmount = itemDto.vatAmount
                item.grossPrice = itemDto.grossPrice
                item.batchNumber = itemDto.batchNumber
                item.gtuCode = itemDto.gtuCode
                return item
            })

            // Calculate total
            const totalGross = dto.items.reduce((sum, item) => sum + (item.quantity * item.grossPrice), 0)
            const totalVat = dto.items.reduce((sum, item) => sum + (item.quantity * item.vatAmount), 0)

            invoice.grossAmount = totalGross
            invoice.vatAmount = totalVat
            invoice.currency = 'PLN' // Default
            invoice.status = 'POSTED' // Default

            // Save Invoice using transactional manager
            const savedInvoice = await transactionalEntityManager.save(PurchaseInvoice, invoice)

            // Create Inventory Batches for each item
            // We need to use the inventory service but ensure it uses the SAME transaction.
            // Refactoring InventoryService to accept a manager in methods or constructor is good.
            // My InventoryService already accepts `DataSource | EntityManager`.
            // So I should instantiate a temporary InventoryService scoped to this transaction.

            const transactionalInventoryService = new InventoryService(transactionalEntityManager)

            // Generate PZ Document using net price typical for accounting inventory valuation
            const pzItems = dto.items.map(i => ({
                productId: i.productId,
                quantity: i.quantity,
                price: i.netPrice
            }))
            await transactionalInventoryService.createDocument(DocumentType.PZ, savedInvoice.invoiceNumber, pzItems)

            for (const item of dto.items) {
                // Check if product is TOWAR
                const product = await transactionalEntityManager.findOne(Product, { where: { id: item.productId } });
                if (product && product.type === ProductType.TOWAR) {
                    await transactionalInventoryService.addStock(
                        item.productId,
                        item.batchNumber || savedInvoice.invoiceNumber,
                        item.quantity,
                        item.netPrice,
                        product.unit
                    )
                } else {
                    console.log(`[FinanceService] Skipping inventory batch for non-GOODS product: ${item.productId}`);
                }
            }

            return savedInvoice
        })
    }

    async getPurchaseInvoices(): Promise<PurchaseInvoice[]> {
        return await this.dataSource.getRepository(PurchaseInvoice).find({
            order: {
                createdAt: 'DESC'
            }
        });
    }

    // Metody Modułu Finansowego (Master Plan)
    async getAllInvoices(): Promise<Invoice[]> {
        return await this.dataSource.getRepository(Invoice).find({
            relations: ["items"],
            order: {
                issueDate: 'DESC'
            }
        });
    }

    async addInvoice(invoicePayload: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
        return await this.invoiceService.createInvoice(invoicePayload, items);
    }

    async updateInvoice(id: string, invoicePayload: Partial<Invoice>, items: Partial<InvoiceItem>[]): Promise<Invoice> {
        return await this.invoiceService.updateInvoice(id, invoicePayload, items);
    }

    async getFinancialSummary(): Promise<{ totalIncomesCents: number, totalExpensesCents: number, balanceCents: number }> {
        const invoices = await this.dataSource.getRepository(Invoice).find();
        const expenses = await this.dataSource.getRepository(Expense).find();

        let totalIncomesCents = 0;
        let totalExpensesCents = 0;

        invoices.forEach(inv => {
            if (inv.type === InvoiceType.SALE) {
                totalIncomesCents += inv.totalGrossCents;
            } else {
                totalExpensesCents += inv.totalGrossCents;
            }
        });

        expenses.forEach(exp => {
            totalExpensesCents += exp.amountCents;
        });

        return {
            totalIncomesCents,
            totalExpensesCents,
            balanceCents: totalIncomesCents - totalExpensesCents
        };
    }
}
