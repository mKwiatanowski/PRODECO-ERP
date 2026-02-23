import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";
@Entity()
export class Project {
    @PrimaryGeneratedColumn("uuid")
    id;
    @Column({ type: 'varchar' })
    name;
    @Column({ type: 'varchar' })
    clientName;
    @Column({ type: 'varchar' })
    status; // 'PLANNING', 'IN_PROGRESS', 'COMPLETED'
    @Column({ type: 'varchar' })
    assignedEmployeeId; // Mocked for now
    // Store materials consumed as JSON snapshot
    @Column("simple-json")
    materialsUsed;
    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    totalMaterialCost;
    @CreateDateColumn({ type: 'datetime' })
    createdAt;
    @UpdateDateColumn({ type: 'datetime' })
    updatedAt;
}
