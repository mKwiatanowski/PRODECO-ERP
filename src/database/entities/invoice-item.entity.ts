import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../core/base.entity"
import { Invoice } from "./invoice.entity"

@Entity("invoice_items")
export class InvoiceItem extends BaseEntity {
    @Column({ type: "uuid" })
    invoiceId: string

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "invoiceId" })
    invoice: Invoice

    @Column({ type: "varchar", default: "" })
    description: string

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    quantity: number

    @Column({ type: "varchar", default: "szt." })
    unit: string

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    netPrice: number

    @Column({ type: "varchar", default: "23%" })
    vatRate: string // np. 23, 8, 5, zw

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    netValue: number

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    vatValue: number

    @Column({ type: "decimal", precision: 10, scale: 2, default: 0 })
    grossValue: number

    // Optional: Keep productId for inventory tracking if needed by existing logic
    @Column({ type: "varchar", nullable: true })
    productId: string | null

    @Column({ type: "varchar", nullable: true })
    productName: string | null

    @Column({ type: "integer", default: 0 })
    priceNetCents: number

    @Column({ type: "integer", default: 0 })
    vatValueCents: number

    @Column({ type: "integer", default: 0 })
    priceGrossCents: number
}
