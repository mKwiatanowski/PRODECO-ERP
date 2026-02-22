import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"

@Entity("inventory_batches")
export class InventoryBatch extends BaseEntity {
    @Column({ type: 'varchar' })
    productId: string

    @Column({ type: 'varchar' })
    batchNumber: string

    @Column("decimal", { precision: 10, scale: 2 })
    purchasePrice: number

    @Column("int")
    originalQuantity: number

    @Column("int")
    remainingQuantity: number

    @Column({ type: 'date', nullable: true })
    expirationDate?: Date

    @Column({ type: 'varchar', nullable: true })
    categoryId?: string

    // Helper to check if batch is depleted
    get isDepleted(): boolean {
        return this.remainingQuantity <= 0
    }
}
