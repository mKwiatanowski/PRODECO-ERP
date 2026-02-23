import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { Client } from "./client.entity";
export var InvoiceType;
(function (InvoiceType) {
    InvoiceType["PURCHASE"] = "PURCHASE";
    InvoiceType["SALE"] = "SALE";
})(InvoiceType || (InvoiceType = {}));
export var KsefStatus;
(function (KsefStatus) {
    KsefStatus["NIEPRZES\u0141ANO"] = "NIEPRZES\u0141ANO";
    KsefStatus["OCZEKUJE"] = "OCZEKUJE";
    KsefStatus["PRZYJ\u0118TO"] = "PRZYJ\u0118TO";
    KsefStatus["B\u0141\u0104D"] = "B\u0141\u0104D";
})(KsefStatus || (KsefStatus = {}));
@Entity("invoices")
export class Invoice extends BaseEntity {
    @Column({
        type: "simple-enum",
        enum: InvoiceType,
        default: InvoiceType.SALE
    })
    type;
    @Column({ type: "varchar" })
    invoiceNumber;
    @Column({ type: "datetime" })
    issueDate;
    @Column({ type: "datetime" })
    dueDate;
    @Column({ type: "varchar", nullable: true })
    nip;
    @Column({ type: "varchar", nullable: true })
    ksefId;
    @Column({ type: "varchar", default: "PLN" })
    currency;
    @Column({ type: "integer", default: 0 })
    totalNetCents;
    @Column({ type: "integer", default: 0 })
    totalVatCents;
    @Column({ type: "integer", default: 0 })
    totalGrossCents;
    @Column({ type: "boolean", default: false })
    isPaid;
    @Column({
        type: "simple-enum",
        enum: KsefStatus,
        default: KsefStatus.NIEPRZESŁANO
    })
    ksefStatus;
    @Column({ type: "varchar", nullable: true })
    ksefReferenceNumber;
    @Column({ type: "varchar", nullable: true })
    ksefArchiveLink;
    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items;
    @Column({ type: "uuid", nullable: true })
    clientId;
    @ManyToOne(() => Client, (client) => client.invoices)
    @JoinColumn({ name: "clientId" })
    client;
}
