import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../core/base.entity"
import { InvoiceItem } from "./invoice-item.entity"
import { Client } from "./client.entity"

export enum InvoiceType {
    PURCHASE = "PURCHASE",
    SALE = "SALE"
}

export enum KsefStatus {
    NIEPRZESŁANO = "NIEPRZESŁANO",
    OCZEKUJE = "OCZEKUJE",
    PRZYJĘTO = "PRZYJĘTO",
    BŁĄD = "BŁĄD"
}

@Entity("invoices")
export class Invoice extends BaseEntity {
    @Column({
        type: "simple-enum",
        enum: InvoiceType,
        default: InvoiceType.SALE
    })
    type: InvoiceType

    @Column({ type: "varchar" })
    invoiceNumber: string

    @Column({ type: "datetime" })
    issueDate: Date

    @Column({ type: "datetime" })
    dueDate: Date

    @Column({ type: "varchar", nullable: true })
    nip: string

    @Column({ type: "varchar", nullable: true })
    ksefId: string

    @Column({ type: "varchar", default: "PLN" })
    currency: string

    @Column({ type: "integer", default: 0 })
    totalNetCents: number

    @Column({ type: "integer", default: 0 })
    totalVatCents: number

    @Column({ type: "integer", default: 0 })
    totalGrossCents: number

    @Column({ type: "boolean", default: false })
    isPaid: boolean

    @Column({
        type: "simple-enum",
        enum: KsefStatus,
        default: KsefStatus.NIEPRZESŁANO
    })
    ksefStatus: KsefStatus

    @Column({ type: "varchar", nullable: true })
    ksefReferenceNumber: string

    @Column({ type: "varchar", nullable: true })
    ksefArchiveLink: string

    @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
    items: InvoiceItem[]

    @Column({ type: "uuid", nullable: true })
    clientId: string

    @ManyToOne(() => Client, (client) => client.invoices)
    @JoinColumn({ name: "clientId" })
    client: Client
}
