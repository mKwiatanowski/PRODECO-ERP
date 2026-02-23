import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
import { Invoice } from "./invoice.entity";
@Entity("invoice_items")
export class InvoiceItem extends BaseEntity {
    @Column({ type: "varchar" })
    invoiceId;
    @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
    @JoinColumn({ name: "invoiceId" })
    invoice;
    @Column({ type: "varchar", nullable: true })
    productId;
    @Column({ type: "varchar", nullable: true })
    productName;
    @Column({
        type: "varchar",
        default: "USLUGA"
    })
    type; // 'TOWAR' | 'USLUGA'
    @Column({ type: "varchar", nullable: true })
    unit;
    @Column({ type: "decimal", precision: 10, scale: 2 })
    quantity;
    @Column({ type: "integer" })
    priceNetCents;
    @Column({ type: "varchar" })
    vatRate; // np. 23%, 8%, zw
    @Column({ type: "integer" })
    vatValueCents;
    @Column({ type: "integer" })
    priceGrossCents;
}
