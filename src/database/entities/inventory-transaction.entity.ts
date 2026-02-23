import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../core/base.entity"

export enum InventoryTransactionType {
    PZ = "PZ",
    WZ = "WZ"
}

@Entity("inventory_transactions")
export class InventoryTransaction extends BaseEntity {
    @Column({
        type: "simple-enum",
        enum: InventoryTransactionType
    })
    type: InventoryTransactionType

    @Column({ type: "varchar" })
    productId: string

    @Column({ type: "decimal", precision: 10, scale: 2 })
    quantity: number

    @Column({ type: "varchar", nullable: true })
    invoiceId: string | null // Powiązanie z fakturą (opcjonalne dla ruchów wewnętrznych)

    @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
    costPrice?: number // Cena zakupu wyliczona przez FIFO (dla WZ)
}
