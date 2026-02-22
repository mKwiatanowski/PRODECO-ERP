import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"
import { PurchaseInvoice } from "./purchase-invoice.entity"

@Entity("purchase_invoice_items")
export class PurchaseInvoiceItem extends BaseEntity {
    @Column({ type: 'varchar' })
    invoiceId: string

    @ManyToOne(() => PurchaseInvoice, invoice => invoice.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoiceId' })
    invoice: PurchaseInvoice

    @Column({ type: 'varchar' })
    productId: string

    @Column("decimal", { precision: 10, scale: 2 })
    quantity: number

    @Column("decimal", { precision: 10, scale: 2 })
    netPrice: number

    @Column({ type: 'varchar' })
    vatRate: string // np. "23%", "8%", "ZW"

    @Column("decimal", { precision: 10, scale: 2 })
    vatAmount: number

    @Column("decimal", { precision: 10, scale: 2 })
    grossPrice: number

    @Column({ type: 'varchar', nullable: true })
    gtuCode?: string

    @Column({ type: 'varchar' })
    batchNumber: string
}
