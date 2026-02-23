import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../core/base.entity"
import { Invoice } from "./invoice.entity"

@Entity("invoice_items")
export class InvoiceItem extends BaseEntity {
    @Column({ type: "varchar" })
    invoiceId: string

    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "invoiceId" })
    invoice: Invoice

    @Column({ type: "varchar", nullable: true })
    productId: string | null

    @Column({ type: "varchar", nullable: true })
    productName: string | null

    @Column({
        type: "varchar",
        default: "USLUGA"
    })
    type: string // 'TOWAR' | 'USLUGA'

    @Column({ type: "varchar", nullable: true })
    unit: string | null

    @Column({ type: "decimal", precision: 10, scale: 2 })
    quantity: number

    @Column({ type: "integer" })
    priceNetCents: number

    @Column({ type: "varchar" })
    vatRate: string // np. 23%, 8%, zw

    @Column({ type: "integer" })
    vatValueCents: number

    @Column({ type: "integer" })
    priceGrossCents: number
}
