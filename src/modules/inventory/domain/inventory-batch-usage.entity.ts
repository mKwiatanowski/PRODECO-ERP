import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"

@Entity("inventory_batch_usages")
export class InventoryBatchUsage extends BaseEntity {
    @Column({ type: 'varchar' })
    batchId: string

    @Column({ type: 'varchar' })
    documentItemId: string

    @Column("decimal", { precision: 10, scale: 2 })
    quantity: number
}
