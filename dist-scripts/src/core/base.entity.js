import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
export class BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id;
    @CreateDateColumn({ type: 'datetime' })
    createdAt;
    @UpdateDateColumn({ type: 'datetime' })
    updatedAt;
}
