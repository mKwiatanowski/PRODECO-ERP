import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity("company_profile")
export class CompanyProfile {
    @PrimaryColumn({ type: "varchar" })
    id: string = "1"

    @Column({ type: "varchar", default: "" })
    name: string

    @Column({ type: "varchar", default: "" })
    nip: string

    @Column({ type: "varchar", default: "" })
    address: string

    @Column({ type: "varchar", default: "" })
    postalCode: string

    @Column({ type: "varchar", default: "" })
    city: string

    @Column({ type: "varchar", default: "" })
    bankAccountNumber: string

    @Column({ type: "varchar", default: "" })
    email: string

    @Column({ type: "varchar", default: "" })
    phone: string

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}
