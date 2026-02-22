import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"
import { PurchaseInvoiceItem } from "./purchase-invoice-item.entity"

@Entity("purchase_invoices")
export class PurchaseInvoice extends BaseEntity {
    @Column({ type: 'varchar' })
    supplier: string

    @Column({ type: 'varchar' })
    supplierNip: string

    @Column({ type: 'varchar' })
    supplierAddress: string

    @Column({ type: 'varchar' })
    invoiceNumber: string

    @Column({ type: 'date' })
    invoiceDate: Date

    @Column({ type: 'varchar', length: 40, nullable: true })
    ksefId?: string

    @Column({ type: 'boolean', default: false })
    isMpp: boolean

    @Column('decimal', { precision: 10, scale: 2 })
    vatAmount: number

    @Column('decimal', { precision: 10, scale: 2 })
    grossAmount: number

    @Column({ type: 'varchar' })
    currency: string

    @Column({ type: 'varchar' })
    status: string

    @OneToMany(() => PurchaseInvoiceItem, item => item.invoice, { cascade: true })
    items: PurchaseInvoiceItem[]
}

