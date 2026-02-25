import { Entity, Column, OneToMany, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../core/base.entity"
import { InvoiceItem } from "./invoice-item.entity"
import { Client } from "./client.entity"
import { CompanyProfile } from "./company-profile.entity"

export enum InvoiceType {
    PURCHASE = "PURCHASE",
    SALE = "SALE"
}

export enum PaymentStatus {
    UNPAID = "UNPAID",
    PAID = "PAID",
    OVERDUE = "OVERDUE"
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

    @Column({ type: "varchar", default: "" })
    number: string

    @Column({ type: "datetime", nullable: true })
    issueDate: Date

    @Column({ type: "datetime", nullable: true })
    saleDate: Date

    @Column({ type: "datetime", nullable: true })
    dueDate: Date

    @Column({ type: "varchar", default: "Przelew" })
    paymentType: string // Przelew, Gotówka, itp.

    @Column({
        type: "simple-enum",
        enum: PaymentStatus,
        default: PaymentStatus.UNPAID
    })
    paymentStatus: PaymentStatus

    @Column({ type: "varchar", default: "PLN" })
    currency: string

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    totalNet: number

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    totalVat: number

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    totalGross: number

    // Backward compatibility or internal use
    @Column({ type: "integer", default: 0 })
    totalNetCents: number

    @Column({ type: "integer", default: 0 })
    totalVatCents: number

    @Column({ type: "integer", default: 0 })
    totalGrossCents: number

    @Column({ type: "varchar", nullable: true })
    nip: string

    @Column({ type: "varchar", nullable: true })
    ksefId: string

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

    @Column({ type: "varchar", nullable: true, default: "1" })
    sellerId: string

    @ManyToOne(() => CompanyProfile, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: "sellerId" })
    seller: CompanyProfile
}
