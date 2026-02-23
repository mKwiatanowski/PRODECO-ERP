import { Entity, Column } from "typeorm";
import { BaseEntity } from "../../core/base.entity";
@Entity("expenses")
export class Expense extends BaseEntity {
    @Column({ type: "varchar" })
    category;
    @Column({ type: "varchar", nullable: true })
    description;
    @Column({ type: "integer" })
    amountCents;
    @Column({ type: "datetime" })
    date;
}
