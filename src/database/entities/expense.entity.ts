import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../core/base.entity"

@Entity("expenses")
export class Expense extends BaseEntity {
    @Column({ type: "varchar" })
    category: string

    @Column({ type: "varchar", nullable: true })
    description: string

    @Column({ type: "integer" })
    amountCents: number

    @Column({ type: "datetime" })
    date: Date
}
