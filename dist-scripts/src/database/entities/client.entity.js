import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
import { Invoice } from "./invoice.entity";
// Client types simplified for cross-module compatibility
export var ClientType;
(function (ClientType) {
    ClientType["FIRMA"] = "FIRMA";
    ClientType["OSOBA_FIZYCZNA"] = "OSOBA_FIZYCZNA";
    ClientType["CUSTOMER"] = "CUSTOMER";
    ClientType["SUPPLIER"] = "SUPPLIER";
})(ClientType || (ClientType = {}));
@Entity("clients")
export class Client extends BaseEntity {
    @Column({ type: "varchar" })
    name;
    @Column({ type: "varchar", unique: true, nullable: true })
    nip;
    @Column({ type: "varchar", nullable: true })
    phone;
    @Column({ type: "varchar", nullable: true })
    address;
    @Column({ type: "varchar", nullable: true })
    regon;
    @Column({ type: "varchar", nullable: true })
    email;
    @Column({ type: "varchar", default: "CUSTOMER" })
    type;
    @Column({ type: "boolean", default: true })
    isActive;
    @OneToMany(() => Invoice, (invoice) => invoice.client)
    invoices;
}
