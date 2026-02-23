import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../../core/base.entity";
@Entity("inventory_batches")
export class InventoryBatch extends BaseEntity {
    @Column({ type: 'varchar' })
    productId;
    @Column({ type: 'varchar' })
    batchNumber;
    @Column("decimal", { precision: 10, scale: 2 })
    purchasePrice;
    @Column("int")
    originalQuantity;
    @Column("int")
    remainingQuantity;
    @Column({ type: 'date', nullable: true })
    expirationDate;
    @Column({ type: 'varchar', nullable: true })
    categoryId;
    // Helper to check if batch is depleted
    get isDepleted() {
        return this.remainingQuantity <= 0;
    }
}
