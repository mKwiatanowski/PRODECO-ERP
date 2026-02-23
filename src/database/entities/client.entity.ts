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
    @Column({ type: "varchar" })
    name: string

    @Column({ type: "varchar", unique: true, nullable: true })
    nip: string

    @Column({ type: "varchar", nullable: true })
    phone: string

    @Column({ type: "varchar", nullable: true })
    address: string

    @Column({ type: "varchar", nullable: true })
    regon: string

    @Column({ type: "varchar", nullable: true })
    email: string

    @Column({ type: "varchar", default: "CUSTOMER" })
    type: string

    @Column({ type: "boolean", default: true })
    isActive: boolean

    @OneToMany(() => Invoice, (invoice) => invoice.client)
    invoices: Invoice[]
}
