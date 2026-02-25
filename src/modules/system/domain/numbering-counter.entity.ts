import { Entity, Column } from "typeorm"
import { BaseEntity } from "../../../core/base.entity"

@Entity("numbering_counters")
export class NumberingCounter extends BaseEntity {
    @Column({ type: "varchar" })
    schemeId: string

    @Column({ type: "integer" })
    year: number

    @Column({ type: "integer", nullable: true })
    month: number

    @Column({ type: "integer", default: 0 })
    lastValue: number
}
