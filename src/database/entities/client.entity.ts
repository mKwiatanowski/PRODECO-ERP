import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../core/base.entity"
import { Invoice } from "./invoice.entity"

// Client types simplified for cross-module compatibility
export enum ClientType {
    FIRMA = "FIRMA",
    OSOBA_FIZYCZNA = "OSOBA_FIZYCZNA",
    CUSTOMER = "CUSTOMER",
    SUPPLIER = "SUPPLIER"
}

@Entity("clients")
export class Client extends BaseEntity {
    @Column({ type: "varchar", unique: true, nullable: true })
    clientNumber: string

    @Column({ type: "varchar" })
    name: string

    @Column({ type: "varchar", unique: true, nullable: true })
    nip: string

    @Column({ type: "varchar", nullable: true })
    shortName: string

    @Column({ type: "varchar", nullable: true })
    phone: string

    @Column({ type: "varchar", nullable: true })
    phoneNumber: string

    @Column({ type: "varchar", nullable: true })
    address: string

    @Column({ type: "varchar", nullable: true })
    street: string

    @Column({ type: "varchar", nullable: true })
    postalCode: string

    @Column({ type: "varchar", nullable: true })
    city: string

    @Column({ type: "varchar", nullable: true })
    regon: string

    @Column({ type: "varchar", nullable: true })
    email: string

    @Column({ type: "integer", default: 0 })
    paymentTermsDays: number

    @Column({ type: "decimal", precision: 12, scale: 2, default: 0 })
    creditLimit: number

    @Column({ type: "varchar", nullable: true })
    bankAccountNumber: string

    @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
    defaultDiscount: number

    @Column({ type: "varchar", default: "PLN" })
    currency: string

    @Column({ type: "text", nullable: true })
    shippingAddress: string

    @Column({ type: "varchar", default: "CUSTOMER" })
    type: string

    @Column({ type: "boolean", default: true })
    isActive: boolean

    @OneToMany(() => Invoice, (invoice) => invoice.client)
    invoices: Invoice[]
}
