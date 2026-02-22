import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Client {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar', nullable: true })
    nip: string

    @Column({ type: 'varchar', nullable: true })
    phone: string

    @Column({ type: 'varchar', nullable: true })
    address: string

    @Column({ type: 'varchar', default: 'CUSTOMER' }) // 'SUPPLIER' or 'CUSTOMER'
    type: string

    @Column({ type: 'boolean', default: true })
    isActive: boolean

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}
