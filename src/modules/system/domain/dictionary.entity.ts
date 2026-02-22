import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Dictionary {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: 'varchar' })
    category: string // e.g., 'UNIT', 'MATERIAL_CATEGORY', 'TAX_RATE', 'SERVICE_TYPE'

    @Column({ type: 'varchar', nullable: true })
    code: string // e.g., 'SZT', '23', 'M2'

    @Column({ type: 'varchar' })
    value: string // e.g., 'szt.', '23%', 'm2', 'Rośliny'

    @Column({ type: 'boolean', default: false })
    isSystem: boolean // True if it shouldn't be deleted by the user

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}
