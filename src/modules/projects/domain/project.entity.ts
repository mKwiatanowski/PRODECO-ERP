import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Project {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column({ type: 'varchar' })
    name: string

    @Column({ type: 'varchar' })
    clientName: string

    @Column({ type: 'varchar' })
    status: string // 'PLANNING', 'IN_PROGRESS', 'COMPLETED'

    @Column({ type: 'varchar' })
    assignedEmployeeId: string // Mocked for now

    // Store materials consumed as JSON snapshot
    @Column("simple-json")
    materialsUsed: {
        productId: string
        quantity: number
        cost: number
    }[]

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    totalMaterialCost: number

    @CreateDateColumn({ type: 'datetime' })
    createdAt: Date

    @UpdateDateColumn({ type: 'datetime' })
    updatedAt: Date
}
