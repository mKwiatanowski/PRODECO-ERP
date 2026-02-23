import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "../../../core/base.entity";
import { InventoryDocument } from "./inventory-document.entity";
@Entity("inventory_document_items")
export class InventoryDocumentItem extends BaseEntity {
    @Column({ type: 'varchar' })
    documentId;
    @ManyToOne(() => InventoryDocument, doc => doc.items, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'documentId' })
    document;
    @Column({ type: 'varchar' })
    productId;
    @Column("decimal", { precision: 10, scale: 2 })
    quantity;
    @Column("decimal", { precision: 10, scale: 2, nullable: true })
    price; // Optional for RW, required for PZ
}
