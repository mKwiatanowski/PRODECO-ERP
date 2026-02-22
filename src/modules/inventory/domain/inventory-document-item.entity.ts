import { Entity, Column, ManyToOne, JoinColumn } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"
import { InventoryDocument } from "./inventory-document.entity"

@Entity("inventory_document_items")
export class InventoryDocumentItem extends BaseEntity {
    @Column({ type: 'varchar' })
    documentId: string

    @ManyToOne(() => InventoryDocument, doc => doc.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document: InventoryDocument

    @Column({ type: 'varchar' })
    productId: string

    @Column("decimal", { precision: 10, scale: 2 })
    quantity: number

    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    price?: number // Optional for RW, required for PZ
}
