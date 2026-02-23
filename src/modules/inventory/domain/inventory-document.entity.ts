import { Entity, Column, OneToMany } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"
import { InventoryDocumentItem } from "./inventory-document-item.entity"

export enum DocumentType {
    PZ = "PZ", // Przyjęcie Zewnętrzne (Purchase)
    WZ = "WZ", // Wydanie Zewnętrzne (Sale/External)
    RW = "RW", // Rozchód Wewnętrzny (Internal Consumption/Project)
    PW = "PW", // Przyjęcie Wewnętrzne (Internal Receipt)
    INW = "INW" // Inwentaryzacja (Inventory Check)
}

@Entity("inventory_documents")
export class InventoryDocument extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    documentNumber: string

    @Column({ type: 'varchar' })
    type: DocumentType

    @Column({ type: 'date' })
    date: Date

    @Column({ type: 'varchar', nullable: true })
    referenceId?: string // e.g., Invoice ID or Project ID

    @Column({ type: 'varchar', nullable: true })
    contractor?: string

    @OneToMany(() => InventoryDocumentItem, item => item.document, { cascade: true })
    items: InventoryDocumentItem[]
}
