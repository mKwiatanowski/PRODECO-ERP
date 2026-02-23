import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Dictionary {
    @PrimaryGeneratedColumn("uuid")
    id;
    @Column({ type: 'varchar' })
    category; // e.g., 'UNIT', 'MATERIAL_CATEGORY', 'TAX_RATE', 'SERVICE_TYPE'
    @Column({ type: 'varchar', nullable: true })
    code; // e.g., 'SZT', '23', 'M2'
    @Column({ type: 'varchar' })
    value; // e.g., 'szt.', '23%', 'm2', 'Rośliny'
    @Column({ type: 'boolean', default: false })
    isSystem; // True if it shouldn't be deleted by the user
    @CreateDateColumn({ type: 'datetime' })
    createdAt;
    @UpdateDateColumn({ type: 'datetime' })
    updatedAt;
}
