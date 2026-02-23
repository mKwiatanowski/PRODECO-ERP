import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../core/base.entity";
import { PurchaseInvoice } from "./purchase-invoice.entity";
@Entity("purchase_invoice_items")
export class PurchaseInvoiceItem extends BaseEntity {
    @Column({ type: 'varchar' })
    invoiceId;
    @ManyToOne(() => PurchaseInvoice, invoice => invoice.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'invoiceId' })
    invoice;
    @Column({ type: 'varchar' })
    productId;
    @Column("decimal", { precision: 10, scale: 2 })
    quantity;
    @Column("decimal", { precision: 10, scale: 2 })
    netPrice;
    @Column({ type: 'varchar' })
    vatRate; // np. "23%", "8%", "ZW"
    @Column("decimal", { precision: 10, scale: 2 })
    vatAmount;
    @Column("decimal", { precision: 10, scale: 2 })
    grossPrice;
    @Column({ type: 'varchar', nullable: true })
    gtuCode;
    @Column({ type: 'varchar' })
    batchNumber;
}
