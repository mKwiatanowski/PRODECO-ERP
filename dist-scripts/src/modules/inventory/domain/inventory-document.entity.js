import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "../../../core/base.entity";
import { InventoryDocumentItem } from "./inventory-document-item.entity";
export var DocumentType;
(function (DocumentType) {
    DocumentType["PZ"] = "PZ";
    DocumentType["WZ"] = "WZ";
    DocumentType["RW"] = "RW";
    DocumentType["PW"] = "PW";
    DocumentType["INW"] = "INW"; // Inwentaryzacja (Inventory Check)
})(DocumentType || (DocumentType = {}));
@Entity("inventory_documents")
export class InventoryDocument extends BaseEntity {
    @Column({ type: 'varchar', unique: true })
    documentNumber;
    @Column({ type: 'varchar' })
    type;
    @Column({ type: 'date' })
    date;
    @Column({ type: 'varchar', nullable: true })
    referenceId; // e.g., Invoice ID or Project ID
    @OneToMany(() => InventoryDocumentItem, item => item.document, { cascade: true })
    items;
}
