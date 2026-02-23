import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../core/base.entity";
import { PurchaseInvoiceItem } from "./purchase-invoice-item.entity";
@Entity("purchase_invoices")
export class PurchaseInvoice extends BaseEntity {
    @Column({ type: 'varchar' })
    supplier;
    @Column({ type: 'varchar' })
    supplierNip;
    @Column({ type: 'varchar' })
    supplierAddress;
    @Column({ type: 'varchar' })
    invoiceNumber;
    @Column({ type: 'date' })
    invoiceDate;
    @Column({ type: 'varchar', length: 40, nullable: true })
    ksefId;
    @Column({ type: 'boolean', default: false })
    isMpp;
    @Column('decimal', { precision: 10, scale: 2 })
    vatAmount;
    @Column('decimal', { precision: 10, scale: 2 })
    grossAmount;
    @Column({ type: 'varchar' })
    currency;
    @Column({ type: 'varchar' })
    status;
    @OneToMany(() => PurchaseInvoiceItem, item => item.invoice, { cascade: true })
    items;
}
