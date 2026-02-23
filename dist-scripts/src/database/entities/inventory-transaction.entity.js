import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
export var InventoryTransactionType;
(function (InventoryTransactionType) {
    InventoryTransactionType["PZ"] = "PZ";
    InventoryTransactionType["WZ"] = "WZ";
})(InventoryTransactionType || (InventoryTransactionType = {}));
@Entity("inventory_transactions")
export class InventoryTransaction extends BaseEntity {
    @Column({
        type: "simple-enum",
        enum: InventoryTransactionType
    })
    type;
    @Column({ type: "varchar" })
    productId;
    @Column({ type: "decimal", precision: 10, scale: 2 })
    quantity;
    @Column({ type: "varchar", nullable: true })
    invoiceId; // Powiązanie z fakturą (opcjonalne dla ruchów wewnętrznych)
}
